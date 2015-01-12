'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var core = require('../../lib/core/index.js')(config.core);

describe('Core', function() {

	it('rejects an invalid insert', function(done){
		core.insert({foo: 'bar'})
		.then(function(){ done(new Error('should not pass validation')); })
		.catch(function(){ done(); });
	});

	it('accepts a valid insert', function(done){
		var data = {
			id: 'core-test',
			data: {},
			criteria: [
				{
					op: 'equals',
					path: ['foo'],
					value: 'bar'
				}
			]
		};
		core.insert(data)
		.then(function(answer){
			assert.deepEqual(answer, data);
			done();
		})
		.catch(done);
	});

	it('rejects an invalid replace', function(done){
		core.replace('core-test', {foo: 'bar'})
		.then(function(){ done(new Error('should not pass validation')); })
		.catch(function(){ done(); });
	});

	it('accepts a valid replace', function(done){
		var data = {
			id: 'core-test',
			data: {},
			criteria: [
				{
					op: 'equals',
					path: ['foo'],
					value: 'baz'
				}
			]
		};
		core.replace(data.id, data)
		.then(function(answer){
			assert.deepEqual(answer, data);
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
		core.get('core-test')
		.then(function(answer){
			assert.equal(answer.id, 'core-test');
			done();
		})
		.catch(done);
	});

	it.skip('responds to a query with conditions');
	it.skip('responds to a query with a clue');
	it.skip('responds to a query with a clue and conditions');

	it('returns null for a nonexistant delete', function(done){
		core.delete('foo')
		.then(function(answer){
			assert.isNull(answer);
			done();
		})
		.catch(done);
	});
	it('accepts an existing delete', function(done){
		core.delete('core-test')
		.then(function(answer){
			assert.equal(answer.id, 'core-test');
			done();
		})
		.catch(done);
	});
	
});