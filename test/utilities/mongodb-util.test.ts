import { suite, test } from 'mocha-typescript';
import { DB_COMPLETED_XEM_CHARGES, XemTransaction } from 'model/xem-transaction';
import { transaction1, transaction2 } from 'test/mock-data/transactions.mocks';
import { TRANSACTION_MESSAGE_LENGTH } from 'utilities/constants';
import getDb from '../../src/server/db';
import { expect } from 'chai';
import { deleteAllInCollection, findOneThatContains, saveWithId } from '../../src/utilities/mongodb-util';
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.use(chaiHttp);


@suite class NemServiceTest {
	public static async before() {
		await getDb();
		await saveWithId<XemTransaction>(DB_COMPLETED_XEM_CHARGES, transaction1);
		await saveWithId<XemTransaction>(DB_COMPLETED_XEM_CHARGES, transaction2);
	}

	public static async after() {
		await deleteAllInCollection<XemTransaction>(DB_COMPLETED_XEM_CHARGES);
	}

	@test('API: - should be null with non existent message')
	@test async getNullObjectWithWrongMessage() {
		try {
			const message = 'c:225d-96dc-77ce-92da-4b57-d343';
			const rawMsg = message.replace(/ /g, '');
			const hashId = rawMsg.substr(rawMsg.indexOf(':'), rawMsg.length);
			const transaction = await findOneThatContains<XemTransaction>(DB_COMPLETED_XEM_CHARGES, 'message', hashId, TRANSACTION_MESSAGE_LENGTH);
			expect(transaction).to.be.null;
		} catch (err) {
			expect(err).to.empty;
		}
	}

	@test('API: - should be null with empty message')
	@test async getNullObjectWithEmptyMessage() {
		try {
			const message = '';
			const rawMsg = message.replace(/ /g, '');
			const hashId = rawMsg.substr(rawMsg.indexOf(':'), rawMsg.length);
			const transaction = await findOneThatContains<XemTransaction>(DB_COMPLETED_XEM_CHARGES, 'message', hashId, TRANSACTION_MESSAGE_LENGTH);
			expect(transaction).to.be.null;
		} catch (err) {
			expect(err).to.empty;
		}
	}

	@test('API: - should get object with message')
	@test async getObjectWithMessage() {
		try {
			const message = 'c:357a-89a4-d605-27fd-a84b-b336';
			const rawMsg = message.replace(/ /g, '');
			const hashId = rawMsg.substr(rawMsg.indexOf(':'), rawMsg.length);
			const transaction = await findOneThatContains<XemTransaction>(DB_COMPLETED_XEM_CHARGES, 'message', hashId, TRANSACTION_MESSAGE_LENGTH);
			console.log(transaction);
			expect(transaction._id.toHexString()).to.equal(transaction2._id.toHexString());
		} catch (err) {
			expect(err).to.empty;
		}
	}
}