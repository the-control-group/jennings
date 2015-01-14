'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var core;

describe('Core', function() {

	before(function(){
		core = require('../../lib/core/index.js')(config.core);
	});

	after(function(done){
		core.arrdb.stop()
		.then(function(){ done(); })
		.catch(done);
	});

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
					op: 'equal',
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
					op: 'equal',
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

	it('responds to a query with conditions', function(done){
		var conditions = [{
			path: ['id'],
			op: 'equal',
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
		// 	question: 'america\'s second-largest daily newspaper, it\'s published in new york city & 4 regional editions'
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
		core.delete('core-test')
		.then(function(answer){
			assert.equal(answer.id, 'core-test');
			done();
		})
		.catch(done);
	});
	
});