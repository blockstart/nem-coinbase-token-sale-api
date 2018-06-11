import axios, { AxiosRequestConfig } from 'axios';
import { AccountHttp, Mosaic, SimpleWallet, Address } from 'nem-library';
import {
	CHE_TOTAL_QUANTITY, SUPPLY_RELATED_ADJUSTMENT, URL_COIN_CAP_XEM_USD_VALUE, XEM_MARKET_CAP } from 'utilities/constants';
import { precisionRound } from 'utilities/tools-util';

const fs = require('fs');
const nemConfig = require('../../nem-config.json');

/**
 * Get USD Value for 1 XEM
 * @returns {Promise<number>}
 */
const xemUSDValue = (): Promise<string> => {
	return new Promise<string>(async (resolve, reject) => {
		try {
			const config: AxiosRequestConfig = {
				url: URL_COIN_CAP_XEM_USD_VALUE,
				method: 'get',
				headers: { 'Content-Type': 'application/json' }
			};
			const json: any = await axios(config);
			resolve(json.data.data.quotes.USD.price);
		} catch (err) {
			reject(err);
		}
	});
};

export const usdToXem = (priceUSD: number): Promise<number> => {
	return new Promise<number>(async (resolve, reject) => {
		try {
			const usdStr = await xemUSDValue();
			const usdVal = parseFloat(usdStr);
			resolve(precisionRound((priceUSD / usdVal), 6));
		} catch (err) {
			reject(err);
		}
	});
};

export const xemToUsd = (xemAmount: number): Promise<number> => {
	return new Promise<number>(async (resolve, reject) => {
		try {
			const usdStr = await xemUSDValue();
			const usdVal = parseFloat(usdStr);
			resolve(precisionRound((usdVal * xemAmount) / 1e6, 2));
		} catch (err) {
			reject(err);
		}
	});
};

export const calculateTokenFee = (tokenAmount: number): Promise<number> => {
	return new Promise<number>(async (resolve, reject) => {
		try {
			const xemEquivalent = ((XEM_MARKET_CAP * (tokenAmount * 1e6)) / CHE_TOTAL_QUANTITY) / 1e4;
			const unweightedFee = Math.abs(xemEquivalent - SUPPLY_RELATED_ADJUSTMENT);
			let fee = precisionRound(unweightedFee * 0.05, 6);
			if (fee >= 1.25) { fee = 1.25; }
			resolve(fee);
		} catch (err) {
			reject(err);
		}
	});
};

/**
 * Grab the Address of the token holding account
 * @returns {string}
 */
export const tokenHoldingAccountAddress = (): string => {
	try {
		const contents = fs.readFileSync(nemConfig.walletPath);
		const wallet = SimpleWallet.readFromNanoWalletWLF(contents);
		return wallet.address.plain();
	} catch (err) {
		console.log(err);
	}
};
