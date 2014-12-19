'use strict';

var r = require('rethinkdb');
var filter = require('./filter.js');

module.exports = function(config) {
	var pool = require('./pool.js')(config);
	var arrdb = require('./arrdb.js')(config);

	// Insert Trait
	// ------------
	//
	// Insert a new trait

	function insertTrait(data) {

		// TODO: validate against schema

		return pool(r.table(config.table).insert(data));
	}


	// Replace Trait
	// -------------
	//
	// Replace an existing trait by ID

	function replaceTrait(id, data) {

		if(id != data.id)
			throw new Error('The watcher\'s ID cannot be changed');

		// TODO: validate against schema

		return pool(r.table(config.table).get(id).replace(data));
	}


	// Delete Trait
	// ------------
	//
	// Delete an existing trait by ID

	function deleteTrait(id) {

		if(typeof id !== 'string')
			throw new TypeError('The function deleteWatcher expects a string for its parameter.');

		return pool(r.table(config.table).get(id).delete());
	}


	// Get Trait
	// ---------
	//
	// Get an existing trait by ID

	function getTrait(id) {

		if(typeof id !== 'string')
			throw new TypeError('The function getWatcher expects a string for its parameter.');

		return pool(r.table(config.table).get(id));
	}


	// Query Traits
	// ------------
	//
	// **candidate (null | object)**
	// The record to which all trait criteria will be applied; traits that do not
	// apply to this candidate will be ommited from the returned value
	//
	// **criteria (null | array)**
	// Rules used to filter traits
	// 

	function queryTraits(candidate, criteria) {

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
		insert: insertTrait,
		replace: replaceTrait,
		delete: deleteTrait,
		get: getTrait,
		query: queryTraits
	};

};

