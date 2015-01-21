'use strict';

module.exports = {
	core: {
		rethinkdb: {
			db: 'jennings',
			host: process.env.WERCKER_RETHINKDB_HOST || '127.0.0.1'
		},
		pool: {
			log: false,
			min: 1,
			max: 1,
			timeout: 30000
		},
		arrdb: {
			retry: 500
		},
		table: 'answers'
	},
	api: {
		
	},
	prefix: '/v1',
	port: 3000
};
