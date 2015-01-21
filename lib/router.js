'use strict';

var express = require('express');
var bodyParser = require('body-parser');

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
		.catch(next);
	});

	// Replace
	router.put('/:id', function(req, res, next) {
		core.save(req.params.id, req.body)
		.catch(next)
		.then(function(answer){
			if(!answer) return next(new NotFoundError);
			return res.status(200).send(answer);
		});
	});

	// Delete
	router.delete('/:id', function(req, res, next) {
		core.delete(req.params.id)
		.then(function(answer){
			if(!answer) return next(new NotFoundError);
			return res.status(200).send(answer);
		})
		.catch(next);
	});

	// Get
	router.get('/:id', function(req, res, next) {
		core.get(req.params.id)
		.catch(next)
		.then(function(answer){
			if(!answer) return next(new NotFoundError);
			return res.status(200).send(answer);
		});
	});

	// Query
	router.get('/', function(req, res, next) {

		// parse clue
		var clue = null;
		if(req.query.clue) try {
			clue = JSON.parse(req.query.clue);
		} catch (e) {
			return next(new Error('`clue` is invalid JSON.'));
		}

		// parse criteria
		var criteria = null;
		if(req.query.criteria) try {
			criteria = JSON.parse(req.query.criteria);
		} catch (e) {
			return next(new Error('`criteria` is invalid JSON.'));
		}

		core.query(clue, criteria)
		.then(function(answers){
			return res.status(200).send(answers);
		})
		.catch(next);
	});

	return router;
}
