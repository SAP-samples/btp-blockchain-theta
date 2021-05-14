/*eslint no-console: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");
var express = require("express");
var passport = require("passport");
var stringifyObj = require("stringify-object");
var bodyParser = require("body-parser");

const fetch = require('node-fetch');
const jose = require('node-jose');

require('isomorphic-fetch');
const BigNumber = require('bignumber.js');
// node_modules/@thetalabs/theta-js/docs
const thetajs = require('@thetalabs/theta-js');
const { accessSync } = require("fs");
const Wallet = thetajs.Wallet;
const {HttpProvider} = thetajs.providers;
const SendTransaction = thetajs.transactions.SendTransaction;
const ReserveFundTransaction = thetajs.transactions.ReserveFundTransaction;
const Contract = thetajs.Contract;
const ContractFactory = thetajs.ContractFactory;
const {ChainIds} = thetajs.networks;

const AddressAdmin = "<ADMIN_WALLET_ADDRESS>";
const AddressUser1 = "<USER1_WALLET_ADDRESS>";
const AddressUser2 = "<USER2_WALLET_ADDRESS>";
const PrivateKeyAdmin = "<ADMIN_PRIVATE_KEY>";
const PrivateKeyUser1 = "<USER1_PRIVATE_KEY>";
const PrivateKeyUser2 = "<USER2_PRIVATE_KEY>";

const address = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
// 93a90ea508331dfdf27fb79757d4250b4e84954927ba0073cd67454ac432c737
const address2 = "0x0d2fD67d573c8ecB4161510fc00754d64B401F86";
// 931f84b1891be0b745875ecc9f929d5252c3fdbfbaa4a40810089b44158b02c1
const addressx = "0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28";
// cat wallet/quertyuiop.privkey

const mnaddress = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
// 0xabcdefxxxxxxx

var binding = null;

try {
	xsenv.loadEnv();
	const services = xsenv.getServices({
		uaa: { tag: 'xsuaa' },
		credstore: { tag: 'credstore' }
	});
	//binding = JSON.parse(process.env.VCAP_SERVICES).credstore[0].credentials;
	binding = services.credstore;
} catch (e) {
	console.error(e);
	console.log("Make sure deployed or default-env.json available.")
	console.log("cf de theta-trustee");
}

var privkey = null;
var privkey2 = null;
var privkeyx = null;

// Run this to test locally and enable thetacli
// cf enable-ssh theta-privatenet
// cf restart theta-privetenet
// cf ssh theta-privatenet -L 16888:localhost:8080
// thetacli query status | jq .
//const provider = new thetajs.providers.HttpProvider('privatenet', 'http://localhost:16888/rpc'); // Works

// curl -X POST -H 'Content-Type: application/json' --data '{"jsonrpc":"2.0","method":"theta.GetStatus","params":[],"id":1}' https://partner-prova-dev-theta-privatenet.cfapps.us21.hana.ondemand.com/rpc | jq .
var privateNetURL = "https://partner-prova-dev-theta-privatenet.cfapps.us21.hana.ondemand.com";
// Run this to inject the ENV like when app is deployed to CF
// cf copyenv theta-trustee | source /dev/stdin
// export destinations='[{"forwardAuthToken":true,"name":"theta_privatenet_be","url":"https://partner-prova-dev-theta-privatenet.cfapps.us21.hana.ondemand.com"}]'
const destinations = JSON.parse(process.env.destinations);
destinations.forEach(destination => {
	if (destination.name == "theta_privatenet_be") {
		privateNetURL = destination.url;
	}
});

console.log("privateNetURL: " + privateNetURL);


const provider = new thetajs.providers.HttpProvider('privatenet', privateNetURL + '/rpc'); // Works
//const provider = new thetajs.providers.HttpProvider(ChainIds.Mainnet); // Mainnet

const tnprov = new thetajs.providers.HttpProvider(ChainIds.Testnet); // Testnet
const mnprov = new thetajs.providers.HttpProvider(ChainIds.Mainnet); // Mainnet
const sbprov = new thetajs.providers.HttpProvider(ChainIds.Privatenet); // SmartContracts Sandbox

console.log("mnprov :" + JSON.stringify(mnprov,null,2));

async function doCredStore() {
	try {
		privkey = await readCredential(binding, "privatenet", "password", "privkey");
		console.log("read privkey:" + JSON.stringify(privkey));
	} catch (e) {
		console.log("Error reading privkey credential: " + e);
		console.log("binding:" + JSON.stringify(binding.url,null,2));
		console.log("If running locally and have redeployed, rerun: cf de theta-trustee");
		console.log("Open the Credential Store and create a namespace=privatenet.");
		console.log("Create a password=privkey and give it the value found in.");
		console.log("cat wallet/qwertyuiop.privkey");
		if (true) {
			console.log("Using built-in privkey.");
			privkey = {
				name: "privkey", 
				value: "0x93a90ea508331dfdf27fb79757d4250b4e84954927ba0073cd67454ac432c737", 
				username: "built-in", 
				metadata: "{\"url\": \"https://www.example.com/path\"}",
				status: "built-in"
			};
			privkey2 = {
				name: "privkey2", 
				value: "0x931f84b1891be0b745875ecc9f929d5252c3fdbfbaa4a40810089b44158b02c1", 
				username: "built-in", 
				metadata: "{\"url\": \"https://www.example.com/path\"}",
				status: "built-in"
			};
			privkeyx = {
				name: "privkeyx", 
				value: "0x784ddc9e534dc0a954784efb3540e521f9663f78910791622f78b1ee72ae3fae", 
				username: "built-in", 
				metadata: "{\"url\": \"https://www.example.com/path\"}",
				status: "built-in"
			};
		}
	}
}

doCredStore();

function startTimer() {
	const time = process.hrtime();
	return time;
}
 
function endTimer(time) {
	function roundTo(decimalPlaces, numberToRound) {
		return +(Math.round(numberToRound + `e+${decimalPlaces}`)  + `e-${decimalPlaces}`);
	}
	const diff = process.hrtime(time);
	const NS_PER_SEC = 1e9;
	const result = (diff[0] * NS_PER_SEC + diff[1]); // Result in Nanoseconds
	const elapsed = result * 0.0000010;
	return roundTo(6, elapsed); // Result in milliseconds
}

var app = express();

var server = require("http").createServer();
var port = process.env.PORT || 8080;

function checkStatus(response) {
    if (!response.ok) throw Error("Unexpected status code: " + response.status);
    return response;
}

async function decryptPayload(privateKey, payload) {
    const key = await jose.JWK.asKey(
        `-----BEGIN PRIVATE KEY-----${privateKey}-----END PRIVATE KEY-----`, 
        "pem", 
        {alg: "RSA-OAEP-256", enc: "A256GCM"}
    );
    const decrypt = await jose.JWE.createDecrypt(key).decrypt(payload);
    const result = decrypt.plaintext.toString();
    return result;
}

function headers(binding, namespace, init) {
    const result = new fetch.Headers(init);
    result.set("Authorization", `Basic ${Buffer.from(`${binding.username}:${binding.password}`).toString("base64")}`);
    result.set("sapcp-credstore-namespace", namespace);
    return result;
}

async function fetchAndDecrypt(privateKey, url, method, headers, body) {
    const result = await fetch(url, {method, headers, body})
        .then(checkStatus)
        .then(response => response.text())
        .then(payload => decryptPayload(privateKey, payload))
        .then(JSON.parse);
    return result;
}

async function readCredential(binding, namespace, type, name) {
    return fetchAndDecrypt(
        binding.encryption.client_private_key,
        `${binding.url}/${type}?name=${encodeURIComponent(name)}`, 
        "get", 
        headers(binding, namespace)
    );
}


app.get("/", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">The Links page.</a><br />";
	responseStr += "<br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">The Links page.</a><br />";
	responseStr += "<br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/links", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";
	responseStr += "<br />";
	responseStr += "<a href=\"/trustee/chkprivkey\" target=\"_blank\">Check PrivKey</a><br />";
	responseStr += "<a href=\"/trustee/block-height\" target=\"_blank\">block-height</a><br />";
	responseStr += "<a href=\"/trustee/get-account\" target=\"_blank\">get-account</a> Get Account Balance<br />";
	responseStr += "<a href=\"/trustee/get-account2\" target=\"_blank\">get-account2</a> Get Account2 Balance<br />";
	responseStr += "<a href=\"/trustee/send-theta\" target=\"_blank\">send-theta</a> Send Theta and TFuel Account <a href=\"/trustee/send-theta?action=doit\" target=\"_blank\">-&gt;</a> Account2<br />";
	responseStr += "<a href=\"/trustee/send-theta?reverse=true\" target=\"_blank\">send-theta</a> Send Theta and TFuel Account2 <a href=\"/trustee/send-theta?action=doit&reverse=true\" target=\"_blank\">-&gt;</a> Account<br />";
	responseStr += "<br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/chkprivkey", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";
	responseStr += "<pre>\n";
	responseStr += privkey.status + "\n";
	responseStr += "</pre>\n";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/networks", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";
	responseStr += "<pre>\n";
	responseStr += JSON.stringify(thetajs.networks,null,2) + "\n";
	responseStr += "</pre>\n";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});


app.get("/trustee/block-height", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	const blockHeight = await provider.getBlockNumber();

	responseStr += "<pre>\n";
	responseStr += blockHeight + "\n";
	responseStr += "</pre>\n";

	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/get-account", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	var account = await provider.getAccount(address);
	console.log("account :" + JSON.stringify(account.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "account  : " + address + "\n";
	responseStr += JSON.stringify(account.coins,null,2) + "\n";
	responseStr += "theta:  " + (account.coins.thetawei / 1000000000000000000) + "\n";
	responseStr += "tfuel: " + (account.coins.tfuelwei / 1000000000000000000) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/get-account2", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	var account2 = await provider.getAccount(address2);
	console.log("account2 :" + JSON.stringify(account2.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "account2  : " + address2 + "\n";
	responseStr += JSON.stringify(account2.coins,null,2) + "\n";
	responseStr += "theta:  " + (account2.coins.thetawei / 1000000000000000000) + "\n";
	responseStr += "tfuel: " + (account2.coins.tfuelwei / 1000000000000000000) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/get-accountx", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	var accountx = await sbprov.getAccount(addressx);
	console.log("accountx :" + JSON.stringify(accountx.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "accountx  : " + addressx + "\n";
	responseStr += JSON.stringify(accountx.coins,null,2) + "\n";
	responseStr += "theta:  " + (accountx.coins.thetawei / 1000000000000000000) + "\n";
	responseStr += "tfuel: " + (accountx.coins.tfuelwei / 1000000000000000000) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/send-theta", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	//responseStr += JSON.stringify(req, null, 2) + "\n";
	
	console.log(JSON.stringify(req.query, null, 2));

	try {

		var from = address;
		var to = address2;
		var use_privkey = privkey;

		if (req.query && req.query.reverse && (req.query.reverse == "true")) {
			from = address2;
			to = address;
			use_privkey = privkey2;
		}

		const count = await provider.getTransactionCount(from);
		responseStr += "last sequence count :" + count + "\n";

		const wallet = new Wallet(use_privkey.value);
		const connectedWallet = wallet.connect(provider);

		const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei

		const thetaWeiToSend = (new BigNumber(1.0)).multipliedBy(ten18);

		const tfuelWeiToSend = (new BigNumber(10.0)).multipliedBy(ten18);

		const txData = {
			from: from,
			outputs: [
				{
					address: to,
					thetaWei: thetaWeiToSend,
					tfuelWei: tfuelWeiToSend,
                    sequence: count + 1
				}
			]
		};
		
		const transaction = new SendTransaction(txData);
		// transaction.inputs[0].sequence = count + 1;
		responseStr += "transaction :" + JSON.stringify(transaction,null,2) + "\n";
		
		const tfuelperusd = 0.335824;	// As of 2021-04-29
		const feetfuel = 0.0001;
		const feeincents = ( ( tfuelperusd * feetfuel ) * 100 );
		responseStr += "\nsendTransaction fee: " + feeincents + " cents\n";
	
		if (req.query && req.query.action && (req.query.action == "doit")) {

			const start = startTimer();

			const txresult = await connectedWallet.sendTransaction(transaction);
			responseStr += "sendTransaction duration: " + endTimer(start) + " ms\n";
			responseStr += "txresult :" + JSON.stringify(txresult,null,2) + "\n";

			const blockHash = txresult.hash;
			responseStr += "blockHash :" + JSON.stringify(blockHash,null,2) + "\n";
			const block = await provider.getTransaction(blockHash);
			responseStr += "block :" + JSON.stringify(block,null,2) + "\n";
		}
	} catch(e) {
		responseStr += "error : " + e + "\n";
	}


	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/get-account-tn", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	// https://beta-explorer.thetatoken.org/account/0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28
	const addresstn = "0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28";
	const accounttn = await tnprov.getAccount(addresstn);
	//const accounttn = await mnprov.getAccount(addresstn);
	console.log("accounttn :" + JSON.stringify(accounttn.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "accounttn  : " + accounttn + "\n";
	responseStr += JSON.stringify(accounttn.coins,null,2) + "\n";
	responseStr += "theta:  " + (accounttn.coins.thetawei / 1000000000000000000) + "\n";
	responseStr += "tfuel: " + (accounttn.coins.tfuelwei / 1000000000000000000) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

// curl https://explorer.thetatoken.org:9000/api/price/all | jq '.body[] | select(._id == "TFUEL") | .price'

async function getPricesUSD() {
	const url = "https://explorer.thetatoken.org:9000/api/price/all";
    const result = await fetch(url)
        .then(checkStatus)
        .then(response => response.text())
        .then(JSON.parse);
    return result;
}

app.get("/trustee/thetausd", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	const prices = await getPricesUSD();
	var theta_price = 0.0;
	prices.body.forEach(token => {
		if (token._id == "THETA") {
			theta_price = token.price;
		}
	});
	responseStr += theta_price + " THETA/USD \n";

	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/tfuelusd", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	const prices = await getPricesUSD();
	var tfuel_price = 0.0;
	prices.body.forEach(token => {
		if (token._id == "TFUEL") {
			tfuel_price = token.price;
		}
	});
	responseStr += tfuel_price + " TFuel/USD \n";

	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/reserve-fund", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	//responseStr += JSON.stringify(req, null, 2) + "\n";
	
	console.log(JSON.stringify(req.query, null, 2));

	try {

		var from = address;
		var to = address2;
		var use_privkey = privkey;

		if (req.query && req.query.reverse && (req.query.reverse == "true")) {
			from = address2;
			to = address;
			use_privkey = privkey2;
		}

		const count = await provider.getTransactionCount(from);
		responseStr += "last sequence count :" + count + "\n";

		const wallet = new Wallet(use_privkey.value);
		const connectedWallet = wallet.connect(provider);

		const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei

		const thetaWeiToSend = (new BigNumber(1.0)).multipliedBy(ten18);

		const tfuelWeiToSend = (new BigNumber(10.0)).multipliedBy(ten18);

		const txData = {
			from: from,
			outputs: [
				{
					address: to,
					thetaWei: thetaWeiToSend,
					tfuelWei: tfuelWeiToSend,
                    sequence: count + 1
				}
			]
		};
		
		const transaction = new ReserveFundTransaction(txData);
		// transaction.inputs[0].sequence = count + 1;
		responseStr += "transaction :" + JSON.stringify(transaction,null,2) + "\n";
		
		const tfuelperusd = 0.335824;	// As of 2021-04-29
		const feetfuel = 0.0001;
		const feeincents = ( ( tfuelperusd * feetfuel ) * 100 );
		responseStr += "\nsendTransaction fee: " + feeincents + " cents\n";
	
		if (req.query && req.query.action && (req.query.action == "doit")) {

			const start = startTimer();

			const txresult = await connectedWallet.sendTransaction(transaction);
			responseStr += "sendTransaction duration: " + endTimer(start) + " ms\n";
			responseStr += "txresult :" + JSON.stringify(txresult,null,2) + "\n";

			const blockHash = txresult.hash;
			responseStr += "blockHash :" + JSON.stringify(blockHash,null,2) + "\n";
			const block = await provider.getTransaction(blockHash);
			responseStr += "block :" + JSON.stringify(block,null,2) + "\n";
		}
	} catch(e) {
		responseStr += "error : " + e + "\n";
	}


	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/deploy-contract-sb", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=94284C201B6DfF344E086B2878b8fd0cF8B9ED28 | jq .coins
	// https://smart-contract-testnet-explorer.thetatoken.org/account/0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28
	const accounttn = await sbprov.getAccount(addressx);
	//const accounttn = await mnprov.getAccount(addresstn);
	console.log("accounttn :" + JSON.stringify(accounttn.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "accounttn  : " + accounttn + "\n";
	responseStr += JSON.stringify(accounttn.coins,null,2) + "\n";
	responseStr += "theta:  " + (accounttn.coins.thetawei / 1000000000000000000) + "\n";
	responseStr += "tfuel: " + (accounttn.coins.tfuelwei / 1000000000000000000) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/interact-contract-sb", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=94284C201B6DfF344E086B2878b8fd0cF8B9ED28 | jq .coins
	// https://smart-contract-testnet-explorer.thetatoken.org/account/0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28
	const accountx = await sbprov.getAccount(addressx);
	//const accountx = await mnprov.getAccount(addresstn);
	console.log("accountx :" + JSON.stringify(accountx.coins,null,2));

	// https://docs.thetatoken.org/docs/theta-js-sdk-contract
	const contractAddress = '0x82a79db286e85803c3e5b84ec19901747d19aab9';
	// When copying from Remix IDE, transform with this.
	// cat ABI | tr -d '[:space:]' > ABI.abi
	const ABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]';
	
	const wallet = new Wallet(privkeyx.value);
	const connectedWallet = wallet.connect(sbprov);

	const contract = new thetajs.Contract(contractAddress, ABI, connectedWallet);

	// Read the name of a TNT-20 contract
	const contract_name = await contract.name();
	const contract_totalSupply = await contract.totalSupply();
	const contract_version = await contract.version();
	const contract_symbol = await contract.symbol();
	const contract_balanceOfx = await contract.balanceOf(addressx);
	const contract_balanceOf2 = await contract.balanceOf(address2);
	
	// Transaction: Transfer TNT-20 tokens (write)
	const contract_transfer_result = await contract.transfer(address2, "9");
	
	const blockHash = contract_transfer_result.hash;
	const block = await sbprov.getTransaction(blockHash);

	const after_balanceOfx = await contract.balanceOf(addressx);
	const after_balanceOf2 = await contract.balanceOf(address2);

// data a9059cbb0000000000000000000000000d2fd67d573c8ecb4161510fc00754d64b401f86000000000000000000000000000000000000000000000000000000000000000a

	responseStr += "<pre>\n";
	responseStr += "accountx  : " + accountx + "\n";
	responseStr += JSON.stringify(accountx.coins,null,2) + "\n";
	responseStr += "theta:  " + (accountx.coins.thetawei / 1000000000000000000) + "\n";
	responseStr += "tfuel: " + (accountx.coins.tfuelwei / 1000000000000000000) + "\n";
	responseStr += "contract.name: " + contract_name + "\n";
	responseStr += "contract.totalSupply: " + contract_totalSupply + "\n";
	responseStr += "contract.version: " + contract_version + "\n";
	responseStr += "contract.symbol: " + contract_symbol + "\n";
	responseStr += "before.balanceOfx: " + contract_balanceOfx + "\n";
	responseStr += "before.balanceOf2: " + contract_balanceOf2 + "\n";
	responseStr += "contract.tx: " + contract_symbol + "\n";
	responseStr += "transfer :" + JSON.stringify(contract_transfer_result,null,2) + "\n";
	responseStr += "blockHash :" + JSON.stringify(blockHash,null,2) + "\n";
	responseStr += "block :" + JSON.stringify(block,null,2) + "\n";
	responseStr += "after.balanceOfx: " + after_balanceOfx + "\n";
	responseStr += "after.balanceOf2: " + after_balanceOf2 + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/copy-me", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

server.on("request", app);

server.listen(port, function () {
	console.info("Backend: http://localhost:" + server.address().port);
});
