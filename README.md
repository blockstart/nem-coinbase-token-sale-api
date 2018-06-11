![nem token sale](/readme-images/nemtokensale.png?raw=true "NEM Token Sale")

# NEM Coinbase Token Sale API

This repo provides all of the code needed to operate a token sale on the [NEM](https://nem.io) blockchain. 

This code powered the [Cache Token Sale](https://getcache.io).

The code will do the following:

 1. Send your NEM Token (Mosaic) to purchasers
 2. Let purchasers buy with XEM
 3. Let purchasers buy with Coinbase Commerce
 4. Process KYC for XEM and manual crypto payments
  
## Development  
 
Requires: Node v8.2+, MongoDB

* [Node Installation Steps](https://nodejs.org/en/download/)
* [MongoDB Installation Steps](https://docs.mongodb.com/manual/administration/install-community/)
  
1. Clone this repo: `https://github.com/blockstart/nem-coinbase-token-sale-api.git`  
2.  Run `cd nem-coinbase-token-sale-api && npm install`
3. Run `npm install -g pm2 nodemon`
4. In a new terminal tab, run `mongod` to start the mongo daemon (if you run into errors in this process it means your MongoDB installation likely isn't properly set up). If successful, the mongo daemon will start, leave this running.

**Seed Test Data**

The only data needed on first build is the token packages you plan to sell.

1. From within your project directory run: `cd test`
2. Run `mongoimport --db token-api-local --collection products --file products.json --jsonArray`

Result will look similar to:

![seed import](/readme-images/seed-result.png?raw=true "Seed Import")

**Build & Run the Project**

To build the project and start the server run:

`npm run localdev`

If everything worked correctly you'll see something similar to this:

![local running](/readme-images/local-running.png?raw=true "local running")

To test the running server, open up a new terminal tab or window and run:

`curl http://localhost:3005/localdev/v1/product/all`

You should see a printout of your products that you inserted earlier.

Hot reloading is enabled for development - as you make changes the code will recompile and the server will restart.

**Unit Testing**

To run through all the tests run:  
  
`npm run test`

Hot reloading is enabled for unit testing.

## Important Notes

**Wallet & Secret Keys**

Put the following lines in your `.gitignore` file:

```bash
nem-config.json
*.wlt
```
Do NOT put your passwords, secret keys, or wallet files in version control. We left these in the project so you can see the format.

You will need to put a wallet on your server, and point to the path in the `nem-config.json` file.

Your wallet and password is needed to sign transactions, ie automatically send your token to purchasers.

**Environments**

Use the environment files for your various API keys like Coinbase commerce.

They look like this: `.env.development` and `.env.prod`

## Deployment

To deploy, use your favorite hosting provider and set up a Linux distribution. We use Digital Ocean for our hosting. 

Get $15 _FREE_ credit for Digital Ocean hosting. 
Use this code on the billing page: `DODEVSLOPES15`

*(non-affiliate - we asked for these codes for our community)*

Requires: Node v8.2+, MongoDB

* [Node Installation Steps](https://nodejs.org/en/download/)
* [MongoDB Installation Steps](https://docs.mongodb.com/manual/administration/install-community/)
  
1. Clone this repo: `https://github.com/blockstart/nem-coinbase-token-sale-api.git`  
2.  Run `cd nem-coinbase-token-sale-api && npm install`
3. Run `npm install -g pm2`
4. Run mongo as a background process
5. Run `npm run build` then `npm start`

You will now have a PM2 process running named `api-token-production` running on port `4561`

Learn more about PM2 [here](http://pm2.keymetrics.io/).

**NGINX**

We recommend NGINX for reverse proxy and node apps. Here is an example config that you can put in `/etc/nginx/sites-available`

```nginx
server {
        listen 80;
        server_name yourapi.yourdomain.io;

        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-NginX-Proxy true;
                proxy_pass http://localhost:4561;
                proxy_ssl_session_reuse off;
                proxy_set_header Host $http_host;
                proxy_cache_bypass $http_upgrade;
                proxy_redirect off;
        }
}
```
A production deployment could flow like this:

1.  Register with Digital Ocean and create an Ubuntu droplet
2.  Run the API project with PM2 as written above
3.  Configure NGINX similar to above

That's it.

## Endpoints

Your client apps will interface with the following REST endpoints:

*  GET: `/product/all`
*  GET: `/product/purchase-lookup-coinbase/:tokenRecipientAddress`
*  POST: `/transaction/initiate-xem-purchase`
*  POST `/transaction/initiate-coinbase-purchase`
*  GET: `/info/tokens-sold`
*  PUT: `/info/update-usd`
*  PUT: `/kyc/email`

## Final Notes

This code uses the MIT license - use it as you see fit. We are not responsible for any bugs or issues in this code. Please review before publishing.

One piece of code that is on our server that is not here is the verification of multiple confirmations. We are still cleaning that code up. Know that it is important to make multiple verifications of a transaction before sending tokens
to a recipient.
  

