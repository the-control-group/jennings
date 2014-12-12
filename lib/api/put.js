'use strict';

module.exports = function(resources) {
	return function(req, res, next) {
		var id = req.params.id;

		// TODO: validate req.body against schema

		// TODO: replace in rethinkdb
	}
}