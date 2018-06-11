import { ObjectID } from 'mongodb';
import isHexadecimal = require('validator/lib/isHexadecimal');

/**
 * Utility for casting MongoDB IDs to strings and vice versa
 * @param obj
 * @returns {any}
 */
export const castObjectIds = (obj: any) => {
		if (typeof  obj === 'string') {
			if (isHex24(obj)) {
				obj = new ObjectID(obj);
			}
		} else if (typeof  obj === 'object') {
			if (obj && typeof obj.hasOwnProperty !== 'function') {
				obj = createObject(obj);
			}
			for (const prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					if (Array.isArray(obj[prop])) {
						obj[prop] = obj[prop].map((refId: any) => {
							return castObjectIds(refId);
						});
					} else {
						if (typeof obj[prop] === 'string') {
							if (isHex24(obj[prop])) {
								obj[prop] = new ObjectID(obj[prop]);
							}
						} else if (typeof  obj[prop] === 'object') {
							obj[prop] = castObjectIds(obj[prop]);
						}
					}
				}
		    }
	    }
	return obj;
};

const createObject = (obj: any) => {
	const newObj: any = {};
	for (const prop in obj) {
		newObj[prop] = obj[prop];
	}
	return newObj;
};

const isHex24 = (str: any) => {
	return (str.length === 24 && isHexadecimal(str));
};