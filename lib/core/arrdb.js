'use strict';

var r = require('rethinkdb');

module.exports = function(config) {

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


	// we only need a single connection here
	r.connect(config.rethinkdb).then(function(conn) {

		function onConnect(conn){
			return r.table(config.table).getAll().run(conn).then(function(cursor){
				return cursor.toArray().then(function(data){
					resetDb(data);

					return r.table(config.table).changes().run(conn).then(function(cursor){
						cursor.each(db.applyChange);
					});
				});
			});
		}

		// try to reconnect
		conn.addListener('error', function(e) {
			var retry = setInterval(function(){
				return conn.reconnect().then(function(conn){
					clearInterval(retry);
					return onConnect(conn);
				});
			}, config.retry);
		});
	});

	return {
		db: db
	};
};