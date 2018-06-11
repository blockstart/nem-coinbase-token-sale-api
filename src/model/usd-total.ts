import { ObjectID } from 'mongodb';

export const DB_USD_TOTALS = 'usdTotals';

export interface UsdTotal {
	_id: ObjectID;
	currentRaised: number;
	nextMilestone: number;
}