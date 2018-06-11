import { Request, Response, Router } from 'express';
import { DB_PRODUCTS, Product } from 'model/product';
import { findAll } from 'utilities/mongodb-util';
import { KEY_TOKEN_RECIPIENT_ADDRESS, vPurchaseLookup } from 'utilities/validators';
import { coinbaseLookup } from 'model/coinbase-transaction';

export const product = ({ db }: { db: any }) => {
	const api: Router = Router();

	/**
	 * Tokens are sold in packages - we store them as products
	 * This function returns all products
	 */
	api.get('/all', async (req: Request, res: Response) => {
		try {
			res.send(await findAll<Product>(DB_PRODUCTS));
		} catch (err) {
			res.status(409).json(err);
		}
	});

	/**
	 * Coinbase orders can be looked up by the token address so problems
	 * can be identified
	 */
	api.get('/purchase-lookup-coinbase/:tokenRecipientAddress', vPurchaseLookup, async (req: Request, res: Response) => {
		try {
			res.send(await coinbaseLookup(req.params[KEY_TOKEN_RECIPIENT_ADDRESS]));
		} catch (err) {
			res.status(409).json({error: 'No data found for this Address'});
		}
	});

	return api;
};
