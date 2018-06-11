import { castObjectIds } from 'utilities/castObjectIds';

export const save = <T>(collection: string, obj: any): Promise<T> => {
	return new Promise(async(resolve, reject) => {
		try {
			obj = castObjectIds(obj);
			resolve((await global.db.collection(collection).insertOne(obj)).ops[0]);
		} catch (err) {
			reject(err);
		}
	});
};

export const saveWithId = <T>(collection: string, obj: any): Promise<T> => {
	return new Promise(async(resolve, reject) => {
		try {
			obj = castObjectIds(obj);
			resolve((await global.db.collection(collection).insertOne(obj)));
		} catch (err) {
			reject(err);
		}
	});
};

export const update = <T>(collection: string, id: string, obj: any): Promise<boolean> => {
	return new Promise(async(resolve, reject) => {
		try {
			id = castObjectIds(id);
			obj = castObjectIds(obj);
			const ok = (await global.db.collection(collection).updateOne({_id: id}, {$set: obj})).result.ok;
			if (ok === 1) {
				resolve(true);
			} else {
				reject('No ' + collection + ' object updated.');
			}
		} catch (err) {
			reject(err);
		}
	});
};

export const findById = <T>(collection: string, id: string): Promise<T> => {
	return new Promise(async(resolve, reject) => {
		try {
			id = castObjectIds(id);
			resolve(await global.db.collection(collection).findOne({_id: id}));
		} catch (err) {
			reject(err);
		}
	});
};

export const findAll = <T>(collection: string): Promise<Array<T>> => {
	return new Promise(async(resolve, reject) => {
		try {
			resolve(await global.db.collection(collection).find({}).sort( { tokenAmount: 1 } ).toArray());
		} catch (err) {
			reject(err);
		}
	});
};

export const findOneByProp = <T>(collection: string, property: string, value: any): Promise<T> => {
	return new Promise(async(resolve, reject) => {
		try {
			value = castObjectIds(value);
			const query: any = {};
			query[property] = value;
			resolve(await global.db.collection(collection).findOne(query));
		} catch (err) {
			reject(err);
		}
	});
};

export const findOneByTwoProps = <T>(collection: string, property1: string, value1: string, property2: string, value2: string): Promise<T> => {
	return new Promise(async(resolve, reject) => {
		try {
			value1 = castObjectIds(value1);
			value2 = castObjectIds(value2);
			const query1: any = {};
			query1[property1] = value1;
			const query2: any = {};
			query2[property2] = value2;
			resolve(await global.db.collection(collection).findOne({$and: [query1, query2]}));
		} catch (err) {
			reject(err);
		}
	});
};

export const findAllByProp = <T>(collection: string, property: string, value: string): Promise<Array<T>> => {
	return new Promise(async(resolve, reject) => {
		try {
			value = castObjectIds(value);
			const query: any = {};
			query[property] = value;
			resolve(await global.db.collection(collection).find(query).sort( { orderNumber: 1 } ).toArray());
		} catch (err) {
			reject(err);
		}
	});
};

export const findOneThatContains = <T>(collection: string, property: string, value: string, lengthMinimum: number): Promise<T> => {
	return new Promise(async(resolve, reject) => {
		try {
			value = value.trim();
			if (value.length < lengthMinimum ) { resolve(null); }
			const query: any = {};
			query[property] =  {$regex: value };
			resolve(await global.db.collection(collection).findOne(query));
		} catch (err) {
			reject(err);
		}
	});
};

export const findAllByTwoProps = <T>(collection: string, property1: string, value1: string, property2: string, value2: string): Promise<Array<T>> => {
	return new Promise(async(resolve, reject) => {
		try {
			value1 = castObjectIds(value1);
			value2 = castObjectIds(value2);
			const query1: any = {};
			query1[property1] = value1;
			const query2: any = {};
			query2[property2] = value2;
			resolve(await global.db.collection(collection).find({$and: [query1, query2]}).toArray());
		} catch (err) {
			reject(err);
		}
	});
};

export const deleteById = <T>(collection: string, id: any): Promise<any> => {
	return new Promise(async(resolve, reject) => {
		try {
			id = castObjectIds(id);
			const ok = (await global.db.collection(collection).deleteOne({_id: id})).result.ok;
			if (ok === 1) {
				resolve({message: 'Successfully deleted a ' + collection + ' object.'});
			} else {
				reject('No ' + collection + ' object deleted.');
			}
		} catch (err) {
			reject(err);
		}
	});
};

export const deleteAllByProp = <T>(collection: string, property: string, value: string): Promise<any> => {
	return new Promise(async(resolve, reject) => {
		try {
			value = castObjectIds(value);
			const query: any = {};
			query[property] = value;
			const ok = (await global.db.collection(collection).deleteMany(query)).result.ok;
			if (ok === 1) {
				resolve({message: 'Successfully deleted a ' + collection + ' object.'});
			} else {
				reject('No ' + collection + ' object deleted.');
			}
		} catch (err) {
			reject(err);
		}
	});
};

export const deleteAllInCollection = <T>(collection: string): Promise<any> => {
	return new Promise(async(resolve, reject) => {
		try {
			const ok = (await global.db.collection(collection).deleteMany()).result.ok;
			if (ok === 1) {
				resolve({message: 'Successfully deleted a ' + collection + ' object.'});
			} else {
				reject('No ' + collection + ' object deleted.');
			}
		} catch (err) {
			reject(err);
		}
	});
};

