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
var ArrayList = require("arraylist");
var Web3 = require("web3");

var MyContractJSON = require("../truffle/build/contracts/Simple.json");


var list = new ArrayList;

app.locals.pretty = true;
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(flash());

app.use(session({ cookie: { maxAge: 600000 },
	          key: 'jaejin',
                  secret: 'jaejin',
                  resave: false,
                  saveUninitialized: false}));

app.use(passport.initialize());
app.use(passport.session());

server.listen(3000);

var Mycontract2 = contract(MyContractJSON);

/*
app.use(express.static("public"));
app.get("/", function(req,res){
	res.sendFile(__dirname + "/public/html/index.html");
})
*/

web3 = new Web3(new Web3.providers.HttpProvider("http://172.17.0.2:8545"));
var network_version = web3.version.network;

Mycontract2.setProvider(web3.currentProvider);

console.log(network_version);

var account = "0x6ea45f74c9803a9c3403c400975424e5825dfb70";
var jaejin;


console.log("-----");
///////////////////////////////////////////////
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  session: true,
  passReqToCallback: true
}, function (req, username, password, done) {
  //connection.query('select * from solar_webserver where user_id in ('+ "'" +username + "'" +')',function(err,result){
    //console.log(result);
    //if(result && result.length > 0){
    //  var userid = result[0].user_id;
    //  var userpw = result[0].user_pw;
    //  if(userpw == password){
    //    return done(null,{
    //      'user_id': userid
    //    })
    if (username == 'jaejin'){
      if('1234' == password){
        return done(null,{
          'user_id': 'jaejin'
        })
      }else {
        console.log('password error.');
        return done(null, false)
      }
    }else{
      console.log('dont have user.');
      return done(null,false)
    }

    console.log(err)


}));

passport.serializeUser(function (user, done) {
  done(null, user)

});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

/*
app.post('/login',passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/loginError',
    failureFlash: true
  }),function(req,res){
});
*/
app.get('/loginError', function(req,res){
  res.render('loginError',{})
});

app.get('/login',function(req, res){

  res.render('login',{})

});

app.get('/voted', function(req, res){
	Mycontract2.deployed().then(function(instance){
		return instance.getNumOfvoted();
	}).then(function(result){
		console.log(result.toNumber());
		req.session.save(function(){
			res.render('voted',{voted:result.toNumber()});
		});

	}).catch(function(err){
		console.log(err.message);
	});
})

app.get('/voted_name', function(req, res){
	var address = req.session.user_address;

	Mycontract2.deployed().then(function(instance){
		return instance.getcandidatename(address);
	}).then(function(result){
		console.log(result);
		res.render('votedname',{votedname:result});
	}).catch(function(err){
		console.log(err.message);
	});
})

app.get('/', function(req,res){
	var id = req.session.user_id;
	var address = req.session.user_address;
	
	Mycontract2.deployed().then(function(instance){
		return instance.getNumOfcandidate();
	}).then(function(result){
		console.log(result.toNumber());
		res.render('main',{user_id: id, user_address:address, numcandidate:result.toNumber(), jaejin:list }); 
	}).catch(function(err){
		console.log(err.message);
	});


})
app.post('/vote', function(req, res){
	var id = req.session.user_id;
	var address = req.session.user_address;
	var vote = req.body.radioTxt;
	console.log("=====");
	Mycontract2.deployed().then(function(instance){
		return instance.getcandidateID(vote);
	}).then(function(result){
		console.log(result.toNumber());
		Mycontract2.deployed().then(function(instance){
			return instance.vote(address,result.toNumber(),{from: account, gas:470000});
		}).then(function(result){
			console.log(result);
		}).catch(function(err){
			console.log(err.message);
		});

	}).catch(function(err){
		console.log(err.message);
	});
	/*
	Mycontract2.deployed().then(function(instance){
		return instance.vote(address, vote,{from: account,gas:470000});
	}).then(function(result){
		console.log(result);
	}).catch(function(err){
		console.log(err.message);
	});
	*/
	console.log("=====");
	res.render('vote_ok');
})

app.get('/logout', function(req, res){
	req.session = null;
	res.clearCookie('jaejin');
	res.render('logout',{});
})

app.post('/', function(req,res){
	res.render('main',{})
})

app.get('/signup', function(req,res){
	res.render('signup',{})
})

