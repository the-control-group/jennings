'use strict';

var filter = require('./filter.js');

module.exports = function(config, loadQuery, feedQuery) {
	var arrdb = require('./arrdb.js')(config, loadQuery, feedQuery);

	return {
		filter: filter,
		arrdb: arrdb
	};
};
