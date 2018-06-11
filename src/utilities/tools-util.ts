import crypto = require('crypto');

export const numberWithCommas = (x: number) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const timeElapsedInSeconds = (pastISODate: string): number => {
	const created: Date = new Date(pastISODate);
	const now: Date = new Date();
	const elapsed: number = now.getTime() - created.getTime();
	const seconds = Math.floor(elapsed / 1e3);
	return seconds;
};

export const sleep = (milliseconds: number) => {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
};

export const precisionRound = (number: number, precision: number): number => {
	const factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
};

export const generateHashId = (tokenRecipientAddress: string, createdDate: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		crypto.pbkdf2(tokenRecipientAddress, createdDate, 1, 12, 'sha1', (err, derivedKey) => {
			if (err) {
				reject(err);
			} else {
				const key: string = derivedKey.toString('hex');
				resolve(formatHash(key, 4).join('-'));
			}
		});
	});
};

const formatHash = (str: string, n: number) => {
	const ret: Array<string> = [];
	let i;
	let len;

	for (i = 0, len = str.length; i < len; i += n) {
		ret.push(str.substr(i, n));
	}
	return ret;
};