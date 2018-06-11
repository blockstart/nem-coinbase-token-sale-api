import { ObjectID } from 'mongodb';

/**
 * We store problem completed and problem transactions so we can
 * assist customers
 */
export const DB_PENDING_XEM_CHARGES = 'pendingXemCharges';
export const DB_COMPLETED_XEM_CHARGES = 'completedXemCharges';
export const DB_PARTIAL_XEM_CHARGES = 'partialXemCharges';
export const DB_PROBLEM_XEM_CHARGES = 'problemXemCharges';

/**
 * Used in the message field for mosaic transfers
 */
export const MESSAGE_PREFIX = 'c:';

/**
 * Change CHE with your own token Ticker
 */
export enum TokenType {
	XEM = 'XEM',
	CHE = 'CHE',
	NA = 'NA'
}

export interface XemTransaction {
	_id: ObjectID;
	tokenRecipientAddress: string;
	tokenType: TokenType;
	productId?: ObjectID;
	usdPaid?: number;
	quotedAmount?: number;
	totalPaid: number;
	transactionCompletedTimestamp?: string;
	message?: string;
	errMsg?: string;
	createdAt: Date;
}