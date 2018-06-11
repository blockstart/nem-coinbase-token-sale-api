import { ObjectID } from 'mongodb';
import { Product } from '../../src/model/product';

export const product1: Product = {
	_id : new ObjectID('5b07b13406d7eb88fe233eb1'),
	priceUSD : 45.0,
	tokenAmount : 2500,
	isEnabled: true
};

export const product2: Product = {
	_id : new ObjectID('5b07b1b506d7eb88fe233eb2'),
	priceUSD : 180.0,
	tokenAmount : 10000,
	isEnabled: true
};

export const product3: Product = {
	_id : new ObjectID('5b07b20f06d7eb88fe233eb3'),
	priceUSD : 900.0,
	tokenAmount : 50000,
	isEnabled: true
};

export const product4: Product = {
	_id : new ObjectID('5b07b25606d7eb88fe233eb4'),
	priceUSD : 9000.0,
	tokenAmount : 500000,
	isEnabled: true
};

export const product5: Product = {
	_id : new ObjectID('5b07b2a406d7eb88fe233eb5'),
	priceUSD : 90000.0,
	tokenAmount : 5000000,
	isEnabled: true
};
