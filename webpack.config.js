const WebpackShellPlugin = require('webpack-shell-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const config = {
	entry: ['./src/index.ts'],
	devtool: 'inline-source-map',
	target: 'node',
	watch: false,
	externals: [nodeExternals()],
	node: {
		__dirname: false,
		__filename: false
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				enforce: 'pre',
				loader: 'tslint-loader',
			},
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	plugins: [

	],
	resolve: {
		extensions: ['.ts', '.js' ],
		plugins: [new TsconfigPathsPlugin()]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};

if (process.env.NODE_ENV === 'localdev') {
	config.watch = true;
	config.plugins.push(new WebpackShellPlugin({onBuildEnd: ['nodemon dist/bundle.js --watch ./']}));
}

module.exports = config;