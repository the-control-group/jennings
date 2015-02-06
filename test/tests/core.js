'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var core;

describe('Core', function() {
	var createdId;

	before(function(){
		core = require('../../lib/core/index.js')(config.core);
	});

	after(function(done){
		core.$arrdb.stop()
		.then(function(){ done(); })
		.catch(done);
	});

	it('rejects an invalid create', function(done){
		core.create({foo: 'bar'})
		.then(function(){ done(new Error('should not pass validation')); })
		.catch(function(){ done(); });
	});

	it('accepts a valid create', function(done){
		var data = {
			data: {},
			criteria: [
				{
					op: 'eq',
					path: ['foo'],
					value: 'bar'
				}
			]
		};
		core.create(data)
		.then(function(answer){
			createdId = answer.id;
			delete answer.id;
			assert.deepEqual(answer, data);
			done();
		})
		.catch(done);
	});

	it('rejects an invalid save', function(done){
		core.save(createdId, {foo: 'bar'})
		.then(function(){ done(new Error('should not pass validation')); })
		.catch(function(){ done(); });
	});

	it('accepts a valid save', function(done){
		var data = {
			id: createdId,
			data: {},
			criteria: [
				{
					op: 'eq',
					path: ['foo'],
					value: 'baz'
				}
			]
		};
		core.save(data.id, data)
		.then(function(answer){
			assert.deepEqual(answer, data);
			done();
		})
		.catch(done);
	});

	it('applies defaults on save', function(done){
		var data = {
			id: createdId,
			criteria: [
				{
					op: 'eq',
					path: ['foo'],
					value: 'baz'
				}
			]
		};
		core.save(data.id, data)
		.then(function(answer){
			assert.deepEqual(answer.data, {});
			done();
		})
		.catch(done);
	});

	it('returns null for a nonexistant get', function(done){
		core.get('foo')
		.then(function(answer){
			assert.isNull(answer);
			done();
		})
		.catch(done);
	});

	it('accepts an existing get', function(done){
		core.get(createdId)
		.then(function(answer){
			assert.equal(answer.id, createdId);
			done();
		})
		.catch(done);
	});

	it('responds to a query with conditions', function(done){
		var conditions = [{
			path: ['id'],
			op: 'eq',
			value: 'one'
		}];
		core.query(null, conditions).then(function(answers){
			assert.lengthOf(answers, 1);
			assert.equal(answers[0].id, 'one');
			done();
		});
	});

	it('responds to a query with a clue', function(done){
		var clue = {
			category: 'let\'s have a ball',
			question: 'sink it and you\'ve scratched'
		};
		// {
		// 	category: 'street\'s',
		// 	question: 'america\'s second-largest daily newspaper, it\'s published in new york city & 4 regional editions',
		// 	editions: 4
		// }
		core.query(clue).then(function(answers){
			assert.lengthOf(answers, 1);
			assert.equal(answers[0].id, 'one');
			done();
		});
	});

	it('returns null for a nonexistant delete', function(done){
		core.delete('foo')
		.then(function(answer){
			assert.isNull(answer);
			done();
		})
		.catch(done);
	});
	it('accepts an existing delete', function(done){
		core.delete(createdId)
		.then(function(answer){
			assert.equal(answer.id, createdId);
			done();
		})
		.catch(done);
	});
	
});