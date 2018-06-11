import { DB_PRODUCTS, Product } from 'model/product';
import { ObjectID } from 'mongodb';
import { onChargeSuccess } from 'services/purchase-service';
import { coinbaseTokenPurchaseDescription, stEndUser } from 'utilities/error-manager';
import { deleteById, findAll, findById, saveWithId } from 'utilities/mongodb-util';
import {
	DB_COMPLETED_COINBASE_TRANSACTIONS,
	DB_PROBLEM_COINBASE_CHARGES,
	DB_PENDING_COINBASE_CHARGES,
	CoinbaseCharge,
	CoinbaseStatus,
} from 'model/coinbase-transaction';
import { Address } from 'nem-library';
import { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { sleep, timeElapsedInSeconds } from 'utilities/tools-util';

export const initCoinbase = () => {
	checkPendingTransactions();
};

/**
 * We talk to the Coinbase Commerce API to initiate a purchase. The user then has 15
 * minutes to complete the purchase before it is canceled. We do NOT use the Coinbase Commerce
 * products feature - charges are created dynamically from this API.
 * You must have a Coinbase Commerce account and API key to use this.
 * @param {Address} tokenRecipientAddress The address to send the tokens to
 * @param {string} productId The productId of the product chosen on the website
 * @returns {string} Returns the Coinbase checkout URL
 */
export const createCoinbaseCharge = (tokenRecipientAddress: string, productId: string): Promise<string> => {
	return new Promise<string>(async (resolve, reject) => {
		try {
			const product: Product = await findById<Product>(DB_PRODUCTS, productId);
			const newCharge: CoinbaseCharge = {
				name: stEndUser.COINBASE_TOKEN_PURCHASE_NAME,
				description: coinbaseTokenPurchaseDescription(product),
				local_price: {
					amount: `${product.priceUSD}`,
					currency: 'USD'
				},
				pricing_type: 'fixed_price',
				metadata: {
					token_product_id: `${product._id}`,
					token_recipient_address: `${tokenRecipientAddress}`
				}
			};
			const config: AxiosRequestConfig = {
				url: 'https://api.commerce.coinbase.com/charges',
				method: 'post',
				headers: {
					'Content-Type': 'application/json',
					'X-CC-Api-Key': `${process.env.COINBASE_API_KEY}`,
					'X-CC-Version': '2018-03-22'
				},
				data: newCharge
			};
			const json: any = await axios(config);
			const coinbaseCharge: CoinbaseCharge = json.data.data as CoinbaseCharge;
			coinbaseCharge._id = new ObjectID();
			await saveWithId<CoinbaseCharge>(DB_PENDING_COINBASE_CHARGES, coinbaseCharge);
			resolve(coinbaseCharge.hosted_url);
		} catch (err) {
			console.log(err);
			reject(err);
		}
	});
};

/**
 * Every 10 seconds iterate through pending charges. Clear out failed or canceled
 * and then process completed transactions. Currently we do not automatically handle
 * delayed or under payment transactions. Those should be handled in the Coinbase Commerce portal.
 * When they are marked as "Resolved" in Coinbase Commerce they will need to be manually moved
 * from the problems database into the completed database
 *
 * This function is critical - this is how we know when to transfer tokens to a customer
 */
export const checkPendingTransactions = async () => {
	try {
		const charges = await findAll<CoinbaseCharge>(DB_PENDING_COINBASE_CHARGES);
		if (charges) {
			if (charges.length > 0) {
				for (const charge of charges) {
					fetchCharge(charge);
				}
			}
		}
	} catch (err) {}
	await sleep(10000);
	checkPendingTransactions();
};

/**
 * Talk to Coinbase Commerce API to lookup a transaction and see if
 * there are any changes in its status
 * @param {CoinbaseCharge} localCharge
 */
const fetchCharge = (localCharge: CoinbaseCharge) => {
	/**
	 * Skip all pending charges that are not at least 3 minutes old
	 * because we know it will take longer than that for Coinbase to process
	 */
	if (!localCharge.code) return;
	const seconds = timeElapsedInSeconds(localCharge.created_at);
	if (seconds < 180) return;

	const config: AxiosRequestConfig = {
		url: `https://api.commerce.coinbase.com/charges/${localCharge.code}`,
		method: 'get',
		headers: {
			'X-CC-Api-Key': `${process.env.COINBASE_API_KEY}`,
			'X-CC-Version': '2018-03-22'
		}
	};

	axios(config)
		.then(async (response: any) => {
			await processTransaction(response.data.data as CoinbaseCharge, localCharge);
		})
		.catch(function (error) {
			console.log(error);
		});
};

/**
 * Handle problems, then process transfer of any tokens. Move all transactions into their
 * respective database collection
 *
 * @param {CoinbaseCharge} charge
 * @param {CoinbaseCharge} localCharge
 * @returns {Promise<void>}
 */
const processTransaction = async (charge: CoinbaseCharge, localCharge: CoinbaseCharge) => {
	/**
	 * A length of 1 means the Status is NEW. We can skip these
	 */
	if (charge.timeline.length < 2) return;

	for (const event of charge.timeline) {
		switch (event.status) {
			/**
			 * Handle the problems first
			 */
			case CoinbaseStatus.EXPIRED:
			case CoinbaseStatus.UNRESOLVED: {
				/**
				 * We are going to move this data into a new db collection, but first we
				 * need to carry over important data
				 */

				// Save problem to the problems collection
				charge._id = new ObjectID();
				saveWithId<CoinbaseCharge>(DB_PROBLEM_COINBASE_CHARGES, charge).then().catch();

				// Remove the problem transaction from the pending transactions
				// Find the existing pending charge in the database
				deleteById<CoinbaseCharge>(DB_PENDING_COINBASE_CHARGES, localCharge._id).then().catch();
				break;
			}
			case CoinbaseStatus.COMPLETED: {
				/**
				 * Initiate token transfer process
				 * Save success transaction to success collection
				 * Delete pending transaction
				 */
				const product: Product = await findById<Product>(DB_PRODUCTS, charge.metadata.token_product_id);
				if (product) {
					onChargeSuccess(product.tokenAmount, charge.metadata.token_recipient_address).then().catch((err) => {
						console.log(err);
					});
					saveWithId<CoinbaseCharge>(DB_COMPLETED_COINBASE_TRANSACTIONS, charge).then().catch();
				}

				deleteById<CoinbaseCharge>(DB_PENDING_COINBASE_CHARGES, localCharge._id).then().catch();
			}
		}
	}
};