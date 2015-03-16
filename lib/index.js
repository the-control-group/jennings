'use strict';

var Q = require('q');
var r = require('rethinkdb');


function ValidationError(message, validation) {
	this.name = 'ValidationError';
	this.message = message || 'The input is invalid.';
	this.validation = validation || {};
}
ValidationError.prototype = new Error();
ValidationError.prototype.constructor = ValidationError;


// Schema
// ------

var schema = require('../schema/answer.json');
var validator = require('jjv')(); validator.addSchema(schema);

var Core = require('./core/index.js');

module.exports = function(config) {
	var pool = require('./pool.js')(config);
	var core = new Core(config.core);
	core.arrdb.start();


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

		return pool(r.table(config.core.table).insert(data, {returnChanges: true})).then(function(res){ return res.changes[0] ? res.changes[0].new_val : null; });
	}


	// Delete Answer
	// -------------
	//
	// Delete an existing answer by ID

	function deleteAnswer(id) {

		if(typeof id !== 'string')
			return Q.reject(new TypeError('The function deleteWatcher expects a string for its parameter.'));

		return pool(r.table(config.core.table).get(id).delete({returnChanges: true})).then(function(res){ return res.changes[0] ? res.changes[0].old_val : null; });
	}


	// Get Answer
	// ----------
	//
	// Get an existing answer by ID

	function getAnswer(id) {

		if(typeof id !== 'string')
			return Q.reject(new TypeError('The function getWatcher expects a string for its parameter.'));

		return pool(r.table(config.core.table).get(id));
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
	//
	// **strong (boolean)**
	// Optionally query the database instead of the arrdb mirror

	function queryAnswers(clue, criteria, strong) {

		// query the database directly
		return (strong === true ?
			pool(r.table(config.core.table)).then(function(cursor){
				return cursor.toArray();
			})
			: Q.when(core.arrdb.db)
		).then(function(answers){

			// get the entire db
			if(!clue && !criteria)
				return new Q(answers);

			// filter results
			var results = [];
			for (var i = 0; i < answers.length; i++) {

				// apply answer criteria to clue
				if(clue && answers[i].criteria && !core.filter(answers[i].criteria, clue)) continue;

				// apply query criteria to answers
				if(criteria && !core.filter(criteria, answers[i])) continue;

				results.push(answers[i]);
			}

			return new Q(results);

		});
	}


	// Save Answer
	// -----------
	//
	// Save an existing answer by ID

	function saveAnswer(id, data) {

		if(data.id && id != data.id)
			return Q.reject(new ValidationError('The answer\'s ID cannot be changed.', {id: {constant: true}}));

		// set the ID
		data.id = id;

		// validate against schema
		var err = validator.validate(schema.id, data, {useDefault: true});
		if(err) return Q.reject(new ValidationError(null, err.validation));

		return pool(r.table(config.core.table).get(id).replace(data, {returnChanges: true})).then(function(res){
			return res.changes[0].new_val;
		});
	}


	// Router
	// ------
	//
	// Singleton for lazy-loading the router

	var router;



	return {
		$core: core,
		$pool: pool,
		create: createAnswer,
		delete: deleteAnswer,
		get: getAnswer,
		query: queryAnswers,
		save: saveAnswer,

		// don't load the router until it's requested
		get router () {
			return router || (router = require('./router.js')(this));
		}
	};

};

module.exports.core = Core;

