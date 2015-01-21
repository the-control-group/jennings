'use strict';

var cluster = require('cluster');

// the master
if (cluster.isMaster) {
	for (var i = 0; i < require('os').cpus().length; i++) {
		cluster.fork();
	}

	// replace a dead child
	cluster.on('exit', function(child, code, signal) {
		console.error('Child process ' + child.process.pid + ' died with code ' + code +'. Restarting...');
		cluster.fork();
	});
}

// the child processes
else {
	var app = require('express')();
	var config = require(process.env.CONFIG || './config.json');
	var jennings = require('./lib/core/index.js')(config.core);

	// add to the server
	app.use(config.prefix, jennings.router);

	// handle transactional errors
	app.use(function(err, req, res, next) {
		res.status(400).send({message: err.message});
	});

	// start listening
	app.listen(config.port);
}