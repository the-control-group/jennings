'use strict';

var espress = require('express');
var bodyParser = require('body-parser');
var r = require('rethinkdb');

module.exports = function(config) {
	var router = express.Router();

	/*************
	* Resources *
	*************/
	var resources = {
		rethinkdb: r.connect(config.rethinkdb)
	};



	/***********
	* Routing *
	***********/

	// add middleware
	router.use('/api', bodyParser.urlencoded({extended: true}));
	router.use('/api', bodyParser.json());


	// add the endpoints
	router.post('/',      require('./api/post.js')(resources));
	router.get('/',       require('./api/get.js')(resources));
	router.get('/:id',    require('./api/get.js')(resources));
	router.put('/:id',    require('./api/put.js')(resources));
	router.delete('/:id', require('./api/delete.js')(resources));


	// error handling
	router.use(function(err, req, res, next){
		var e = res.error(err);

		if(e.code === 500){

			// use the original stack if present
			e.stack = err.stack || e.stack;

			console.error(e.code, e.message, e.stack);
			throw(e);
		}
	});

	return router;
}