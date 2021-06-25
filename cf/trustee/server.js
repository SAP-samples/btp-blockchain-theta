/*eslint no-console: 0*/
"use strict";

var xsenv = require("@sap/xsenv");
var xssec = require("@sap/xssec");
var hdbext = require("@sap/hdbext");
var express = require("express");
var passport = require("passport");
var stringifyObj = require("stringify-object");
var bodyParser = require("body-parser");
var randomLorem = require('random-lorem');

var fs = require('fs');

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
const ServicePaymentTransaction = thetajs.transactions.ServicePaymentTransaction;
const SignatureFromBytes = thetajs.signers.SignatureFromBytes;
const Contract = thetajs.Contract;
const ContractFactory = thetajs.ContractFactory;
const { ChainIds } = thetajs.networks;


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

const Alice = address;
const Bob = "0x70f587259738cB626A1720Af7038B8DcDb6a42a0";
const Carol = "0xcd56123D0c5D6C1Ba4D39367b88cba61D93F5405";

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
var privkeyalice = null;
var privkeybob = null;
var privkeycarol = null;

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

// Uncomment the provider for the network you want to work with.

const provider = new thetajs.providers.HttpProvider('privatenet', privateNetURL + '/rpc'); // CloudFoundry deployed module
//const provider = new thetajs.providers.HttpProvider(ChainIds.Testnet); // Testnet
//const provider = new thetajs.providers.HttpProvider(ChainIds.Mainnet); // Mainnet
//const provider = new thetajs.providers.HttpProvider(ChainIds.Privatenet); // SmartContracts Sandbox
//const provider = new thetajs.providers.HttpProvider('privatenet', 'http://localhost:16888/rpc'); // Docker running locally on 16888

console.log("provider :" + JSON.stringify(provider,null,2));

