import { DB_PRODUCTS, Product } from 'model/product';
import {
	DB_COMPLETED_XEM_CHARGES,
	DB_PARTIAL_XEM_CHARGES,
	DB_PENDING_XEM_CHARGES,
	DB_PROBLEM_XEM_CHARGES,
	MESSAGE_PREFIX,
	TokenType,
	XemTransaction } from 'model/xem-transaction';
import { ObjectID } from 'mongodb';
import { Request } from 'express';
import {
	Address,
	NEMLibrary,
	NetworkTypes,
	ConfirmedTransactionListener,
	Transaction,
	TransactionTypes,
	MultisigTransaction,
	TransferTransaction,
	PlainMessage } from 'nem-library';
import { onChargeSuccess } from 'services/purchase-service';
import { TRANSACTION_MESSAGE_LENGTH } from 'utilities/constants';
import { tokenHoldingAccountAddress, usdToXem, xemToUsd } from 'utilities/nem-util';
import { generateHashId, precisionRound } from 'utilities/tools-util';
import { findById, saveWithId, deleteById, findOneThatContains } from 'utilities/mongodb-util';
const nemConfig = require('../../nem-config.json');
let NEM_NETWORK = NetworkTypes.TEST_NET;

/**
 * Filters a list of Transactions and only returns transactions of type Transfer
 * @param {Transaction} transaction
 * @returns {boolean} isTransferTransaction
 */
const transferFilter = (transaction: Transaction): boolean => {
	if (transaction.type == TransactionTypes.TRANSFER) {
		return true;
	} else if (transaction.type == TransactionTypes.MULTISIG && (transaction as MultisigTransaction).otherTransaction.type == TransactionTypes.TRANSFER) {
		return true;
	}
	return false;
};

/**
 * Parses through list of transactions and casts them to TransferTransactions so we
 * can have access to important transfer details
 * @param {Transaction} transaction
 * @returns {TransferTransaction}
 */
const mapTransfer = (transaction: Transaction): TransferTransaction => {
	if (transaction.type == TransactionTypes.TRANSFER) {
		return transaction as TransferTransaction;
	} else if (transaction.type == TransactionTypes.MULTISIG && (transaction as MultisigTransaction).otherTransaction.type == TransactionTypes.TRANSFER) {
		return (transaction as MultisigTransaction).otherTransaction as TransferTransaction;
	}
	throw new Error('Transaction does not contain TransferTransaction');
};

const movePendingTransaction = (transaction: XemTransaction): XemTransaction => {
		if (transaction.totalPaid > 0) {
			const partialId = transaction._id.toHexString();
			transaction._id = new ObjectID();
			transaction.createdAt = new Date();
			saveWithId<XemTransaction>(DB_PENDING_XEM_CHARGES, transaction);
			deleteById<XemTransaction>(DB_PARTIAL_XEM_CHARGES, partialId);
		}
		return transaction;
};

