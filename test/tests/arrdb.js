'use strict';

var r = require('rethinkdb');
var assert = require('chai').assert;
var config = require('../init.js');
var arrdb = require('../../lib/core/arrdb.js')(config.core);



describe('ArrDB', function() {
	after(function(done){
		arrdb.stop()
		.then(function(){ done(); })
		.catch(done);
	});

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
			assert.lengthOf(arrdb.db, 2);
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

		it('emits stop and start', function(done){
			var expect = 2; function n(){
				expect--; if(expect === 0) done();
			}

			arrdb.once('stop', n);
			arrdb.once('start', n);
			arrdb.restart();
		});
	});

	describe('auto reconnect', function(){
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

	describe('sync operations', function(){
		before(function(done){
			arrdb.start()
			.then(function(){ done(); })
			.catch(done);
		});

		it('syncs an insert operation', function(done){
			var answer = {
				id: 'arrdb-test',
				data: {},
				criteria: [
					{
						op: 'equal',
						path: ['foo'],
						value: 'bar'
					}
				]
			};

			arrdb.once('sync', function(){
				assert.lengthOf(arrdb.db, 3);
				assert.include(arrdb.db, answer);
				done();
			});

			r.connect(config.core.rethinkdb, function(err, conn) {
				if(err) return done(err);
				r.db(config.core.rethinkdb.db).table(config.core.table).insert(answer).run(conn, function(err, res){
					conn.close();
					if(err) done(err);
				});
			});
		});

		it('syncs a replace operation', function(done){
			var answer = {
				id: 'arrdb-test',
				data: {},
				criteria: [
					{
						op: 'equal',
						path: ['foo'],
						value: 'baz'
					}
				]
			};

			arrdb.once('sync', function(){
				assert.lengthOf(arrdb.db, 3);
				assert.include(arrdb.db, answer);
				done();
			});

			r.connect(config.core.rethinkdb, function(err, conn) {
				if(err) return done(err);
				r.db(config.core.rethinkdb.db).table(config.core.table).get('arrdb-test').replace(answer).run(conn, function(err, res){
					conn.close();
					if(err) done(err);
				});
			});
		});

		it('syncs a delete operation', function(done){
			arrdb.once('sync', function(){
				assert.lengthOf(arrdb.db, 2);
				done();
			});

			r.connect(config.core.rethinkdb, function(err, conn) {
				if(err) return done(err);
				r.db(config.core.rethinkdb.db).table(config.core.table).get('arrdb-test').delete().run(conn, function(err, res){
					conn.close();
					if(err) done(err);
				});
			});
		});
	});

});