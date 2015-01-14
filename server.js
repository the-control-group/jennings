'use strict';

var app = require('express')();
var config = require(process.env.CONFIG || './config.json');

// TODO: create rethinkdb if it doesn't exist

var jennings = require('./lib/core/index.js')(config.core);

// add to the server
app.use(config.prefix, jennings.router);

// error handling
app.use(function(err, req, res, next){
	console.error(err);
});

// start listening
app.listen(config.port);
