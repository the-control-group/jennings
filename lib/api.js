'use strict';

var espress = require('express');
var bodyParser = require('body-parser');

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
		core.insert(req.body)
		.catch(next)
		.then(function(){
			return res.status(201).send(null);
		});
	});

	// Replace
	router.put('/:id', function(req, res, next) {
		core.replace(req.params.id, req.body)
		.catch(next)
		.then(function(){
			return res.status(200).send(null);
		});
	});

	// Delete
	router.delete('/:id', function(req, res, next) {
		core.delete(req.params.id)
		.catch(next)
		.then(function(){
			return res.status(200).send(null);
		});
	});

	// Get
	router.get('/:id', function(req, res, next) {
		core.get(req.params.id)
		.catch(next)
		.then(function(answer){
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
			return res.statue(400).send({message: '`clue` is invalid JSON.'});
		}

		// parse criteria
		var criteria = null;
		if(req.query.criteria) try {
			criteria = JSON.parse(req.query.criteria);
		} catch (e) {
			return res.statue(400).send({message: '`criteria` is invalid JSON.'});
		}

		core.query(clue, query)
		.catch(next)
		.then(function(answers){
			return res.status(200).send(answers);
		});
	});

	return router;
}
