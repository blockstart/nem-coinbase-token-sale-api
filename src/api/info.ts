import { Request, Response, Router } from 'express';
import { DB_USD_TOTALS, UsdTotal } from 'model/usd-total';
import { findAll, saveWithId, update } from 'utilities/mongodb-util';
import { precisionRound } from 'utilities/tools-util';
import { ObjectID } from 'mongodb';

export const info = ({ db }: { db: any }) => {
	const api: Router = Router();

	/**
	 * Use this endpoint to fetch how many tokens have been sold
	 */
	api.get('/tokens-sold', async (req: Request, res: Response) => {
		try {
			const usdTotals: Array<UsdTotal> = await findAll<UsdTotal>(DB_USD_TOTALS);
			if (req.query.currency === 'usd' && usdTotals.length > 0) {
				return res.send({amount: precisionRound(usdTotals[0].currentRaised, 2), milestone: usdTotals[0].nextMilestone });
			}
			res.status(409).json({ message: 'object or parameter not found.'});
		} catch (err) {
			res.status(409).json(err);
		}
	});

	/**
	 * This endpoint manually updates the amount raised in USD. Because there are
	 * so many influencing factors on tokens coming in and out we manually calculate
	 * revenue progress and update it
	 */
	api.put('/update-usd', async (req: Request, res: Response) => {
		try {
			const totals: Array<UsdTotal> = await findAll<UsdTotal>(DB_USD_TOTALS);
			if (totals.length === 0) {
				const total: UsdTotal = {
					_id: new ObjectID(),
					currentRaised: req.body.currentRaised,
					nextMilestone: req.body.nextMilestone
				};
				await saveWithId<UsdTotal>(DB_USD_TOTALS, total);
			} else {
				totals[0].currentRaised = precisionRound(req.body.currentRaised, 2);
				totals[0].nextMilestone = precisionRound(req.body.nextMilestone, 2);
				const id = totals[0]._id.toHexString();
				delete totals[0]._id;
				await update<UsdTotal>(DB_USD_TOTALS, id, totals[0]);
			}
			return res.status(202).json({message: 'ok'});
		} catch (err) {
			res.status(409).json(err);
		}
	});

	return api;
};