/**
 * Pending transaction found, now process the payment and give access to product if needed
 * @param {XEMTransaction} transaction
 * @param {TransferTransaction} transfer
 * @returns {Promise<void>}
 */
 const onTransactionConfirmed = (transaction: XemTransaction, transfer: XemTransaction): Promise<any> => {
	return new Promise<any>(async (resolve, reject) => {
		const pendingTransaction = movePendingTransaction(transaction);
		try {
			const totalPaid = transfer.totalPaid;
			const pendingId = pendingTransaction._id.toHexString();
			pendingTransaction._id = new ObjectID();
			if (!pendingTransaction.productId || (transfer.tokenType !== TokenType.XEM)) {
				const err = new Error('Product Id not found in transaction or XEM was not sent');
				pendingTransaction.errMsg = err.message;
				await saveWithId<XemTransaction>(DB_PROBLEM_XEM_CHARGES, pendingTransaction);
				await deleteById<XemTransaction>(DB_PENDING_XEM_CHARGES, pendingId);
				return reject(err);
			}
			pendingTransaction.totalPaid += totalPaid;
			pendingTransaction.usdPaid += transfer.usdPaid;
			if (pendingTransaction.totalPaid >= pendingTransaction.quotedAmount) {
				const product: Product = await findById<Product>(DB_PRODUCTS, pendingTransaction.productId.toHexString());
				pendingTransaction.transactionCompletedTimestamp = new Date().toISOString();
				onChargeSuccess(
					product.tokenAmount,
					pendingTransaction.tokenRecipientAddress);
				await saveWithId<XemTransaction>(DB_COMPLETED_XEM_CHARGES, pendingTransaction);
			} else {
				await saveWithId<XemTransaction>(DB_PARTIAL_XEM_CHARGES, pendingTransaction);
			}
			resolve(await deleteById<XemTransaction>(DB_PENDING_XEM_CHARGES, pendingId));
		} catch (err) {
			const pendingId = pendingTransaction._id.toHexString();
			pendingTransaction._id = new ObjectID();
			pendingTransaction.errMsg = err;
			await saveWithId<XemTransaction>(DB_PROBLEM_XEM_CHARGES, pendingTransaction);
			await deleteById<XemTransaction>(DB_PENDING_XEM_CHARGES, pendingId);
			reject(err);
		}
	});
};

/**
 * If someone sends XEM to our Address OUTSIDE of our purchase process we store the details
 * so we can know how to handle the situation when the customer reaches out to us
 * @param {XemTransaction} transaction
 * @returns {Promise<any>}
 */
 const saveAnonymousTransaction = (transaction: XemTransaction): Promise<any> => {
	return new Promise<any>(async (resolve, reject) => {
		try {
			transaction.errMsg = 'Anonymous transaction';
			await saveWithId<XemTransaction>(DB_PROBLEM_XEM_CHARGES, transaction);
			resolve();
		} catch (err) {
			transaction.errMsg = 'Anonymous transaction + err: ' + err;
			await saveWithId<XemTransaction>(DB_PROBLEM_XEM_CHARGES, transaction);
			reject(err);
		}
	});
};

/**
 * Store information in the database so we can connect incoming transactions
 * to intended purchases
 * @param {e.Request} req
 * @returns {Promise<any>}
 */
export const initiateXEMPurchaseHandler = (req: Request): Promise<any> => {
	return new Promise<any>(async (resolve, reject) => {
		try {
			const senderAddress = new Address(req.body.tokenRecipientAddress).plain();
			const createdDate = new Date();
			const hashId = await generateHashId(senderAddress, createdDate.toISOString());
			const product = await findById<Product>(DB_PRODUCTS, req.body.productId);
			const quotedAmount = await usdToXem(product.priceUSD);
			const data: XemTransaction = {
				_id: new ObjectID(),
				tokenRecipientAddress: senderAddress,
				tokenType: req.body.tokenType,
				productId: product._id,
				totalPaid: 0,
				quotedAmount: precisionRound(quotedAmount * 1e6, 0),
				usdPaid: 0,
				message: MESSAGE_PREFIX + hashId,
				createdAt: createdDate
			};
			await saveWithId<XemTransaction>(DB_PENDING_XEM_CHARGES, data);
			resolve({tokenRecipientAddress: tokenHoldingAccountAddress(), message: data.message, usdValue: product.priceUSD, xemAmount: precisionRound(quotedAmount, 6)});
		} catch (err) {
			reject(err);
		}
	});
};

/**
 * Format incoming transactions so we can know where to send and persist them
 * @param {TransferTransaction} transaction
 * @returns {Promise<XemTransaction>}
 */