async function doCredStore() {
	try {
		privkey = await readCredential(binding, "privatenet", "password", "privkey");
		console.log("read privkey:" + JSON.stringify(privkey));
	} catch (e) {
		console.log("Error reading privkey credential: " + e);
		console.log("binding:" + JSON.stringify(binding,null,2));
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
			privkeyalice = {
				name: "privkeyalice", 
				value: "0x93a90ea508331dfdf27fb79757d4250b4e84954927ba0073cd67454ac432c737", 
				username: "built-in", 
				metadata: "{\"url\": \"https://www.example.com/path\"}",
				status: "built-in"
			};
			privkeybob = {
				name: "privkeybob", 
				value: "0x8bd65c4780c5f0b45930852e319cdbb0c44f1600f9a9e7f10778125cc14f02f3", 
				username: "built-in", 
				metadata: "{\"url\": \"https://www.example.com/path\"}",
				status: "built-in"
			};
			privkeycarol = {
				name: "privkeycarol", 
				value: "0x1610d51f271d9588ffd6e0f4d89a271428be0a89a12633474d21233c10c09eb1", 
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

	responseStr += "<a href=\"/trustee/deploy-last-compiled-contract\" target=\"_blank\">deploy-last-compiled-contract</a> Deploy Last Compiled Contract <a href=\"/trustee/deploy-last-compiled-contract?action=doit\" target=\"_blank\"> Do-It </a><br />";
	responseStr += "<a href=\"/trustee/interact-with-last-contract\" target=\"_blank\">interact-with-last-contract</a> Interact with Last Contract<br />";

	responseStr += "<br />";

	responseStr += "<a href=\"/trustee/send-theta?from=Alice&to=Bob&theta=0&tfuel=1&action=doit\" target=\"_blank\">send 1 TFuel to Bob</a><br />";
	responseStr += "<a href=\"/trustee/send-theta?from=Alice&to=Carol&theta=0&tfuel=1&action=doit\" target=\"_blank\">send 1 TFuel to Carol</a><br />";
	responseStr += "<br />";

	responseStr += "<a href=\"/trustee/micro-payments\" target=\"_blank\">micro-payments</a> micro-payment Accounts Status<br />";
	responseStr += "<a href=\"/trustee/reserve-fund\" target=\"_blank\">reserve-fund</a> Create Reserve Fund <a href=\"/trustee/reserve-fund?action=doit\" target=\"_blank\">doit</a><br />";
	responseStr += "<a href=\"/trustee/service-payment?from=Alice&to=Bob&theta=0&tfuel=9&on_chain=false&action=doit&dry_run=true\" target=\"_blank\">Off-Chain service-payment Alice -> Bob</a><br />";
	responseStr += "<a href=\"/trustee/service-payment?from=Alice&to=Bob&theta=0&tfuel=9&on_chain=true&action=doit&dry_run=false\" target=\"_blank\">On-Chain service-payment Alice -> Bob</a><br />";

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

	var addr = address;
	if (req.query) {

		if (req.query.addr) {

			switch (req.query.addr) {
				case "Alice":
					addr = Alice;
					break;
				case "Bob":
					addr = Bob;
					break;
				case "Carol":
					addr = Carol;
					break;
				case "2":
					addr = address2;
					break;
				default:
					addr = address;
			}
		}
	}

	// thetacli query account --address=2E833968E5bB786Ae419c4d13189fB081Cc43bab | jq .coins
	var account = await provider.getAccount(addr);
	console.log("account :" + JSON.stringify(account.coins,null,2));

	responseStr += "<pre>\n";
	responseStr += "account  : " + addr + "\n";
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
	var accountx = await provider.getAccount(addressx);
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
		var thetaWeiToSend = 0;
		var tfuelWeiToSend = 0;

		const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei

		if (req.query && req.query.reverse && (req.query.reverse == "true")) {
			from = address2;
			to = address;
			use_privkey = privkey2;
		}

		if (req.query) {

			if (req.query.from) {

				switch (req.query.from) {
					case "Alice":
						from = Alice;
						use_privkey = privkeyalice;
						break;
					case "Bob":
						from = Bob;
						use_privkey = privkeybob;
						break;
					case "Carol":
						from = Carol;
						use_privkey = privkeycarol;
						break;
					default:
						from = address;
						use_privkey = privkey;
				}
			}

			if (req.query.to) {

				switch (req.query.to) {
					case "Alice":
						to = Alice;
						break;
					case "Bob":
						to = Bob;
						break;
					case "Carol":
						to = Carol;
						break;
					default:
						from = address2;
				}
			}

			if (req.query.theta) {
				thetaWeiToSend = (new BigNumber(req.query.theta)).multipliedBy(ten18);
			}
			else {
				thetaWeiToSend = (new BigNumber(1.0)).multipliedBy(ten18);
			}

			if (req.query.tfuel) {
				tfuelWeiToSend = (new BigNumber(req.query.tfuel)).multipliedBy(ten18);
			}
			else {
				tfuelWeiToSend = (new BigNumber(10.0)).multipliedBy(ten18);
			}
		}

		const count = await provider.getTransactionCount(from);
		responseStr += "last sequence count :" + count + "\n";

		const wallet = new Wallet(use_privkey.value);
		const connectedWallet = wallet.connect(provider);

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
		
		console.log("SendRequest:\n" + JSON.stringify(transaction,null,2));

		const tfuelperusd = 0.335824;	// As of 2021-04-29
		const feetfuel = 0.3;
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

app.get("/trustee/deploy-last-compiled-contract", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=94284C201B6DfF344E086B2878b8fd0cF8B9ED28 | jq .coins
	// https://smart-contract-testnet-explorer.thetatoken.org/account/0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28
    const account = await provider.getAccount(address);
	//const accountx = await mnprov.getAccount(addresstn);
	console.log("account :" + JSON.stringify(account.coins,null,2));

 	responseStr += "<pre>\n";
	responseStr += "account  : " + account + "\n";
	responseStr += JSON.stringify(account.coins,null,2) + "\n";
   
	// https://docs.thetatoken.org/docs/theta-js-sdk-contract
	const contractAddress = '0x82a79db286e85803c3e5b84ec19901747d19aab9';
	// When copying from Remix IDE, transform with this.
	// cat ABI | tr -d '[:space:]' > ABI.abi
	const ABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]';

	//const ABIToDeploy = "[{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"sender\",\"type\":\"address\"},{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseAllowance\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseAllowance\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"owner\",\"type\":\"address\"},{\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"symbol\",\"type\":\"string\"},{\"name\":\"decimals\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]";

	var ABIToDeploy = "";
	var objectToDeploy = "";
	var opcodesToDeploy = "";
	var sourceMapToDeploy = "";
	var byteCodeToDeploy = {};
	
	try {

        // https://docs.thetatoken.org/docs/theta-js-sdk-contract-factory#define-your-abi-and-bytecode-to-deploy

        ABIToDeploy = JSON.parse(fs.readFileSync('../../sol/outbin/abi.json','utf8'));
        // Doc sample ABIToDeploy = "[{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"sender\",\"type\":\"address\"},{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseAllowance\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseAllowance\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"owner\",\"type\":\"address\"},{\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"symbol\",\"type\":\"string\"},{\"name\":\"decimals\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]";

        objectToDeploy = JSON.parse(fs.readFileSync('../../sol/outbin/object.json','utf8'));
        // Doc sample objectToDeploy = "60806040523480156200001157600080fd5b5060405162001454380380620014548339810180604052810190808051820192919060200180518201929190602001805190602001909291908051906020019092919050505083600290805190602001906200006f9291906200033a565b508260039080519060200190620000889291906200033a565b5081600460006101000a81548160ff021916908360ff160217905550620000c7338360ff16600a0a8302620000d1640100000000026401000000009004565b50505050620003e9565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415151562000177576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f45524332303a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b6200019c81600554620002af6401000000000262000fa5179091906401000000009004565b60058190555062000203816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054620002af6401000000000262000fa5179091906401000000009004565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600080828401905083811015151562000330576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200037d57805160ff1916838001178555620003ae565b82800160010185558215620003ae579182015b82811115620003ad57825182559160200191906001019062000390565b5b509050620003bd9190620003c1565b5090565b620003e691905b80821115620003e2576000816000905550600101620003c8565b5090565b90565b61105b80620003f96000396000f3006080604052600436106100af576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100b4578063095ea7b31461014457806318160ddd146101a957806323b872dd146101d4578063313ce56714610259578063395093511461028a57806370a08231146102ef57806395d89b4114610346578063a457c2d7146103d6578063a9059cbb1461043b578063dd62ed3e146104a0575b600080fd5b3480156100c057600080fd5b506100c9610517565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101095780820151818401526020810190506100ee565b50505050905090810190601f1680156101365780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561015057600080fd5b5061018f600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506105b9565b604051808215151515815260200191505060405180910390f35b3480156101b557600080fd5b506101be6105d0565b6040518082815260200191505060405180910390f35b3480156101e057600080fd5b5061023f600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506105da565b604051808215151515815260200191505060405180910390f35b34801561026557600080fd5b5061026e61068b565b604051808260ff1660ff16815260200191505060405180910390f35b34801561029657600080fd5b506102d5600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506106a2565b604051808215151515815260200191505060405180910390f35b3480156102fb57600080fd5b50610330600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610747565b6040518082815260200191505060405180910390f35b34801561035257600080fd5b5061035b61078f565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561039b578082015181840152602081019050610380565b50505050905090810190601f1680156103c85780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156103e257600080fd5b50610421600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610831565b604051808215151515815260200191505060405180910390f35b34801561044757600080fd5b50610486600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506108d6565b604051808215151515815260200191505060405180910390f35b3480156104ac57600080fd5b50610501600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506108ed565b6040518082815260200191505060405180910390f35b606060028054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105af5780601f10610584576101008083540402835291602001916105af565b820191906000526020600020905b81548152906001019060200180831161059257829003601f168201915b5050505050905090565b60006105c6338484610974565b6001905092915050565b6000600554905090565b60006105e7848484610bf5565b610680843361067b85600160008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610f1b90919063ffffffff16565b610974565b600190509392505050565b6000600460009054906101000a900460ff16905090565b600061073d338461073885600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610fa590919063ffffffff16565b610974565b6001905092915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b606060038054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156108275780601f106107fc57610100808354040283529160200191610827565b820191906000526020600020905b81548152906001019060200180831161080a57829003601f168201915b5050505050905090565b60006108cc33846108c785600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008973ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610f1b90919063ffffffff16565b610974565b6001905092915050565b60006108e3338484610bf5565b6001905092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614151515610a3f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f45524332303a20617070726f76652066726f6d20746865207a65726f2061646481526020017f726573730000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614151515610b0a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001807f45524332303a20617070726f766520746f20746865207a65726f20616464726581526020017f737300000000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614151515610cc0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260258152602001807f45524332303a207472616e736665722066726f6d20746865207a65726f20616481526020017f647265737300000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614151515610d8b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001807f45524332303a207472616e7366657220746f20746865207a65726f206164647281526020017f657373000000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b610ddc816000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610f1b90919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610e6f816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054610fa590919063ffffffff16565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b600080838311151515610f96576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b82840390508091505092915050565b6000808284019050838110151515611025576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b80915050929150505600a165627a7a723058206e8ddcb10b1fb8d57803bc2220d9e4d58168aa7be9402365efb72af54e1601520029";

        opcodesToDeploy = JSON.parse(fs.readFileSync('../../sol/outbin/opcodes.json','utf8'));
		// Doc sample opcodesToDeploy = "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH3 0x11 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x40 MLOAD PUSH3 0x1454 CODESIZE SUB DUP1 PUSH3 0x1454 DUP4 CODECOPY DUP2 ADD DUP1 PUSH1 0x40 MSTORE DUP2 ADD SWAP1 DUP1 DUP1 MLOAD DUP3 ADD SWAP3 SWAP2 SWAP1 PUSH1 0x20 ADD DUP1 MLOAD DUP3 ADD SWAP3 SWAP2 SWAP1 PUSH1 0x20 ADD DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP DUP4 PUSH1 0x2 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x6F SWAP3 SWAP2 SWAP1 PUSH3 0x33A JUMP JUMPDEST POP DUP3 PUSH1 0x3 SWAP1 DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 PUSH3 0x88 SWAP3 SWAP2 SWAP1 PUSH3 0x33A JUMP JUMPDEST POP DUP2 PUSH1 0x4 PUSH1 0x0 PUSH2 0x100 EXP DUP2 SLOAD DUP2 PUSH1 0xFF MUL NOT AND SWAP1 DUP4 PUSH1 0xFF AND MUL OR SWAP1 SSTORE POP PUSH3 0xC7 CALLER DUP4 PUSH1 0xFF AND PUSH1 0xA EXP DUP4 MUL PUSH3 0xD1 PUSH5 0x100000000 MUL PUSH5 0x100000000 SWAP1 DIV JUMP JUMPDEST POP POP POP POP PUSH3 0x3E9 JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO ISZERO ISZERO PUSH3 0x177 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1F DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x45524332303A206D696E7420746F20746865207A65726F206164647265737300 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH3 0x19C DUP2 PUSH1 0x5 SLOAD PUSH3 0x2AF PUSH5 0x100000000 MUL PUSH3 0xFA5 OR SWAP1 SWAP2 SWAP1 PUSH5 0x100000000 SWAP1 DIV JUMP JUMPDEST PUSH1 0x5 DUP2 SWAP1 SSTORE POP PUSH3 0x203 DUP2 PUSH1 0x0 DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH3 0x2AF PUSH5 0x100000000 MUL PUSH3 0xFA5 OR SWAP1 SWAP2 SWAP1 PUSH5 0x100000000 SWAP1 DIV JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 DUP5 ADD SWAP1 POP DUP4 DUP2 LT ISZERO ISZERO ISZERO PUSH3 0x330 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1B DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x536166654D6174683A206164646974696F6E206F766572666C6F770000000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 SWAP2 POP POP SWAP3 SWAP2 POP POP JUMP JUMPDEST DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 PUSH1 0x1F ADD PUSH1 0x20 SWAP1 DIV DUP2 ADD SWAP3 DUP3 PUSH1 0x1F LT PUSH3 0x37D JUMPI DUP1 MLOAD PUSH1 0xFF NOT AND DUP4 DUP1 ADD OR DUP6 SSTORE PUSH3 0x3AE JUMP JUMPDEST DUP3 DUP1 ADD PUSH1 0x1 ADD DUP6 SSTORE DUP3 ISZERO PUSH3 0x3AE JUMPI SWAP2 DUP3 ADD JUMPDEST DUP3 DUP2 GT ISZERO PUSH3 0x3AD JUMPI DUP3 MLOAD DUP3 SSTORE SWAP2 PUSH1 0x20 ADD SWAP2 SWAP1 PUSH1 0x1 ADD SWAP1 PUSH3 0x390 JUMP JUMPDEST JUMPDEST POP SWAP1 POP PUSH3 0x3BD SWAP2 SWAP1 PUSH3 0x3C1 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST PUSH3 0x3E6 SWAP2 SWAP1 JUMPDEST DUP1 DUP3 GT ISZERO PUSH3 0x3E2 JUMPI PUSH1 0x0 DUP2 PUSH1 0x0 SWAP1 SSTORE POP PUSH1 0x1 ADD PUSH3 0x3C8 JUMP JUMPDEST POP SWAP1 JUMP JUMPDEST SWAP1 JUMP JUMPDEST PUSH2 0x105B DUP1 PUSH3 0x3F9 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH2 0xAF JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV PUSH4 0xFFFFFFFF AND DUP1 PUSH4 0x6FDDE03 EQ PUSH2 0xB4 JUMPI DUP1 PUSH4 0x95EA7B3 EQ PUSH2 0x144 JUMPI DUP1 PUSH4 0x18160DDD EQ PUSH2 0x1A9 JUMPI DUP1 PUSH4 0x23B872DD EQ PUSH2 0x1D4 JUMPI DUP1 PUSH4 0x313CE567 EQ PUSH2 0x259 JUMPI DUP1 PUSH4 0x39509351 EQ PUSH2 0x28A JUMPI DUP1 PUSH4 0x70A08231 EQ PUSH2 0x2EF JUMPI DUP1 PUSH4 0x95D89B41 EQ PUSH2 0x346 JUMPI DUP1 PUSH4 0xA457C2D7 EQ PUSH2 0x3D6 JUMPI DUP1 PUSH4 0xA9059CBB EQ PUSH2 0x43B JUMPI DUP1 PUSH4 0xDD62ED3E EQ PUSH2 0x4A0 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0xC0 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0xC9 PUSH2 0x517 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x109 JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0xEE JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x136 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x150 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x18F PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x5B9 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x1B5 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x1BE PUSH2 0x5D0 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x1E0 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x23F PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x5DA JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x265 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x26E PUSH2 0x68B JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 PUSH1 0xFF AND PUSH1 0xFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x296 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x2D5 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x6A2 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x2FB JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x330 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x747 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x352 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x35B PUSH2 0x78F JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE DUP4 DUP2 DUP2 MLOAD DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP DUP1 MLOAD SWAP1 PUSH1 0x20 ADD SWAP1 DUP1 DUP4 DUP4 PUSH1 0x0 JUMPDEST DUP4 DUP2 LT ISZERO PUSH2 0x39B JUMPI DUP1 DUP3 ADD MLOAD DUP2 DUP5 ADD MSTORE PUSH1 0x20 DUP2 ADD SWAP1 POP PUSH2 0x380 JUMP JUMPDEST POP POP POP POP SWAP1 POP SWAP1 DUP2 ADD SWAP1 PUSH1 0x1F AND DUP1 ISZERO PUSH2 0x3C8 JUMPI DUP1 DUP3 SUB DUP1 MLOAD PUSH1 0x1 DUP4 PUSH1 0x20 SUB PUSH2 0x100 EXP SUB NOT AND DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP JUMPDEST POP SWAP3 POP POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x3E2 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x421 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x831 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x447 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x486 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x8D6 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 ISZERO ISZERO ISZERO ISZERO DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH2 0x4AC JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH2 0x501 PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 DUP1 CALLDATALOAD PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH2 0x8ED JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST PUSH1 0x60 PUSH1 0x2 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x5AF JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x584 JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x5AF JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x592 JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x5C6 CALLER DUP5 DUP5 PUSH2 0x974 JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x5 SLOAD SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x5E7 DUP5 DUP5 DUP5 PUSH2 0xBF5 JUMP JUMPDEST PUSH2 0x680 DUP5 CALLER PUSH2 0x67B DUP6 PUSH1 0x1 PUSH1 0x0 DUP11 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 CALLER PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0xF1B SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH2 0x974 JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP4 SWAP3 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x4 PUSH1 0x0 SWAP1 SLOAD SWAP1 PUSH2 0x100 EXP SWAP1 DIV PUSH1 0xFF AND SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x73D CALLER DUP5 PUSH2 0x738 DUP6 PUSH1 0x1 PUSH1 0x0 CALLER PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP10 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0xFA5 SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH2 0x974 JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 PUSH1 0x0 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP SWAP2 SWAP1 POP JUMP JUMPDEST PUSH1 0x60 PUSH1 0x3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 PUSH1 0x1F ADD PUSH1 0x20 DUP1 SWAP2 DIV MUL PUSH1 0x20 ADD PUSH1 0x40 MLOAD SWAP1 DUP2 ADD PUSH1 0x40 MSTORE DUP1 SWAP3 SWAP2 SWAP1 DUP2 DUP2 MSTORE PUSH1 0x20 ADD DUP3 DUP1 SLOAD PUSH1 0x1 DUP2 PUSH1 0x1 AND ISZERO PUSH2 0x100 MUL SUB AND PUSH1 0x2 SWAP1 DIV DUP1 ISZERO PUSH2 0x827 JUMPI DUP1 PUSH1 0x1F LT PUSH2 0x7FC JUMPI PUSH2 0x100 DUP1 DUP4 SLOAD DIV MUL DUP4 MSTORE SWAP2 PUSH1 0x20 ADD SWAP2 PUSH2 0x827 JUMP JUMPDEST DUP3 ADD SWAP2 SWAP1 PUSH1 0x0 MSTORE PUSH1 0x20 PUSH1 0x0 KECCAK256 SWAP1 JUMPDEST DUP2 SLOAD DUP2 MSTORE SWAP1 PUSH1 0x1 ADD SWAP1 PUSH1 0x20 ADD DUP1 DUP4 GT PUSH2 0x80A JUMPI DUP3 SWAP1 SUB PUSH1 0x1F AND DUP3 ADD SWAP2 JUMPDEST POP POP POP POP POP SWAP1 POP SWAP1 JUMP JUMPDEST PUSH1 0x0 PUSH2 0x8CC CALLER DUP5 PUSH2 0x8C7 DUP6 PUSH1 0x1 PUSH1 0x0 CALLER PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP10 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0xF1B SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH2 0x974 JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH2 0x8E3 CALLER DUP5 DUP5 PUSH2 0xBF5 JUMP JUMPDEST PUSH1 0x1 SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH1 0x1 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD SWAP1 POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO ISZERO ISZERO PUSH2 0xA3F JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x24 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x45524332303A20617070726F76652066726F6D20746865207A65726F20616464 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x7265737300000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO ISZERO ISZERO PUSH2 0xB0A JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x22 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x45524332303A20617070726F766520746F20746865207A65726F206164647265 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x7373000000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 PUSH1 0x1 PUSH1 0x0 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 PUSH1 0x0 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0x8C5BE1E5EBEC7D5BD14F71427D1E84F3DD0314C0F7B2291E5B200AC8C7C3B925 DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP POP JUMP JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO ISZERO ISZERO PUSH2 0xCC0 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x25 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x45524332303A207472616E736665722066726F6D20746865207A65726F206164 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x6472657373000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH1 0x0 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP3 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND EQ ISZERO ISZERO ISZERO PUSH2 0xD8B JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x23 DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x45524332303A207472616E7366657220746F20746865207A65726F2061646472 DUP2 MSTORE PUSH1 0x20 ADD PUSH32 0x6573730000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE POP PUSH1 0x40 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST PUSH2 0xDDC DUP2 PUSH1 0x0 DUP1 DUP7 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0xF1B SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH1 0x0 DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP PUSH2 0xE6F DUP2 PUSH1 0x0 DUP1 DUP6 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 SLOAD PUSH2 0xFA5 SWAP1 SWAP2 SWAP1 PUSH4 0xFFFFFFFF AND JUMP JUMPDEST PUSH1 0x0 DUP1 DUP5 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP2 MSTORE PUSH1 0x20 ADD SWAP1 DUP2 MSTORE PUSH1 0x20 ADD PUSH1 0x0 KECCAK256 DUP2 SWAP1 SSTORE POP DUP2 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND DUP4 PUSH20 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF AND PUSH32 0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF DUP4 PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 LOG3 POP POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP4 DUP4 GT ISZERO ISZERO ISZERO PUSH2 0xF96 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1E DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x536166654D6174683A207375627472616374696F6E206F766572666C6F770000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP3 DUP5 SUB SWAP1 POP DUP1 SWAP2 POP POP SWAP3 SWAP2 POP POP JUMP JUMPDEST PUSH1 0x0 DUP1 DUP3 DUP5 ADD SWAP1 POP DUP4 DUP2 LT ISZERO ISZERO ISZERO PUSH2 0x1025 JUMPI PUSH1 0x40 MLOAD PUSH32 0x8C379A000000000000000000000000000000000000000000000000000000000 DUP2 MSTORE PUSH1 0x4 ADD DUP1 DUP1 PUSH1 0x20 ADD DUP3 DUP2 SUB DUP3 MSTORE PUSH1 0x1B DUP2 MSTORE PUSH1 0x20 ADD DUP1 PUSH32 0x536166654D6174683A206164646974696F6E206F766572666C6F770000000000 DUP2 MSTORE POP PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 REVERT JUMPDEST DUP1 SWAP2 POP POP SWAP3 SWAP2 POP POP JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 PUSH15 0x8DDCB10B1FB8D57803BC2220D9E4D5 DUP2 PUSH9 0xAA7BE9402365EFB72A 0xf5 0x4e AND ADD MSTORE STOP 0x29 ";

        sourceMapToDeploy = JSON.parse(fs.readFileSync('../../sol/outbin/sourceMap.json','utf8'));
		// Doc sample sourceMapToDeploy = "4920:8128:0:-;;;5320:252;8:9:-1;5:2;;;30:1;27;20:12;5:2;5320:252:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;5432:4;5424:5;:12;;;;;;;;;;;;:::i;:::-;;5456:6;5446:7;:16;;;;;;;;;;;;:::i;:::-;;5484:8;5472:9;;:20;;;;;;;;;;;;;;;;;;5502:51;5508:10;5543:8;5535:17;;5529:2;:23;5520:6;:32;5502:5;;;:51;;;:::i;:::-;5320:252;;;;4920:8128;;11014:301;11108:1;11089:21;;:7;:21;;;;11081:65;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;11171:24;11188:6;11171:12;;:16;;;;;;:24;;;;;:::i;:::-;11156:12;:39;;;;11226:30;11249:6;11226:9;:18;11236:7;11226:18;;;;;;;;;;;;;;;;:22;;;;;;:30;;;;;:::i;:::-;11205:9;:18;11215:7;11205:18;;;;;;;;;;;;;;;:51;;;;11292:7;11271:37;;11288:1;11271:37;;;11301:6;11271:37;;;;;;;;;;;;;;;;;;11014:301;;:::o;1086:175::-;1144:7;1163:9;1179:1;1175;:5;1163:17;;1203:1;1198;:6;;1190:46;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1253:1;1246:8;;1086:175;;;;;:::o;4920:8128::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o;:::-;;;;;;;";

        byteCodeToDeploy = {
			"linkReferences": {},
			"object": objectToDeploy,
			"opcodes": opcodesToDeploy,
			"sourceMap": sourceMapToDeploy
        };
        
        responseStr += "ABIToDeploy  : \n===vvv=== ABI ===vvv===\n" + ABIToDeploy + "\n===^^^=== ABI ===^^^===\n";
	    responseStr += "ABIToDeploy  : \n===vvv=== Bypte Code ===vvv===\n" + JSON.stringify(byteCodeToDeploy,null,2) + "\n===^^^=== Byte Code ===^^^===\n";
	    responseStr += "ABIToDeploy  : \\nn===vvv=== ABI ===vvv===\n" + JSON.stringify(JSON.parse(ABIToDeploy),null,2) + "\n===^^^=== ABI ===^^^===\n";

        if (req.query && req.query.action && (req.query.action == "doit")) {

            const wallet = new Wallet(privkey.value);
            const connectedWallet = wallet.connect(provider);

            // https://docs.thetatoken.org/docs/theta-js-sdk-contract-factory
            const contractToDeploy = new thetajs.ContractFactory(ABIToDeploy, byteCodeToDeploy, connectedWallet);
            
            // https://docs.thetatoken.org/docs/theta-js-sdk-contract-factory#deploy-contract
            
            // Doc sample const result = await contractToDeploy.deploy("TestArgs", "TARGS", 18, "1000000000");
            //const result = await contractToDeploy.simulateDeploy("Drew", "DRW", 18, "1000000000");
            //const result = await contractToDeploy.simulateDeploy();
            const result = await contractToDeploy.deploy();
            console.log("result :" + JSON.stringify(result,null,2));
            const deployedAddress = result.contract_address;
			process.env.CONTRACT_ADDR = deployedAddress;
            responseStr += "\n</pre><strong>deployedAddress  : " + deployedAddress + "</strong><pre>\n";
            responseStr += JSON.stringify(result,null,2) + "\n";
        }
	} catch (e) {
		console.error(e);
        responseStr += "error  : " + e + "\n";
	}
	
    responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

// zombie.sol Contract Addr on SandBox: 0xdcfb7bece0b71d3fd58831d7b9d9c2f63cdb4881
// OriginalGN.sol Contract Addr on SandBox: 0x75d03001e3596f9cbc88991e5f5a02cfacca0f23

// 0x060b56d20d0c721f260a3bff6d9361a1868d7778 4 deploy params


// zombile.sol Contract Addr on theta-privatenet: deployedAddress  : 0xba30579024448b979b6ee2f58d30d4e814de2f7e


function getLastContractAddress(req) {

	var addr = 'unknown';

	if (process.env.CONTRACT_ADDR) {
        addr = process.env.CONTRACT_ADDR;
	}

	if (req.query && req.query.addr) {
        if (req.query.addr == "0x00...00") {
            addr = 'unknown';
        }
        else {
            addr = req.query.addr;
        }
	}
	
	return addr;
}


// need to interact with above localnet contract 

app.get("/trustee/interact-with-last-contract", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	// thetacli query account --address=94284C201B6DfF344E086B2878b8fd0cF8B9ED28 | jq .coins
	// https://smart-contract-testnet-explorer.thetatoken.org/account/0x94284C201B6DfF344E086B2878b8fd0cF8B9ED28
	const account = await provider.getAccount(address);
	//const contract = await mnprov.getAccount(addresstn);
	console.log("account :" + JSON.stringify(account.coins,null,2));

	// https://docs.thetatoken.org/docs/theta-js-sdk-contract
    var contractAddress = getLastContractAddress(req);
    // Override with a known Smart Contract Address
    //contractAddress = '0x9572ecea04fe74b642400dbb04952e91049c9b3d';
    //contractAddress = '0x2e2a6ef62dedb1295a4040a0e40bb6b782472ca3';

	// When copying from Remix IDE, transform with this.
    // cat ABI | tr -d '[:space:]' > ABI.abi

    responseStr += "<pre>\n";

    if (contractAddress != "unknown") {
        var ABI = "";
        var idx = 1;
        try {
            // https://docs.thetatoken.org/docs/theta-js-sdk-contract-factory#define-your-abi-and-bytecode-to-deploy

            ABI = JSON.parse(fs.readFileSync('../../sol/outbin/abi.json','utf8'));
            // Doc sample ABIToDeploy = "[{\"constant\":true,\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"sender\",\"type\":\"address\"},{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"name\":\"\",\"type\":\"uint8\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseAllowance\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseAllowance\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"recipient\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"owner\",\"type\":\"address\"},{\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"symbol\",\"type\":\"string\"},{\"name\":\"decimals\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"}]";

            (JSON.parse(ABI)).forEach(element => {
                responseStr += "name : <a href=\"/trustee/interact-with-last-contract?function=" + element.name;
                if (element.stateMutability != "view") {
                    responseStr += "&hash=show";
                }
                var idx = 1;
                element.inputs.forEach(param => {
                    responseStr += "&param" + idx + "=";
                    if (param.type == "string") {
                        responseStr += randomLorem({ syllables: 4 });
                    }
                    else {
                        responseStr += "0";
                    }
                    idx++;
                });

                responseStr += "\">" + element.name + "(";

                var idx = 1;
                element.inputs.forEach(param => {
                    responseStr += param.type + ":" + param.name + " ";
                    idx++;
                });

                responseStr += ")" + "</a>\n";
            });

        } catch(e) {
            console.error(e);
            responseStr += "error : " + e + "\n";
        }
        
        
        const wallet = new Wallet(privkey.value);
        const connectedWallet = wallet.connect(provider);


        const contract = new thetajs.Contract(contractAddress, ABI, connectedWallet);

        var func_return = {};
        if (req.query && req.query.function) {
            if (req.query.param1) {
                func_return = await contract[req.query.function](req.query.param1);
            }
            else if (req.query.param2) {
                func_return = await contract[req.query.function](req.query.param1,req.query.param2);
            }
            else {
                func_return = await contract[req.query.function]();
            }
            responseStr += "func_return : " + JSON.stringify(func_return,null,2) + "\n";
            if (req.query.hash && (req.query.hash == "show")) {
                const blockHash = func_return.hash;
                const block = await provider.getTransaction(blockHash);
                responseStr += "block : " + JSON.stringify(block,null,2) + "\n";
            }
        } else {
            responseStr += "ABI : " + JSON.stringify(JSON.parse(ABI),null,2) + "\n";
        }

        // responseStr += "contract : " + JSON.stringify(contract,null,2) + "\n";

        //Parse ABI and loop through all the readonly things

        // Read the name of a TNT-20 contract
        //const contract_name = await contract.name();
        
        // Transaction: Transfer TNT-20 tokens (write)
        //const contract_transfer_result = await contract.transfer(address2, "9");
    } else {
 	    responseStr += "The contract address is unknown or unspecified.\n\n";
 	    responseStr += "Either pass a known contract address with <a href=\"/trustee/interact-with-last-contract?addr=0x00...00\">?addr=0x00...00</a>\n";
 	    responseStr += "--or--\n";
	    responseStr += "Redeploy the last compiled contract by clicking -> <a href=\"/trustee/deploy-last-compiled-contract?action=doit\" target=\"_blank\">here</a>\n";
    }

	responseStr += "</pre>\n";
	
	responseStr += "<a href=\"/\">Return to home page.</a><br />";
	responseStr += "</body></html>";
	res.status(200).send(responseStr);
});

// curl -s https://explorer.thetatoken.org:8443/api/price/all | jq '.body[] | select(._id == "TFUEL") | .price'

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



app.get("/trustee/micro-payments", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	try {
		var alice = await provider.getAccount(Alice);
		console.log("alice :" + JSON.stringify(alice,null,2));
		
		responseStr += "alice  : " + Alice + "\n";
		responseStr += JSON.stringify(alice,null,2) + "\n";
		responseStr += "theta:  " + (alice.coins.thetawei / 1000000000000000000) + "\n";
		responseStr += "tfuel: " + (alice.coins.tfuelwei / 1000000000000000000) + "\n";

		var bob = await provider.getAccount(Bob);
		console.log("bob :" + JSON.stringify(bob,null,2));
		
		responseStr += "bob  : " + Bob + "\n";
		responseStr += JSON.stringify(bob.coins,null,2) + "\n";
		responseStr += "theta:  " + (bob.coins.thetawei / 1000000000000000000) + "\n";
		responseStr += "tfuel: " + (bob.coins.tfuelwei / 1000000000000000000) + "\n";

		var carol = await provider.getAccount(Carol);
		console.log("carol :" + JSON.stringify(carol,null,2));
		
		responseStr += "carol  : " + Carol + "\n";
		responseStr += JSON.stringify(carol.coins,null,2) + "\n";
		responseStr += "theta:  " + (carol.coins.thetawei / 1000000000000000000) + "\n";
		responseStr += "tfuel: " + (carol.coins.tfuelwei / 1000000000000000000) + "\n";

	} catch(e) {
		responseStr += "error : " + e + "\n";
	}

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
		var use_privkey = privkey;

		const count = await provider.getTransactionCount(from);
		responseStr += "last sequence count :" + count + "\n";

		const wallet = new Wallet(use_privkey.value);
		const connectedWallet = wallet.connect(provider);

		const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei

		const tfuelWeiFund = (new BigNumber(8.0)).multipliedBy(ten18);
		const tfuelWeiCollateral = (new BigNumber(9.0)).multipliedBy(ten18);

		const txData = {
			source: from,
			fund: tfuelWeiFund,
			collateral: tfuelWeiCollateral,
			duration: 30,
			resource_ids: ["die_another_day", "hello"],
			sequence: count + 1
		};
		
	
		const transaction = new ReserveFundTransaction(txData);
		// transaction.inputs[0].sequence = count + 1;

		//transaction.source.signature = "0x51e96c910e72d59677790a9dfe5e523d371797138942519aef5baf383f381f4b6b9d8a993c02c53177a217859429bfb1b67e4bf482071a1d0e3410613f0dbc5400";

		console.log("ReserveFundRequest:\n" + JSON.stringify(transaction, null, 2));

		responseStr += "transaction :" + JSON.stringify(transaction, null, 2) + "\n";
		
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

app.get("/trustee/service-payment", async function (req, res) {

	var responseStr = "";
	responseStr += "<!DOCTYPE HTML><html><head><title>ThetaTrustee</title></head><body><h1>theta-trustee</h1><br />";
	responseStr += "<a href=\"/trustee/links\">Back to Links page.</a><br />";

	responseStr += "<pre>\n";

	console.log(JSON.stringify(req.query, null, 2));

	try {

		var from = address;
		var to = address2;
		var use_sprivkey = privkey;
		var use_tprivkey = privkey;
		var thetaWeiToSend = 0;
		var tfuelWeiToSend = 0;
		var payment_seq = "4";
		var reserve_seq = "5";
		var on_chain = "false";
		var dry_run = "false";
		var resource_id = "hello";
		var src_sig = "";

		const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei

		if (req.query) {

			if (req.query.from) {

				switch (req.query.from) {
					case "Alice":
						from = Alice;
						use_sprivkey = privkeyalice;
						break;
					case "Bob":
						from = Bob;
						use_sprivkey = privkeybob;
						break;
					case "Carol":
						from = Carol;
						use_sprivkey = privkeycarol;
						break;
					default:
						from = address;
						use_sprivkey = privkey;
				}
			}

			if (req.query.to) {

				switch (req.query.to) {
					case "Alice":
						to = Alice;
						use_tprivkey = privkeyalice;
						break;
					case "Bob":
						to = Bob;
						use_tprivkey = privkeybob;
						break;
					case "Carol":
						to = Carol;
						use_tprivkey = privkeycarol;
						break;
					default:
						from = address2;
						use_tprivkey = privkey;
				}
			}

			if (req.query.theta) {
				thetaWeiToSend = (new BigNumber(req.query.theta)).multipliedBy(ten18);
			}
			else {
				thetaWeiToSend = (new BigNumber(0.0)).multipliedBy(ten18);
			}

			if (req.query.tfuel) {
				tfuelWeiToSend = (new BigNumber(req.query.tfuel)).multipliedBy(ten18);
			}
			else {
				tfuelWeiToSend = (new BigNumber(1.0)).multipliedBy(ten18);
			}

			if (req.query.payment_seq) {
				// payment_seq = parseInt(req.query.payment_seq);
				payment_seq = req.query.payment_seq;
			}

			if (req.query.reserve_seq) {
				// reserve_seq = parseInt(req.query.reserve_seq);
				reserve_seq = req.query.reserve_seq;
			}

			if (req.query.on_chain) {
				on_chain = req.query.on_chain;
			}

			if (req.query.dry_run && (req.query.dry_run == "true")) {
				dry_run = "true";
			}
			else {
				dry_run = "false";
			}

			if (req.query.resource_id) {
				resource_id = req.query.resource_id;
			}

			if (req.query.src_sig) {
				src_sig = req.query.src_sig;
			}

		}

		const count = await provider.getTransactionCount(from);
		responseStr += "last sequence count :" + count + "\n";

		var swallet = thetajs.Wallet;
		var twallet = thetajs.Wallet;
		var connectedWallet = thetajs.Wallet;

		if (on_chain == "true") {
			twallet = new Wallet(use_tprivkey.value);
			connectedWallet = twallet.connect(provider);
		}
		else {
			swallet = new Wallet(use_sprivkey.value);
			connectedWallet = swallet.connect(provider);
		}


		// {
		// 	"fee": {
		// 		"thetawei": "0",
		// 		"tfuelwei": "300000000000000000"
		// 	},
		// 	"source": {
		// 		"address": "0x2e833968e5bb786ae419c4d13189fb081cc43bab",
		// 		"coins": {
		// 			"thetawei": "0",
		// 			"tfuelwei": "0"
		// 		},
		// 		"sequence": "1",
		// 		"signature": "0x4461422d5391f90c03988c49f456f3ff4bfece9418de59edd2cb48d177599a2c0896e597190a7216e15527d2455d4a4e2e868b0adad35cfe7f69e2e6ce116b1d00"
		// 	},
		// 	"target": {
		// 		"address": "0x70f587259738cb626a1720af7038b8dcdb6a42a0",
		// 		"coins": {
		// 			"thetawei": "0",
		// 			"tfuelwei": "0"
		// 		},
		// 		"sequence": "0",
		// 		"signature": "0x756e7369676e6564"
		// 	},
		// 	"payment_sequence": "1",
		// 	"reserve_sequence": "1",
		// 	"resource_id": "hello"
		// }
		
		const txData = {
			source: from,
			target: to,
			payment_seq: payment_seq,
			reserve_seq: reserve_seq,
			resource_id: resource_id,
			theta: thetaWeiToSend,
			tfuel: tfuelWeiToSend
		};
		
		const transaction = new ServicePaymentTransaction(txData);
		// transaction.inputs[0].sequence = count + 1;

		if (on_chain == "true") {
			//src_sig = "0xaac7a8ec024f701b23cd1633035de3745383a33ec2dbd8d9a3c8434d7ee78c9d0fe1ff7482ec8b7d56616a96952b80fab55e23a136ce9d1dffdf9ff5968d9d8d00";
			src_sig = "0x90ddf4a10daea9276d0ae9d051d599be1f4c0bd9f221ee65f9220dbe4c3952342d7cebb5bf74181eadbefc4270c5d51a2bd59546dbc0388da3b230ef859d8a541c";
			transaction.setSourceSignature(src_sig);
			var tsig = connectedWallet.signMessage(transaction.targetSignBytes(provider.getChainId()));
			//tsig = "0x7376388d8b9f2b7ca5f15470e0ac93f4c79711e54938a02c2d51dc4d50373a0c64a0d63ab79fb992a0ed3e1b553f26be069825a9c34b58b3057af5fea37a783c01";
			transaction.setTargetSignature(tsig);
		}
		else {
			// GO fromAddress = common.HexToAddress(fromFlag)
			// GO ssig, err := swallet.Sign(fromAddress, servicePaymentTx.SourceSignBytes(chainIDFlag))
			//const fromAddress = thetajs.utils.bytesToHex(from);
			
			const ssig = connectedWallet.signMessage(transaction.sourceSignBytes(provider.getChainId()));
			//const ssig = from;
			transaction.setSourceSignature(ssig);
			// GO tsig = crypto.SignatureFromBytes([]byte("unsigned"));
			//const tsig = connectedWallet.signMessage("unsigned");
			//const tsig = connectedWallet.signTransaction(transaction);
			//const tsig = transaction.signBytes("unsigned");
			//transaction.setTargetSignature(tsig);
			transaction.setTargetSignature("unsigned");
		}

		responseStr += "transaction :" + JSON.stringify(transaction,null,2) + "\n";
		
		console.log("ServicePayment:\n" + JSON.stringify(transaction,null,2));

		const tfuelperusd = 0.335824;	// As of 2021-04-29
		const feetfuel = 0.3;
		const feeincents = ( ( tfuelperusd * feetfuel ) * 100 );
		responseStr += "\nsendTransaction fee: " + feeincents + " cents\n";
	
		if (req.query && req.query.action && (req.query.action == "doit") && (on_chain == "true") && (dry_run == "false") ) {

			const start = startTimer();

			const txresult = await connectedWallet.sendTransaction(transaction);
			responseStr += "sendTransaction duration: " + endTimer(start) + " ms\n";
			responseStr += "txresult :" + JSON.stringify(txresult,null,2) + "\n";

			const blockHash = txresult.hash;
			responseStr += "blockHash :" + JSON.stringify(blockHash,null,2) + "\n";
			const block = await provider.getTransaction(blockHash);
			responseStr += "block :" + JSON.stringify(block,null,2) + "\n";
		}
	} catch (e) {
		console.log("error:\n" + e);
		responseStr += "error : " + e + "\n";
	}

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
