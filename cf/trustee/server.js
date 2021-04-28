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
const address2 = "0x0d2fD67d573c8ecB4161510fc00754d64B401F86";

const services = xsenv.getServices({
    uaa: { tag: 'xsuaa' },
    credstore: { tag: 'credstore' }
});
  
//const binding = JSON.parse(process.env.VCAP_SERVICES).credstore[0].credentials;
const binding = services.credstore;

var privkey = null;

const provider = new thetajs.providers.HttpProvider('privatenet', 'http://localhost:16888/rpc'); // Works

async function doCredStore() {
	privkey = await readCredential(binding, "privatenet", "password", "privkey");
	console.log("read privkey:" + JSON.stringify(privkey));
}

doCredStore();



var app = express();

var server = require("http").createServer();
var port = process.env.PORT || 3000;

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
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">The Links page.</a><br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/links", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";
	responseStr += "<a href=\"/trustee/chkprivkey\">Check PrivKey</a><br />";
	responseStr += "<a href=\"/trustee/block-height\">block-height</a><br />";
	responseStr += "<a href=\"/trustee/get-account\">get-account</a> Get Account Balance<br />";
	responseStr += "<a href=\"/trustee/get-account2\">get-account2</a> Get Account2 Balance<br />";
	responseStr += "<a href=\"/trustee/send-theta\">send-theta</a> Send Theta and TFuel from Account to Account2<br />";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/chkprivkey", function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";
	responseStr += "<pre>\n";
	responseStr += privkey.status + "\n";
	responseStr += "</pre>\n";
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/block-height", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
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
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	var account = await provider.getAccount(address);
	console.log("account :" + JSON.stringify(account.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "account  : " + address + "\n";
	responseStr += JSON.stringify(account.coins,null,2) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/get-account2", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	var account2 = await provider.getAccount(address);
	console.log("account2 :" + JSON.stringify(account2.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "account2  : " + address2 + "\n";
	responseStr += JSON.stringify(account2.coins,null,2) + "\n";
	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

app.get("/trustee/send-theta", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	try {

		const count = await provider.getTransactionCount(address);
		responseStr += "last sequence count :" + count + "\n";

		const wallet = new Wallet(privkey.value);
		const connectedWallet = wallet.connect(provider);

		const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei
		const thetaWeiToSend = (new BigNumber(1)).multipliedBy(ten18);
		const tfuelWeiToSend = (new BigNumber(0.0001)).multipliedBy(ten18);
		const from = address;
		const to = address2;
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
		
		
		if (true) {
			const txresult = await connectedWallet.sendTransaction(transaction);
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

app.get("/trustee/copy-me", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><h2>SUCCESS!</h2><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});



server.on("request", app);

server.listen(port, function () {
	console.info("Backend: " + server.address().port);
});
