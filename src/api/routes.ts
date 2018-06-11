import { info } from 'api/info';
import { kyc } from 'api/kyc';
import { product } from 'api/product';
import { initNEM } from 'services/nem-service';
import getDb from '../server/db';
import { transaction } from 'api/transaction';
import { initCoinbase } from 'services/coinbase-service';

export const routes = (router: any) => {
	const db = getDb();
	initNEM();
	initCoinbase();
	router.use('/transaction', transaction({ db }));
	router.use('/product', product({ db }));
	router.use('/info', info({ db }));
	router.use('/kyc', kyc({ db }));

	return router;
};