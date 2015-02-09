'use strict';

var express = require('express');
var bodyParser = require('body-parser');


function RequestError(message) {
	this.name = 'RequestError';
	this.message = message || 'Bad request.';
}
RequestError.prototype = new Error();
RequestError.prototype.constructor = ValidationError;


function NotFoundError(message, validation) {
	this.name = 'NotFoundError';
	this.message = message || 'Resource not found.';
	this.validation = validation || {};
}
NotFoundError.prototype = new Error();
NotFoundError.prototype.constructor = NotFoundError;


module.exports = function(core) {
	var router = express.Router();

	// Middleware
	// ----------

	router.use('/', bodyParser.urlencoded({extended: true}));
	router.use('/', bodyParser.json());

	// Endpoints
	// ---------

	// Create
	router.post('/', function(req, res, next) {
		core.create(req.body)
		.then(function(answer){
			return res.status(201).send(answer);
		})
		.catch(next).done();
	});

	// Replace
	router.put('/:id', function(req, res, next) {
		core.save(req.params.id, req.body)
		.then(function(answer){
			if(!answer) return next(new NotFoundError());
			return res.status(200).send(answer);
		})
		.catch(next).done();
	});

	// Delete
	router.delete('/:id', function(req, res, next) {
		core.delete(req.params.id)
		.then(function(answer){
			if(!answer) return next(new NotFoundError());
			return res.status(200).send(answer);
		})
		.catch(next).done();
	});

	// Get
	router.get('/:id', function(req, res, next) {
		core.get(req.params.id)
		.then(function(answer){
			if(!answer) return next(new NotFoundError());
			return res.status(200).send(answer);
		})
		.catch(next).done();
	});

	// Query
	router.get('/', function(req, res, next) {

		// parse clue
		var clue = null;
		if(req.query.clue) try {
			clue = JSON.parse(req.query.clue);
		} catch (e) {
			return next(new RequestError('`clue` is invalid JSON.'));
		}

		// parse criteria
		var criteria = null;
		if(req.query.criteria) try {
			criteria = JSON.parse(req.query.criteria);
		} catch (e) {
			return next(new RequestError('`criteria` is invalid JSON.'));
		}

		core.query(clue, criteria)
		.then(function(answers){
			return res.status(200).send(answers);
		})
		.catch(next).done();
	});

	// handle transactional errors
	router.use(function(err, req, res, next) {
		if(err.name !== 'NotFoundError' && err.name !== 'RequestError' && err.name !== 'ValidationError')
			return next(err);

		var code = err.name === 'NotFoundError' ? 404 : 400;
		var body = {message: err.message};

		// return validation errors
		if(err.validation) body.validation = err.validation;

		res.status(code).send(body);
	});

	return router;
};
