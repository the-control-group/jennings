'use strict';

var r = require('rethinkdb');
var table = 'watchers';

module.exports = function(config) {
	var pool = require('./pool.js')(config);
	var arrdb = require('./arrdb.js')(config);


	// Insert
	// ------
	function insertWatcher(data) {
		return pool(r.table(table).insert(data));
	}

	// Replace
	// -------
	function replaceWatcher(id, data) {
		return pool(r.table(table).get(id).replace(data));
	}

	// Delete
	// ------
	function deleteWatcher(id) {
		return pool(r.table(table).get(id).delete());
	}

	// Get 
	// ---
	function getWatcher(id) {
		return pool(r.table(table).get(id));
	}


	// Audition
	// --------
	function audition(candidate, options) {

	}

}