const formatIncomingTransaction = (transaction: TransferTransaction): Promise<XemTransaction> => {
	return new Promise<XemTransaction>(async (resolve, reject) => {
		try {
			let tokenType = TokenType.NA;
			let paid = 0;
			let usdPaid = 0;
			/**
			 * This first part is a safeguard - it means someone sent a Mosaic token
			 * instead of XEM. Handle these scenario accordingly
			 */
			if (transaction.containsMosaics()) {
				transaction.mosaics().map(mosaic => {
					if (mosaic.mosaicId.namespaceId === nemConfig.mosaicNamespace
						&& mosaic.mosaicId.name === nemConfig.mosaicForTransfer) {
						tokenType = TokenType.CHE;
						paid += mosaic.quantity;
					}
				});
			} else {
				/**
				 * Someone sent XEM
				 */
				tokenType = TokenType.XEM;
				paid = transaction.xem().amount * 1e6;
				usdPaid = await xemToUsd(paid);
			}
			const formmatedTransaction: XemTransaction = {
				_id: new ObjectID(),
				tokenRecipientAddress: transaction.signer.address.plain(),
				tokenType: tokenType,
				totalPaid: paid,
				usdPaid: usdPaid,
				createdAt: new Date()
			};
			if (transaction.message) {
				formmatedTransaction.message = (transaction.message as PlainMessage).plain().replace(/ /g, '');
			}
			resolve(formmatedTransaction);
		} catch (err) {
			reject(err);
		}
	});
};

/**
 * Initializer for NEMLibrary. Only called once
 */
export const initNEM = () => {
	NEM_NETWORK = process.env.NODE_ENV === 'production' ? NetworkTypes.MAIN_NET : NetworkTypes.TEST_NET;
	const TOKEN_HOLDING_ADDRESS = tokenHoldingAccountAddress();
	NEMLibrary.bootstrap(NEM_NETWORK);
	/**
	 * Even though initNEM is only called once, this transaction listener
	 * will capture all confirmed transactions on the NEM blockchain
	 */
	new ConfirmedTransactionListener()
		.given(new Address(TOKEN_HOLDING_ADDRESS))
		.filter(transferFilter)
		.map(mapTransfer)
		// Next batch of confirmed transactions
		.map( async (transferTransaction: TransferTransaction) => {
			try {
				const rawMsg = (transferTransaction.message as PlainMessage).plain().replace(/ /g, '');
				const hashId = rawMsg.substr(rawMsg.indexOf(':'), rawMsg.length);

				/**
				 * Try finding a transaction in the database that may be a partial payment. Sometimes people will send
				 * multiple amounts of XEM to purchase a product
				 */
				let transaction: XemTransaction = await findOneThatContains<XemTransaction>(DB_PARTIAL_XEM_CHARGES, 'message', hashId, TRANSACTION_MESSAGE_LENGTH);
				/**
				 * If it is not partial, we look up pending charges
				 */
				if (!transaction) {
					transaction = await findOneThatContains<XemTransaction>(DB_PENDING_XEM_CHARGES, 'message', hashId, TRANSACTION_MESSAGE_LENGTH);
				}
				const transfer = await formatIncomingTransaction(transferTransaction);

				/**
				 * Ignore transactions that are confirmed for the holding account - we only want to
				 * listen for customer transactions
				 */
				if (transfer.tokenRecipientAddress === tokenHoldingAccountAddress()
					|| transfer.tokenRecipientAddress === nemConfig.multisigAddress) {
					return;
				}

				/**
				 * If the transaction is not in the database someone sent us XEM without using
				 * our purchase process on the website
				 */
				if (!transaction) {
					saveAnonymousTransaction(transfer);
				} else {
					/**
					 * We found the pending transaction in the database
					 */
					onTransactionConfirmed(transaction, transfer);
				}
			} catch (err) {
				/**
				 * Save errors to the database so we can handle customer inquiries
				 */
				const amountPaid = transferTransaction.xem().amount;
				const errorTrans: XemTransaction = {
					_id: new ObjectID(),
					tokenRecipientAddress: transferTransaction.signer.address.plain(),
					tokenType: TokenType.NA,
					totalPaid: amountPaid,
					message: 'Contains mosaics: ' + transferTransaction.containsMosaics(),
					createdAt: new Date(),
					errMsg: err
				};
				await saveWithId<XemTransaction>(DB_PROBLEM_XEM_CHARGES, errorTrans);
			}
		})
			.subscribe( _ => {}, err => {
			console.log(err);
		});
};