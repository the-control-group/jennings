'use strict';

var app = require('express')();
var config = require('./config.json');

// TODO: create rethinkdb if it doesn't exist

var core = require('./lib/core/index.js')(config);
var api = require('./lib/api/index.js')(core);

// add to the server
app.use('/v1/', api);

// error handling
router.use(function(err, req, res, next){
	console.error(err);
});

// start listening
app.listen(config.port);
