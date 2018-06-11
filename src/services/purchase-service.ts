import { initiateTokenTransfer } from 'services/token-transfer';

/**
 * Simple on success handler
 * @param {number} tokenValue
 * @param {string} xemAddress
 * @returns {Promise<any>}
 */
export const onChargeSuccess = async (tokenValue: number, xemAddress: string): Promise<any> => {
	return _onChargeSuccess(
		tokenValue,
		xemAddress
	);
};

/**
 * Simple on success handler
 * @param {number} tokenValue
 * @param {string} xemAddress
 * @returns {Promise<any>}
 * @private
 */
const _onChargeSuccess = (tokenValue: number, xemAddress: string): Promise<any> => {
	return new Promise<any>(async (resolve, reject) => {
		try {
			resolve(initiateTokenTransfer(tokenValue, xemAddress));
		} finally {
			reject();
		}
	});
};