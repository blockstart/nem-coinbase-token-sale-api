import { suite, test } from 'mocha-typescript';
import { calculateTokenFee } from '../../src/utilities/nem-util';
import getDb from '../../src/server/db';
import { expect } from 'chai';
import { DB_PRODUCTS, Product } from '../../src/model/product';
import { deleteAllInCollection, saveWithId } from '../../src/utilities/mongodb-util';
import { product1, product2, product3, product4, product5 } from '../mock-data/products.mocks';
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.use(chaiHttp);

@suite class NemServiceTest {
	public static async before() {
		await getDb();
		await saveWithId<Product>(DB_PRODUCTS, product1);
		await saveWithId<Product>(DB_PRODUCTS, product2);
		await saveWithId<Product>(DB_PRODUCTS, product3);
		await saveWithId<Product>(DB_PRODUCTS, product4);
		await saveWithId<Product>(DB_PRODUCTS, product5);
	}

	public static async after() {
		await deleteAllInCollection<Product>(DB_PRODUCTS);
	}

	@test('API: - should calculate correct fee for 2,500 che')
	@test async getFee2500() {
		try {
			expect(await calculateTokenFee(2500)).to.equal(0.0625);
		} catch (err) {
			expect(err).to.empty;
		}
	}

	@test('API: - should calculate correct fee for 10,000 che')
	@test async getFee10000() {
		try {
			expect(await calculateTokenFee(10000)).to.equal(0.4);
		} catch (err) {
			expect(err).to.empty;
		}
	}

	@test('API: - should calculate correct fee for 50,000 che')
	@test async getFee50000() {
		try {
			expect(await calculateTokenFee(50000)).to.equal(1.25);
		} catch (err) {
			expect(err).to.empty;
		}
	}

	@test('API: - should calculate correct fee for 500,000 che')
	@test async getFee500000() {
		try {
			expect(await calculateTokenFee(500000)).to.equal(1.25);
		} catch (err) {
			expect(err).to.empty;
		}
	}

	@test('API: - should calculate correct fee for 500,000,000 che')
	@test async getFee5000000() {
		try {
			expect(await calculateTokenFee(5000000)).to.equal(1.25);
		} catch (err) {
			expect(err).to.empty;
		}
	}
}