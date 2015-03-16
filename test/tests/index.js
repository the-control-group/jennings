'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var jennings;

describe('Jennings', function() {
	var createdId;

	before(function(){
		jennings = require('../../lib/index.js')(config);
	});

	after(function(){
		return jennings.$core.arrdb.stop();
	});

	it('rejects an invalid create', function(done){
		jennings.create({foo: 'bar'})
		.then(function(){ done(new Error('should not pass validation')); })
		.catch(function(){ done(); });
	});

	it('accepts a valid create', function(){
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

		return jennings.create(data)
		.then(function(answer){
			createdId = answer.id;
			delete answer.id;
			assert.deepEqual(answer, data);
		});
	});

	it('rejects an invalid save', function(done){
		jennings.save(createdId, {foo: 'bar'})
		.then(function(){ done(new Error('should not pass validation')); })
		.catch(function(){ done(); });
	});

	it('accepts a valid save', function(){
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

		return jennings.save(data.id, data)
		.then(function(answer){
			assert.deepEqual(answer, data);
		});
	});

	it('applies defaults on save', function(){
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
		
		return jennings.save(data.id, data)
		.then(function(answer){
			assert.deepEqual(answer.data, {});
		});
	});

	it('returns null for a nonexistant get', function(){
		return jennings.get('foo')
		.then(function(answer){
			assert.isNull(answer);
		});
	});

	it('accepts an existing get', function(){
		return jennings.get(createdId)
		.then(function(answer){
			assert.equal(answer.id, createdId);
		});
	});

	it('responds to a query for all answers', function(){
		return jennings.query(null, null, false).then(function(answers){
			assert.lengthOf(answers, 3);
		});
	});

	it('responds to a strongly consistent query for all answers', function(){
		return jennings.query(null, null, true).then(function(answers){
			assert.lengthOf(answers, 3);
		});
	});

	it('responds to a query with conditions', function(){
		var conditions = [{
			path: ['id'],
			op: 'eq',
			value: 'one'
		}];
		return jennings.query(null, conditions, false).then(function(answers){
			assert.lengthOf(answers, 1);
			assert.equal(answers[0].id, 'one');
		});
	});

	it('responds to a query with a clue', function(){
		var clue = {
			category: 'let\'s have a ball',
			question: 'sink it and you\'ve scratched'
		};
		// {
		// 	category: 'street\'s',
		// 	question: 'america\'s second-largest daily newspaper, it\'s published in new york city & 4 regional editions',
		// 	editions: 4
		// }
		return jennings.query(clue, null, false).then(function(answers){
			assert.lengthOf(answers, 1);
			assert.equal(answers[0].id, 'one');
		});
	});

	it('returns null for a nonexistant delete', function(){
		return jennings.delete('foo')
		.then(function(answer){
			assert.isNull(answer);
		});
	});
	
	it('accepts an existing delete', function(){
		return jennings.delete(createdId)
		.then(function(answer){
			assert.equal(answer.id, createdId);
		});
	});
	
});