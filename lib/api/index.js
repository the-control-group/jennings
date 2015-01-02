'use strict';

var espress = require('express');
var bodyParser = require('body-parser');

module.exports = function(core) {
	var router = express.Router();

	// add middleware
	router.use('/', bodyParser.urlencoded({extended: true}));
	router.use('/', bodyParser.json());

	// add endpoints
	router.post('/',      require('./api/post.js')(core));
	router.get('/',       require('./api/get.js')(core));
	router.get('/:id',    require('./api/get.js')(core));
	router.put('/:id',    require('./api/put.js')(core));
	router.delete('/:id', require('./api/delete.js')(core));

	return router;
}
