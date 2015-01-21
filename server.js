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

	// handle connection errors
	jennings.$arrdb.on('error', function(err){

		// NOTE: this is where one would fire off an alert, kill this process, or
		// remove this node from a load balancer. By default, we'll just use continue
		// to use our local cache until we're able to reconnect.

		jennings.$arrdb.once('reconnect', function(){

			// NOTE: this is where one would re-join a load balancer, etc.

		});

	});

	// add to the server
	app.use(config.prefix, jennings.router);

	// handle transactional errors
	app.use(function(err, req, res, next) {
		res.status(err.name === 'NotFoundError' ? 404 : 400).send({message: err.message});
	});

	// start listening
	app.listen(config.port);
}