app.post('/signup_ok', function(req, res){
  var name = req.body.name;
  var id = req.body.id;
  var pw = req.body.pw;

  //create account
  var user_account = web3.personal.newAccount(jaejin);
  console.log('account create by'+name)
  console.log(user_account)

  // string to hex (private key)
  var hex = web3.toHex(id+pw);
  var private_key = web3.personal.sign(hex, user_account);

  console.log('start addCandidate(test)');
  console.log('need miner...');
  
  Mycontract2.deployed().then(function(instance){
	  return instance.addvoter(user_account, {from: account,gas:470000});
  }).then(function(result){
	  console.log(result);
	  //res.render('signup_ok_private', {data: private_key});
  }).catch(function(err){
	  console.log(err.message);
  });
  
  //use login possible after mining
  res.render('signup_ok_private', {data: private_key});
});

app.post('/list', function(req, res){
	var id = req.body.id;
	res.render('list',{'id': id});
});

app.post('/login', function(req, res){
	var id = req.body.id;
	var pw = req.body.pw;
	var private_key = req.body.private_key;

	// string to hex (return account)
	var hex = web3.toHex(id+pw);
	var address = web3.personal.ecRecover(hex, private_key, function(error, result){
		if(!error){
                	console.log('the address of ' + id + ' is '+result);
			req.session.user_address = result;
			
			Mycontract2.deployed().then(function(instance){
				return instance.certification(result);
			}).then(function(result){
				console.log(result);
				if (result == true){
					console.log('login success');
					req.session.user_id = id;
					res.render('login_success');
				}else{
					console.log('login fail');
					res.render('login_fail', {});
				}
			}).catch(function(err){
				console.log(err.message);
				res.render('login_fail', {});
			});
		}else{
			console.error(error);
		}
	});
			

	//var address = web3.personal.ecRecover(
});


app.get('/candidate', function(req, res){
	res.render('candidate',{});
});

app.post('/candidate_ok', function(req,res){
	var name = req.body.name;
	
	var user_account = web3.personal.newAccount(jaejin);
	console.log('account create by ' + name);
	console.log(user_account);

	Mycontract2.deployed().then(function(instance){
		return instance.addcandidate(user_account, name , {from: account,gas:470000});
	}).then(function(result){
		console.log(result);
		list.add(name);
		console.log(list.last());
		console.log('----');
	}).catch(function(err){
		console.log(err.message);
	});

	res.render('candidate_ok', {});
});
/*
var account_test = web3.personal.newAccount(jaejin);
var account_test2 = web3.personal.newAccount(jaejin);
console.log(account_test2);
console.log(account_test);
var hex = web3.toHex("!@#$wowls1");
var private_test = web3.personal.sign(hex, account_test);
console.log(private_test);

var hex2 = web3.toHex("heelo");
var address12 = web3.personal.ecRecover(hex2,private_test, function(error, result){
	if(!error)
		console.log(result)
	else
		console.error(error);
});
*/
web3.personal.unlockAccount("0x6ea45f74c9803a9c3403c400975424e5825dfb70", "wowls1");
//console.log(address12);

//web3.eth.personal.sign("Hello world", "0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe", "test password!")
//web3.eth.personal.ecRecover("Hello world", "0x30755ed65396facf86c53e6217c52b4daebe72aa4941d89635409de4c9c7f9466d4e9aaec7977f05e923889b33c0d0dd27d7226b6e6f56ce737465c5cfd04be400").then(console.log);

/*

Mycontract2.deployed().then(function(instance){
	return instance.get();
}).then(function(result){
	console.log(result.toNumber());
}).catch(function(err){
	console.log(err.message);
});


Mycontract2.deployed().then(function(instance){
        return instance.set(20, {from: account});
}).then(function(result){
        console.log(result);
}).catch(function(err){
        console.log(err.message);
});

//var test = contractInstance.addCandidate(account_one, account_two, {from: account});

//console.log(test.toString());

Mycontract2.deployed().then(function(instance){
	return instance.certification(0xc75711ce6897078ffd6af868fda11c8e9f0fc311);
}).then(function(result){
	console.log(result);
}).catch(function(err){
	console.log(err.message);
});

Mycontract2.deployed().then(function(instance){
	return instance.addCandidate(0xc75711ce6897078ffd6af868fda11c8e9f0fc311, {from: account});
}).then(function(result){
	console.log(result);
}).catch(function(err){
	console.log(err.message);
});

Mycontract2.deployed().then(function(instance){
	return instance.getNumOfCandidates();
}).then(function(result){
	console.log(result.toNumber());
});
*/



