'use strict';

var Q = require('q');
var r = require('rethinkdb');

module.exports = function(config) {
	var active = false; // are we syncing from the database?
	var conn;           // the rethinkdb connection used for the changes feed
	var feed;           // the rethindkb changes feed
	var retry;          // retry interval for connection retry


	// DB (Array)
	// ----------
	// This is the in-memory array where we cache 
	// the entire database

	var db = [];



	// Apply Change
	// ------------
	// This applies a given change to the array DB
	// and any indices

	function applyChange(change) {

		// insert a new record
		if (change.old_val === null) {
			db.push(change.new_val);
			return;
		}

		// find an existing record
		for (var i = 0, len = db.length; i < len; i++) {
			if (db[i].id === change.old_val.id) {

				// delete the record
				if(change.old_val === null) {
					db.splice(i, 1);
					break;
				}

				// replace an existing record
				db[i] = change.new_val;
				break;
			}
		}
	}


	// Reset DB
	// --------
	// This removes every record from the array DB
	// and replaces them with new data.
	//
	// Note that this function modifies its input
	// for the sake of increased performance

	function resetDb(data) {
		// prepare data to be used in `apply`
		data.unshift(db, db.length);

		// remove and replace records
		Array.prototype.splice.apply(db, data);
	}


	// Query
	// -----

	function query(){
		return Q.all([

			// get entire database
			r.table(config.core.table).run(conn).then(function(cursor){
				return cursor.toArray().then(resetDb);
			}),

			// begin changes stream
			r.table(config.core.table).changes().run(conn).then(function(f){
				feed = f;
				feed.on('message', applyChange);
				feed.on('error', restart);
			})
		]);
	}


	// Start
	// -----

	function start(){
		active = true;

		// use existing connection
		if(conn) return conn.reconnect().then(query);

		// create a new connection
		return r.connect(config.core.rethinkdb)
		.then(function(c) {
			conn = c;

			// add reconnect listener
			conn.addListener('error', function(e) {

				// prevent multiple simultaneous retries
				clearInterval(retry);

				// attempt to reconnect
				retry = setInterval(function(){

					return conn.reconnect().then(function(conn){
						clearInterval(retry);
						return query(conn);
					});
				}, config.retry);
			});
		})
		.then(query);
	}

	// Stop
	// ----

	function stop(){
		active = false;

		// close feed
		if(feed) feed.close();

		// close connection
		if(conn) conn.close();

		// clear the array db
		db.length = 0;

		// return a promise
		return Q(true);
	}

	// Restart
	// -------

	function restart(){
		return stop().then(start);
	}

	return {
		db: db,
		start: start,
		stop: stop,
		restart: restart,
		status: active
	};
};