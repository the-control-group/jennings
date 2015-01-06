'use strict';

var r = require('rethinkdb');
var filter = require('./filter.js');

module.exports = function(config) {
	var pool = require('./pool.js')(config);
	var arrdb = require('./arrdb.js')(config);

	// Insert Answer
	// -------------
	//
	// Insert a new trait

	function insertAnswer(data) {

		// TODO: validate against schema

		return pool(r.table(config.table).insert(data));
	}


	// Replace Answer
	// --------------
	//
	// Replace an existing trait by ID

	function replaceAnswer(id, data) {

		if(id != data.id)
			throw new Error('The watcher\'s ID cannot be changed');

		// TODO: validate against schema

		return pool(r.table(config.table).get(id).replace(data));
	}


	// Delete Answer
	// -------------
	//
	// Delete an existing trait by ID

	function deleteAnswer(id) {

		if(typeof id !== 'string')
			throw new TypeError('The function deleteWatcher expects a string for its parameter.');

		return pool(r.table(config.table).get(id).delete());
	}


	// Get Answer
	// ----------
	//
	// Get an existing trait by ID

	function getAnswer(id) {

		if(typeof id !== 'string')
			throw new TypeError('The function getWatcher expects a string for its parameter.');

		return pool(r.table(config.table).get(id));
	}


	// Query Answers
	// -------------
	//
	// **candidate (null | object)**
	// The record to which all trait criteria will be applied; traits that do not
	// apply to this candidate will be ommited from the returned value
	//
	// **criteria (null | array)**
	// Rules used to filter traits

	function queryAnswers(candidate, criteria) {

		// get the entire db
		if(!candidate && !criteria)
			return arrdb.db;

		// filter results
		var results = [];
		for (var i = 0; i < arrdb.db.length; i++) {

			// apply trait criteria to candidate
			if(candidate && arrdb.db[i].criteria && !filter(arrdb.db[i].criteria, candidate)) continue;

			// apply query criteria to traits
			if(criteria && !filter(criteria, arrdb.db[i])) continue;

			results.push(arrdb.db[i]);
		}

		return results;
	}

	return {
		insert: insertAnswer,
		replace: replaceAnswer,
		delete: deleteAnswer,
		get: getAnswer,
		query: queryAnswers
	};

};

