'use strict';

var Q = require('q');
var r = require('rethinkdb');
var Pool = require('generic-pool').Pool;

module.exports = function(config) {
	var pool = new Pool({
		name: 'rethinkdb',
		create: function(callback) {
			return r.connect(config.core.rethinkdb, callback);
		},
		destroy: function(conn) {
			return conn.close();
		},
		log: config.pool.log,
		min: config.pool.min,
		max: config.pool.max,
		idleTimeoutMillis: config.pool.timeout
	});

	return function(query) {
		return Q.ninvoke(pool, 'acquire')
		.then(function(conn) {
			return query.run(conn)
			.finally(function(err){
				pool.release(conn);
			});
		});
	};
};