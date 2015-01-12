'use strict';

var app = require('express')();
var config = require('./config.json');

// TODO: create rethinkdb if it doesn't exist

var core = require('./lib/core/index.js')(config.core);
var api = require('./lib/api.js')(core);

// add to the server
app.use(config.prefix, api);

// error handling
app.use(function(err, req, res, next){
	console.error(err);
});

// start listening
app.listen(config.port);
