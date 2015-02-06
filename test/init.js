'use strict';

var r = require('rethinkdb');
var _ = require('lodash');

// make a timestamped db
var database = 'jennings_test_' + Date.now();
var config = require('../config.test.js');
var promise = null;
var count = 0;

// export the updated configs
module.exports = _.merge({}, config, {core:{rethinkdb:{db:database}}});

// setup the test environment
before(function(done){
	this.timeout(60000);

	count++; // increment the number of queued tests

	// don't setup twice
	if(count > 1) return promise.then(function(){ done(); });

	// connect to rethinkdb
	promise = r.connect(_.omit(config.core.rethinkdb, 'db')).then(function(conn) {

		// create database
		return r.dbCreate(database).run(conn)

		// create table
		.then(function(){ return r.db(database).tableCreate(config.core.table).run(conn); })

		// load fixtures
		.then(function(){ return r.db(database).table(config.core.table).insert(require('./fixtures.json')).run(conn); });
	});

	return promise.then(function(){ return done(); });
});



// teardown the test environment
after(function(done){
	this.timeout(60000);

	// decrement the number of queued tests
	count--;
	
	// stub a callback
	if(!done instanceof Function) done = function(err){ if(err){ throw err; } };

	// don't teardown if we still have queued tests
	if(count) return done();

	// destroy test database
	r.connect(_.omit(config.core.rethinkdb, 'db'), function(err, conn) {
		if(err) return done(err);

		r.dbDrop(database).run(conn, function(err){
			conn.close(done);
		});
	});
});





