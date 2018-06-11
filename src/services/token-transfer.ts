import { TokenTransfer } from 'model/token-transfer';
import { DB_PRODUCTS, Product } from 'model/product';
import {
	Address,
	TimeWindow,
	MosaicId,
	Account,
	SimpleWallet,
	Password,
	TransactionHttp,
	TransferTransaction,
	MosaicHttp,
	EmptyMessage,
	NemAnnounceResult,
} from 'nem-library';
import { Observable } from 'rxjs';
import { Email, sendEmail } from 'services/email/email-service';
import { postTokenPurchaseNotification } from 'services/ifttt-service';
import { FIVE_MILLION } from 'utilities/constants';
import { findOneByProp, update } from 'utilities/mongodb-util';
const emailCreds = require('../services/email/emailCreds.json');

const fs = require('fs');
const nemConfig = require('../../nem-config.json');

/**
 * Transfer token to address. This function is called after successful payment
 * from customer
 * @param {string} address Address of the incoming request
 * @param {number} tokenAmount amount to transfer
 */
export const initiateTokenTransfer = async (tokenAmount: number, address: string) => {
	try {
		const transfer: TokenTransfer = {
			toAddress: new Address(address),
			signer: loadHoldingAccount(),
			tokenAmount: tokenAmount * 1e6,
			mosaicId: new MosaicId(nemConfig.mosaicNamespace, nemConfig.mosaicForTransfer)
		};
		await transferMosaics(transfer);
		if (process.env.NODE_ENV === 'production') {
			postTokenPurchaseNotification(tokenAmount.toLocaleString());
		}
		if (tokenAmount === FIVE_MILLION) {
			fiveMillionTokenAction(tokenAmount, address);
		}
	} catch (err) {
		const email: Email = emailCreds.xemSuccesServerErrorEmail;
		email.html = `Payment was successful, but failed sending tokens. ERROR: ${err} \n address: ${address} \n token amount: ${tokenAmount}`;
		sendEmail(email);
	}
};

/**
 * Due to many requests from token purchasers we have a flagging system
 * that will disable the 5 million package after it has been purchased. A team
 * member must turn this package back on. This helps prevents big purchasers from
 * draining the entire supply. It also sends an email to the team to let us know
 * @param {number} tokenAmount
 * @param {string} address
 * @returns {Promise<any>}
 */
const fiveMillionTokenAction = (tokenAmount: number, address: string): Promise<any> => {
	return new Promise<any>(async (resolve, reject) => {
		try {
			const email: Email = emailCreds.fiveMillionPurchasedEmail;
			email.html = `Check transaction and token balance. \n address: ${address} \n token amount: ${tokenAmount}`;
			sendEmail(email);
			const product = await findOneByProp<Product>(DB_PRODUCTS, 'tokenAmount', FIVE_MILLION);
			const id = product._id.toHexString();
			product.isEnabled = false;
			delete product._id;
			await update<Product>(DB_PRODUCTS, id, product);
			resolve();
		} catch (err) {
			reject(err);
		}
	});
};

/**
 * We have a holding NEM account which stores enough of the token for that day's purchases
 * The wallet and its signing key is stored on the file system so transactions can be automatically processed
 * @returns {Account}
 */
const loadHoldingAccount = (): Account => {
	try {
		const contents = fs.readFileSync(nemConfig.walletPath);
		const wallet = SimpleWallet.readFromNanoWalletWLF(contents);
		const pass = new Password(nemConfig.walletPassword);
		return wallet.open(pass);
	} catch (err) {
		console.log(err);
	}
};

/**
 * Transfers one or more mosaics from holding account to purchaser account
 * @param {TokenTransfer} tokenTransfer
 * @returns {Promise<NemAnnounceResult>}
 */
export const transferMosaics = (tokenTransfer: TokenTransfer): Promise<NemAnnounceResult> => {
	return new Promise<NemAnnounceResult>((resolve, reject) => {
		const transactionHttp = new TransactionHttp();
		const mosaicHttp = new MosaicHttp();
		Observable.from([
			mosaicHttp.getMosaicTransferableWithAmount(tokenTransfer.mosaicId, tokenTransfer.tokenAmount / 1e6)])
			.flatMap(transfer => transfer)
			.toArray()
			.map(mosaics => TransferTransaction.createWithMosaics(
				TimeWindow.createWithDeadline(),
				tokenTransfer.toAddress,
				mosaics,
				EmptyMessage))
			.map(transaction => tokenTransfer.signer.signTransaction(transaction))
			.flatMap(signed => transactionHttp.announceTransaction(signed))
			.subscribe(result => {
				resolve(result);
			}, error => {
				reject(error);
			});
	});
};
