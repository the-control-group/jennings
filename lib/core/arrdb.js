'use strict';

var r = require('rethinkdb');
var table = 'watchers';

module.exports = function(config) {

	// DB (Array)
	// ----------
	// this is the in-memory array where we cache 
	// the entire database

	var db = [];



	// Apply Change
	// ------------
	// This function applies a given change to the
	// array DB and any indices

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


	// we only need a single connection here
	r.connect(config.rethinkdb).then(function(conn) {

		// 
		r.table(table).changes().run(conn).then(function(cursor){
			cursor.each(db.applyChange);
		});

	})






	return db;
};