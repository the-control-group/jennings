'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var arrdb = require('../../lib/core/arrdb.js')(config.core);

after(function(done){
	arrdb.stop()
	.then(function(){ done(); })
	.catch(done);
});

describe('ArrDB', function() {

	it('is not active', function(){
		assert.isFalse(arrdb.active);
	});

	it('is empty', function(){
		assert.lengthOf(arrdb.db, 0);
	});


	describe('start', function(){
		it('emits a "start" event', function(done){
			arrdb.once('start', done);
			arrdb.start();
		});

		it('populates db on start', function(){
			assert.lengthOf(arrdb.db, 1);
		});
	});

	describe('stop', function(){
		it('emits a "stop" event', function(done){
			arrdb.once('stop', done);
			arrdb.stop();
		});

		it('clears the db when stopped', function(){
			assert.lengthOf(arrdb.db, 0);
		});
	});

	describe('restart', function(){
		before(function(done){
			arrdb.start()
			.then(function(){ done(); })
			.catch(done);
		});

		it('emits stop and start', function(){
			var expect = 2; function n(){
				expect--; if(expect === 0) done();
			}

			arrdb.once('stop', n);
			arrdb.once('start', n);
			arrdb.restart();
		});
	});

	describe('auto reconnect', function(){
		var emitsError, emitsReconnect;


		before(function(done){
			arrdb.start()
			.then(function(){
				done();
			})
			.catch(done);
		});

		it('emits an "error" on connection failure', function(done){
			arrdb.once('error', function(){ done(); });
			arrdb.conn.emit('error', new Error('testing'));
		});
		it('emits a "reconnect" event', function(done){
			arrdb.once('error', function(){});
			arrdb.once('reconnect', function(){ done(); });
			arrdb.conn.emit('error', new Error('testing'));
		});
	});


	it.skip('syncs an insert operation');
	it.skip('syncs a replace operation');
	it.skip('syncs a delete operation');

});