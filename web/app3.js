var express = require("express");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var session = require('express-session');
var app = express();
var contract = require("truffle-contract");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var Web3 = require("web3");
var MyContractJSON = require("../truffle/build/contracts/Simple.json");

app.locals.pretty = true;
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(flash());

app.use(session({ cookie: { maxAge: 60000 },
	          key: 'jaejin',
                  secret: 'jaejin',
                  resave: false,
                  saveUninitialized: false}));

app.use(passport.initialize());
app.use(passport.session());

server.listen(3000);

var Mycontract2 = contract(MyContractJSON);

web3 = new Web3(new Web3.providers.HttpProvider("http://172.17.0.2:8545"));
var network_version = web3.version.network;

Mycontract2.setProvider(web3.currentProvider);

console.log(network_version);

var account = "0x6ea45f74c9803a9c3403c400975424e5825dfb70";
var jaejin;


console.log("-----");
///////////////////////////////////////////////
web3.personal.unlockAccount("0x6ea45f74c9803a9c3403c400975424e5825dfb70", "wowls1");

Mycontract2.deployed().then(function(instance){
	return instance.addCandidate(0x6ea45f74c9803a9c3403c400975424e5825dfb70,0x6ea45f74c9803a9c3403c400975424e5825dfb70,{from: account,gas:470000});
}).then(function(result){
	console.log(result);
});


Mycontract2.deployed().then(function(instance){
	return instance.getNumOfCandidates();
}).then(function(result){
	console.log(result.toNumber());
});


/*
Mycontract2.deployed().then(function(instance){
	return instance.vote(0x6ea45f74c9803a9c3403c400975424e5825dfb70,0x6ea45f74c9803a9c3403c400975424e5825dfb70, {from: account});
}).then(function(result){
	console.log(result);
});

Mycontract2.deployed().then(function(instance){
	return instance.getNumOfvoted();
}).then(function(result){
	console.log(result.toNumber());
});

Mycontract2.deployed().then(function(instance){
	return instance.get_result_vote(0x6ea45f74c9803a9c3403c400975424e5825dfb70);
}).then(function(result){
	console.log(result);
});

*/


