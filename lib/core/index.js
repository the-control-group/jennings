'use strict';

var Q = require('q');
var r = require('rethinkdb');
var filter = require('./filter.js');


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

	arrdb.start();

	// Create Answer
	// -------------
	//
	// Create a new answer

	function createAnswer(data) {

		if(data.id)
			return Q.reject(new ValidationError('The answer\'s ID must not be set.', {id: {additional: true}}));

		// validate against schema
		var err = validator.validate(schema.id, data, {useDefault: true});
		if(err) return Q.reject(new ValidationError(null, err.validation));

		return pool(r.table(config.table).insert(data, {returnChanges: true})).then(function(res){ return res.changes[0] ? res.changes[0].new_val : null; });
	}


	// Delete Answer
	// -------------
	//
	// Delete an existing answer by ID

	function deleteAnswer(id) {

		if(typeof id !== 'string')
			return Q.reject(new TypeError('The function deleteWatcher expects a string for its parameter.'));

		return pool(r.table(config.table).get(id).delete({returnChanges: true})).then(function(res){ return res.changes[0] ? res.changes[0].old_val : null; });
	}


	// Get Answer
	// ----------
	//
	// Get an existing answer by ID

	function getAnswer(id) {

		if(typeof id !== 'string')
			return Q.reject(new TypeError('The function getWatcher expects a string for its parameter.'));

		return pool(r.table(config.table).get(id));
	}


	// Query Answers
	// -------------
	//
	// **clue (null | object)**
	// The record to which all answer criteria will be applied; answers that do not
	// apply to this clue will be ommited from the returned value
	//
	// **criteria (null | array)**
	// Rules used to filter answers

	function queryAnswers(clue, criteria) {

		// get the entire db
		if(!clue && !criteria)
			return new Q(arrdb.db);

		// filter results
		var results = [];
		for (var i = 0; i < arrdb.db.length; i++) {

			// apply answer criteria to clue
			if(clue && arrdb.db[i].criteria && !filter(arrdb.db[i].criteria, clue)) continue;

			// apply query criteria to answers
			if(criteria && !filter(criteria, arrdb.db[i])) continue;

			results.push(arrdb.db[i]);
		}

		return new Q(results);
	}


	// Save Answer
	// -----------
	//
	// Save an existing answer by ID

	function saveAnswer(id, data) {

		if(data.id && id != data.id)
			return Q.reject(new ValidationError('The answer\'s ID cannot be changed', {id: {additional: true}}));

		// set the ID
		data.id = id;

		// validate against schema
		var err = validator.validate(schema.id, data, {useDefault: true});
		if(err) return Q.reject(new ValidationError(null, err.validation));

		return pool(r.table(config.table).get(id).replace(data, {returnChanges: true})).then(function(res){
			return res.changes[0].new_val;
		});
	}


	// Router
	// ------
	//
	// Singleton for lazy-loading the router

	var router;



	return {
		$arrdb: arrdb,
		$pool: pool,
		create: createAnswer,
		delete: deleteAnswer,
		get: getAnswer,
		query: queryAnswers,
		save: saveAnswer,

		// don't load the router until it's requested
		get router () {
			return router || (router = require('../router.js')(this));
		}
	};

};

