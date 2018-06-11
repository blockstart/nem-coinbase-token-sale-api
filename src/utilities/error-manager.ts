import { Product } from 'model/product';
import { numberWithCommas } from 'utilities/tools-util';

export const stError = {
	TRANS_PRODUCT_NOT_FOUND: 'Cannot process transaction. Product not found',
	TRANS_PURCHASE_GENERIC: 'Unknown error. Cannot process transaction.',
	TRANS_CB_RECEIPT_INVALID: 'This receipt is not valid or cannot be found. Please re-enter the code or contact support@youremail.io',
	TRANS_CB_PRODUCT_NOT_FOUND: 'This product is either invalid or expired. If you have any questions email support@youremail.io'
};

export const stEndUser = {
	COINBASE_TOKEN_PURCHASE_NAME: '[YourToken] Tokens'
};

export const coinbaseTokenPurchaseDescription = (product: Product): string => {
	return `You are purchasing ${numberWithCommas(product.tokenAmount)} [Your Token] tokens`;
};

export enum ERROR_CODES {
	ERROR_CODE_GENERIC = 409
}

export enum DATA_ERR_BY {
	MISSING_PARAMS = 'Missing required parameters'
}



