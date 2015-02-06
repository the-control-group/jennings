'use strict';

module.exports = {
	core: {
		table: 'answers',
		rethinkdb: {
			db: 'jennings',
			host: process.env.WERCKER_RETHINKDB_HOST || '127.0.0.1'
		},
		arrdb: {
			retry: 500
		}
	},
	pool: {
		log: false,
		min: 1,
		max: 1,
		timeout: 30000
	},
	prefix: '/v1',
	port: 3000
};
