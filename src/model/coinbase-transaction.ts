import { ObjectID } from 'mongodb';
import { findAll } from 'utilities/mongodb-util';
import { Address } from 'nem-library';

export const DB_COMPLETED_COINBASE_TRANSACTIONS = 'completedCoinbaseTransactions';
export const DB_PENDING_COINBASE_CHARGES = 'pendingCoinbaseCharges';
export const DB_PROBLEM_COINBASE_CHARGES = 'problemCoinbaseCharges';

export enum CoinbaseWebhookStatus {
	confirmed = 'CONFIRMED',
	pending = 'NEW'
}
export enum CoinbaseStatus {
	NEW = 'NEW',
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	EXPIRED = 'EXPIRED',
	UNRESOLVED = 'UNRESOLVED',
	RESOLVED = 'RESOLVED'
}
export enum CoinbaseUnresolved {
	UNDERPAID = 'UNDERPAID',
	OVERPAID = 'OVERPAID',
	DELAYED = 'DELAYED',
	MULTIPLE = 'MULTIPLE',
	MANUAL = 'MANUAL',
	OTHER = 'OTHER'
}
export enum CryptoType {
	ETH = 'ETH',
	BTC = 'BTC',
	BCH = 'BCH',
	LTC = 'LTC',
	USD = 'USD'
}
export interface  CoinbaseProduct {
	coinbaseProductId: string;
}
export interface  PrimaryPaymentValue {
	amount: string;
	currency: CryptoType;
}
export interface LocalPrimaryPaymentValue {
	amount: string;
	currency: CryptoType;
}
export interface CoinbasePurchaseEvent {
	_id: ObjectID;
	status: CoinbaseWebhookStatus;
	product: CoinbaseProduct;
	order_code: string;
	primary_payment_value: PrimaryPaymentValue;
	local_primary_payment_value: LocalPrimaryPaymentValue;
}
export interface CoinbaseTimeline {
	time: string;
	status: CoinbaseStatus;
	context?: CoinbaseUnresolved;
}
export interface CoinbaseCharge {
	_id?: ObjectID;
	name: string;
	description: string;
	local_price: any;
	pricing_type: string;
	metadata: any;
	code?: string;
	logo_url?: string;
	hosted_url?: string;
	created_at?: string;
	expires_at?: string;
	timeline?: Array<CoinbaseTimeline>;
	pricing?: any;
	payments?: Array<any>;
	addresses?: any;
}

export interface CoinbaseLookup {
	completed: Array<CoinbaseCharge>;
	problems: Array<CoinbaseCharge>;
	pending: Array<CoinbaseCharge>;
}

/**
 * Helper function to filter Coinbase orders by token recipient address
 * @param {Array<CoinbaseCharge>} charges
 * @param {string} address
 * @returns {Array<CoinbaseCharge>}
 */
export const filterChargesByAddress = (charges: Array<CoinbaseCharge>, address: string): Array<CoinbaseCharge> => {
	return charges.filter((charge: CoinbaseCharge) => {
		const addressB = new Address(charge.metadata.token_recipient_address).plain();
		return address === addressB;
	});
};

/**
 * Grab Coinbase transactions for the lookup function on the client
 * @param {string} xemOrTokenAddress
 * @returns {Promise<CoinbaseLookup>}
 */
export const coinbaseLookup = (xemOrTokenAddress: string): Promise<CoinbaseLookup> => {
	return new Promise<CoinbaseLookup>(async (resolve, reject) => {
		try {
			const allCompleted = await findAll<CoinbaseCharge>(DB_COMPLETED_COINBASE_TRANSACTIONS);
			const allProblems = await findAll<CoinbaseCharge>(DB_PROBLEM_COINBASE_CHARGES);
			const allPending = await findAll<CoinbaseCharge>(DB_PENDING_COINBASE_CHARGES);
			const address = new Address(xemOrTokenAddress).plain();
			const filterCompleted = filterChargesByAddress(allCompleted, address);
			const filterProblems = filterChargesByAddress(allProblems, address);
			const filterPending = filterChargesByAddress(allPending, address);
			const results: CoinbaseLookup = {
				completed: filterCompleted,
				problems: filterProblems,
				pending: filterPending
			};
			resolve(results);
		} catch (err) {
			reject(err);
		}
	});
};