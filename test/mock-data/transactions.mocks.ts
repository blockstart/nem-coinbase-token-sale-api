import { ObjectID } from 'mongodb';
import { TokenType, XemTransaction } from 'model/xem-transaction';

export const transaction1: XemTransaction = {
	'_id' : new ObjectID('5b14ae7df6b9803853a2c16f'),
	'tokenRecipientAddress' : 'NDEM4DVQRBZEGYVNEOFPLZLBXMP6N6KMJRTNJ5TW',
	'tokenType' : TokenType.XEM,
	'productId' : new ObjectID('5b07b13406d7eb88fe233eb1'),
	'totalPaid' : 165234026,
	'quotedAmount' : 165234026,
	'usdPaid' : 45,
	'message' : 'c:225d-96dc-77ce-92da-4b57-d21d',
	'createdAt' : new Date('2018-06-04T03:14:05.928Z'),
	'transactionCompletedTimestamp' : '2018-06-04T03:14:05.930Z'
};

export const transaction2: XemTransaction = {
	'_id' : new ObjectID('5b14d5a4b3772f6d1c833f44'),
	'tokenRecipientAddress' : 'NB3T63QLGVZSVAMPRBUSZ4JMUGKYP2TPHPWFONFW',
	'tokenType' : TokenType.XEM,
	'productId' : new ObjectID('5b07b1b506d7eb88fe233eb2'),
	'totalPaid' : 687668574,
	'quotedAmount' : 687668574,
	'usdPaid' : 180,
	'message' : 'c:357a-89a4-d605-27fd-a84b-b336',
	'createdAt' : new Date('2018-06-04T03:14:05.928Z'),
	'transactionCompletedTimestamp' : '2018-06-04T03:14:05.930Z'
};