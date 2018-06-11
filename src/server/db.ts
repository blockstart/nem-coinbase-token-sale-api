import * as dotenv from 'dotenv';
import * as MongoClient from 'mongodb';

/**
 * Environments are used for development and testing
 */
export default async () => {
		switch (process.env.NODE_ENV) {
			case 'production':
				dotenv.config({ path: '.env.prod' });
				break;
			case 'staging':
				dotenv.config({ path: '.env.staging' });
				break;
			case 'development':
				dotenv.config({ path: '.env.development' });
				break;
			case 'test':
				dotenv.config({ path: '.env.test' });
				break;
			case 'localdev':
				dotenv.config({ path: '.env.localdev' });
				break;
		}

		return global.db = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost/token-api-development');
};