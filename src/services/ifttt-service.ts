import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import { URL_IFTT_NOTIF } from 'utilities/constants';

/**
 * This function is used to notify the Telegram Bot (IFTTT) that a purchase has completed
 * @param {string} tokenValue
 * @returns {Promise<string>}
 */
export const postTokenPurchaseNotification = (tokenValue: string): Promise<string> => {
	return new Promise<string>(async (resolve, reject) => {
		try {
			const config: AxiosRequestConfig = {
				url: URL_IFTT_NOTIF,
				method: 'post',
				headers: { 'Content-Type': 'application/json' },
				data: { 'value1' : tokenValue }
			};
			const json: any = await axios(config);
			const responseData: any = json.data.data as any;
			resolve(responseData);
		} catch (err) {
			reject(err);
		}
	});
};