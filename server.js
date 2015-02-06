'use strict';

var cluster = require('cluster');
var configPath = process.argv.length > 2 ?
	(['/','.'].indexOf(process.argv[2][0]) === -1 ? './' + process.argv[2] : process.argv[2])
	: './config.default.json';


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
	var config = require(configPath);
	var jennings = require('./lib/core/index.js')(config);

	// handle arrdb errors
	jennings.$arrdb.on('error', function(err){

		// NOTE: this is where one would fire off an alert, kill this process, or
		// remove this node from a load balancer. By default, we'll just use continue
		// to use our local cache until we're able to reconnect.
		console.error(err);

		jennings.$arrdb.once('reconnect', function(){

			// NOTE: this is where one would re-join a load balancer, etc.

		});

	});

	// add to the server
	app.use(config.prefix, jennings.router);

	// start listening
	app.listen(config.port);
}