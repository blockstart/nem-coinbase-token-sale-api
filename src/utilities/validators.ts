import { check, validationResult } from 'express-validator/check';
import { DB_PRODUCTS, Product } from 'model/product';
import { TokenType } from 'model/xem-transaction';
import { DATA_ERR_BY, ERROR_CODES, stError } from 'utilities/error-manager';
import { findById } from 'utilities/mongodb-util';
import { Address } from 'nem-library';

/**
 * These validators are used in API endpoints to verify proper JSON body and API parameters
 * have been sent in the request
 * @type {string}
 */

export const KEY_PRODUCT_ID = 'productId';
export const KEY_TOKEN_RECIPIENT_ADDRESS = 'tokenRecipientAddress';
export const KEY_TOKEN_TYPE = 'tokenType';
export const KEY_FULL_NAME = 'fullName';
export const KEY_ADDRESS_1 = 'address1';
export const KEY_ADDRESS_2 = 'address2';
export const KEY_CITY = 'city';
export const KEY_STATE = 'state';
export const KEY_ZIP = 'zipCode';
export const KEY_COUNTRY = 'country';
export const KEY_PERSONAL_PICTURE_HOLDING_ID_PATH = 'personalPictureHoldingIdPath';
export const KEY_LEGAL_PHOTO_ID_PATH = 'legalPhotoIdPath';
export const KEY_PROOF_OF_RESIDENCE_PATH = 'proofOfResidencePath';

export const errorHandler = (req: any, res: any, next: any) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(ERROR_CODES.ERROR_CODE_GENERIC).json({message: errors.array()[0].msg});
	} else {
		next();
	}
};

export const validateProduct = (productId: string): Promise<Product> => {
	return new Promise<Product>(async (resolve, reject) => {
		try {
			const product: Product = await findById<Product>(DB_PRODUCTS, productId);
			if (product) {
				resolve(product);
			} else {
				reject(stError.TRANS_PRODUCT_NOT_FOUND);
			}
		} catch (err) {
			reject(stError.TRANS_PRODUCT_NOT_FOUND);
		}
	});
};

const validateTokenAddress = (tokenRecipientAddress: string): Promise<Address> => {
	return new Promise<Address>((resolve, reject) => {
		try {
			resolve(new Address(tokenRecipientAddress));
		} catch (err) {
			reject(err);
		}
	});
};

const validateTokenType = (tokenType: TokenType): Promise<boolean> => {
	return new Promise<boolean>((resolve, reject) => {
		try {
			if (tokenType === TokenType.XEM) {
				resolve(true);
			} else {
				resolve(false);
			}
		} catch (err) {
			reject(err);
		}
	});
};

export const isImage = (path: string): boolean => {
			const position = path.lastIndexOf('.');
			if (position < 1) { return false; }
			switch (path.slice(position + 1).toLowerCase()) {
				case 'jpg': return true;
				case 'jpeg': return true;
				case 'png': return true;
				case 'tiff': return true;
				default: return false;
			}
};

export const vInitiateXEMPurchase = [
	check(KEY_PRODUCT_ID)
		.exists()
		.trim()
		.custom(validateProduct),
	check(KEY_TOKEN_RECIPIENT_ADDRESS)
		.exists()
		.trim()
		.custom(validateTokenAddress)
		.withMessage(`${DATA_ERR_BY.MISSING_PARAMS}: ${KEY_TOKEN_RECIPIENT_ADDRESS}`),
	check(KEY_TOKEN_TYPE)
		.exists()
		.trim()
		.custom(validateTokenType),
	errorHandler
];

export const vInitateCoinbasePurchase = [
	check(KEY_PRODUCT_ID)
		.exists()
		.trim()
		.custom(validateProduct),
	check(KEY_TOKEN_RECIPIENT_ADDRESS)
		.exists()
		.trim()
		.custom(validateTokenAddress)
		.withMessage(`${DATA_ERR_BY.MISSING_PARAMS}: ${KEY_TOKEN_RECIPIENT_ADDRESS}`),
	errorHandler
];

export const vPurchaseLookup = [
	check(KEY_TOKEN_RECIPIENT_ADDRESS)
		.exists()
		.trim()
		.custom(validateTokenAddress)
		.withMessage(`${DATA_ERR_BY.MISSING_PARAMS}: ${KEY_TOKEN_RECIPIENT_ADDRESS}`),
	errorHandler
];

export const vKYCEmail = [
	check(KEY_FULL_NAME)
	.exists()
	.trim(),
	check(KEY_ADDRESS_1)
	.exists()
	.trim(),
	check(KEY_ADDRESS_2)
	.exists()
	.trim(),
	check(KEY_CITY)
	.exists()
	.trim(),
	check(KEY_STATE)
	.exists()
	.trim(),
	check(KEY_ZIP)
	.exists()
	.trim(),
	errorHandler
];