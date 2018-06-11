import { ObjectID } from 'mongodb';

export const DB_PRODUCTS = 'products';

export interface Product {
	_id: ObjectID;
	priceUSD: number;
	tokenAmount: number;
	coinbaseProductId?: string;
	isEnabled: boolean;
}