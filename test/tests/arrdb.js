'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var arrdb = require('../../lib/core/arrdb.js')(config);

describe('ArrDB', function() {

	it('is not active', function(){
		assert.isFalse(arrdb.status);
	});

	it('is empty', function(){
		assert.lengthOf(arrdb.db, 0);
	});


	it.skip('emits a "start" event');
	it('populates db on start', function(done){
		arrdb.start()
		.catch(done)
		.then(function(){
			assert.lengthOf(arrdb.db, 1);
			done();
		})
	});

	it.skip('syncs an insert operation');
	it.skip('syncs a replace operation');
	it.skip('syncs a delete operation');

	it.skip('emits an "error" on connection failure');
	it.skip('emits a "reconnect" event');
	it.skip('reconnects automatically');

	it.skip('emits a "stop" event');
	it.skip('clears the db when stopped');

});