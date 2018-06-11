import { Request, Response, Router } from 'express';
import { DB_PRODUCTS, Product } from 'model/product';
import { createCoinbaseCharge } from 'services/coinbase-service';
import { initiateXEMPurchaseHandler } from 'services/nem-service';
import { findById } from 'utilities/mongodb-util';
import {
	KEY_PRODUCT_ID,
	KEY_TOKEN_RECIPIENT_ADDRESS, vInitateCoinbasePurchase,
	vInitiateXEMPurchase
} from 'utilities/validators';

export const transaction = ({ db }: { db: any }) => {
	const api: Router = Router();

	/**
	 * Starts the purchasing process with XEM
	 */
	api.post('/initiate-xem-purchase', vInitiateXEMPurchase, async (req: Request, res: Response) => {
		try {
			const product = await findById<Product>(DB_PRODUCTS, req.body[KEY_PRODUCT_ID]);
			if (!product.isEnabled) { return res.status(409).json(new Error('Product temporarily locked.')); }
			res.send(await initiateXEMPurchaseHandler(req));
		} catch (err) {
			res.status(409).json(err);
		}
	});

	/**
	 * Starts the purchasing process with Coinbase
	 */
	api.post('/initiate-coinbase-purchase', vInitateCoinbasePurchase, async (req: Request, res: Response) => {
		try {
			const product = await findById<Product>(DB_PRODUCTS, req.body[KEY_PRODUCT_ID]);
			if (!product.isEnabled) { return res.status(409).json(new Error('Product temporarily locked.')); }
			res.send(await createCoinbaseCharge(req.body[KEY_TOKEN_RECIPIENT_ADDRESS], req.body[KEY_PRODUCT_ID]));
		} catch (err) {
			res.status(409).json(err);
		}
	});

	return api;
};
