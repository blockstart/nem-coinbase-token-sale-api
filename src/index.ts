import express = require('express');
import { CorsOptions } from 'cors';
import { Router } from 'express';
import * as cors from 'cors';
import compression = require('compression');
import bodyParser = require('body-parser');
import logger = require('morgan');
import dotenv = require('dotenv');
import { routes } from 'api/routes';
const formData = require('express-form-data');
const os = require('os');

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

const app = express();

app.set('port', process.env.API_PORT || 3010);

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
	app.use(express.static('public'));
}
const formOptions = {
	uploadDir: os.tmpdir(),
	autoClean: true
};

app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(formData.parse(formOptions));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());

/**
 * Whitelist the URLs that requests can come from. This helps prevent
 * DDOS attacks among other things
 * @type {string[]}
 */
const originsWhitelist = [
	'https://cache-token.some-staging-server.com',
	'https://getcache.io',
	'https://www.getcache.io'
];
const corsOptions: CorsOptions = {
	allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'x-www-form-urlencoded'],
	credentials: true,
	methods: 'GET,POST,PUT',
	origin: function(origin: any, callback: any) {
		const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
		callback(null, isWhitelisted);
	},
};

if (process.env.NODE_ENV === 'production') {
	app.use(cors(corsOptions));
} else {
	app.use(cors());
}

app.use(process.env.API_URI, routes(Router()));

if (process.env.NODE_ENV !== 'test') {
	app.listen(app.get('port') || 3010, () => {
		console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'));
		console.log('   Press CTRL-C to stop\n');
	});
}

export default app;

export const server = () => {
	return app;
};

