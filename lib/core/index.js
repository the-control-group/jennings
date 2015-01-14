'use strict';

var Q = require('q');
var r = require('rethinkdb');
var filter = require('./filter.js');

// 
// Create a new object, that prototypally inherits from the Error constructor.
function ValidationError(message, validation) {
	this.name = 'ValidationError';
	this.message = message || 'The input is invalid.';
	this.validation = validation || {};
}
ValidationError.prototype = new Error();
ValidationError.prototype.constructor = ValidationError;


// Schema
// ------

var schema = require('../../schema/answer.json');
var validator = require('jjv')(); validator.addSchema(schema);

module.exports = function(config) {
	var pool = require('./pool.js')(config);
	var arrdb = require('./arrdb.js')(config);

	// singleton for lazy-loading the API
	var router;

	arrdb.start();

	// Insert Answer
	// -------------
	//
	// Insert a new trait

	function insertAnswer(data) {

		// validate against schema
		var err = validator.validate(schema, data);
		if(err) return Q.reject(err);

		return pool(r.table(config.table).insert(data, {returnChanges: true})).then(function(res){ return res.changes[0].new_val; });
	}


	// Replace Answer
	// --------------
	//
	// Replace an existing trait by ID

	function replaceAnswer(id, data) {

		if(id != data.id)
			return Q.reject(new Error('The watcher\'s ID cannot be changed'));

		// validate against schema
		var err = validator.validate(schema, data);
		if(err) return Q.reject(err);

		return pool(r.table(config.table).get(id).replace(data, {returnChanges: true})).then(function(res){ return res.changes[0].new_val; });
	}


	// Delete Answer
	// -------------
	//
	// Delete an existing trait by ID

	function deleteAnswer(id) {

		if(typeof id !== 'string')
			return Q.reject(new TypeError('The function deleteWatcher expects a string for its parameter.'));

		return pool(r.table(config.table).get(id).delete({returnChanges: true})).then(function(res){ return res.changes[0].old_val; });
	}


	// Get Answer
	// ----------
	//
	// Get an existing trait by ID

	function getAnswer(id) {

		if(typeof id !== 'string')
			return Q.reject(new TypeError('The function getWatcher expects a string for its parameter.'));

		return pool(r.table(config.table).get(id));
	}


	// Query Answers
	// -------------
	//
	// **clue (null | object)**
	// The record to which all trait criteria will be applied; traits that do not
	// apply to this clue will be ommited from the returned value
	//
	// **criteria (null | array)**
	// Rules used to filter traits

	function queryAnswers(clue, criteria) {

		// get the entire db
		if(!clue && !criteria)
			return Q(arrdb.db);

		// filter results
		var results = [];
		for (var i = 0; i < arrdb.db.length; i++) {

			// apply trait criteria to clue
			if(clue && arrdb.db[i].criteria && !filter(arrdb.db[i].criteria, clue)) continue;

			// apply query criteria to traits
			if(criteria && !filter(criteria, arrdb.db[i])) continue;

			results.push(arrdb.db[i]);
		}

		return Q(results);
	}

	return {
		insert: insertAnswer,
		replace: replaceAnswer,
		delete: deleteAnswer,
		get: getAnswer,
		query: queryAnswers,
		arrdb: arrdb,
		pool: pool,
		get router () {
			return router || (router = require('../router.js')(this));
		}
	};

};

