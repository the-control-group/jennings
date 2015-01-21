'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var core, request;

var data = {
	criteria: [
		{
			op: "equal",
			path: [
				"category"
			],
			value: "let's have a ball"
		},
		{
			op: "match",
			path: [
				"question"
			],
			value: "scratched"
		},
		{
			op: "match",
			path: [
				"question"
			],
			value: "sink"
		}
	],
	data: {
		response: "cue ball"
	}
};

describe('Router', function() {
	var createdId;

	before(function(){
		var app = require('express')();
		core = require('../../lib/core/index.js')(config.core);
		app.use(core.router).use(function(err, req, res, next){});
		request = require('supertest')(app);
	});

	after(function(done){
		core.$arrdb.stop()
		.then(function(){ done(); })
		.catch(done);
	});

	it('rejects an invalid POST', function(done){
		request
			.post('/')
			.send({
				foo: 'bar'
			})
			.expect(400)
			.end(done);
	});

	it('accepts a valid POST', function(done){
		request
			.post('/')
			.send(data)
			.expect(201)
			.end(function(err, res){
				if(err) return done(err);
				assert.isString(res.body.id);
				createdId = res.body.id;
				delete res.body.id;
				assert.deepEqual(res.body, data);
				done();
			});
	});

	it('rejects an invalid PUT', function(done){
		request
			.put('/' + createdId)
			.send({
				foo: 'bar'
			})
			.expect(400)
			.end(done);
	});

	it('accepts a valid PUT', function(done){
		data.data.updated = 'updated';
		request
			.put('/' + createdId)
			.send(data)
			.expect(200)
			.end(function(err, res){
				if(err) return done(err);
				assert.equal(res.body.id, createdId);
				delete res.body.id;
				assert.deepEqual(res.body, data);
				done();
			});
	});

	it('responds 404 to a nonexistant GET', function(done){
		request
			.get('/nonexistant')
			.send(data)
			.expect(404)
			.end(done);
	});

	it('responds 200 to an existant GET', function(done){
		request
			.get('/' + createdId)
			.send(data)
			.expect(200)
			.end(function(err, res){
				if(err) return done(err);
				assert.equal(res.body.id, createdId);
				delete res.body.id;
				assert.deepEqual(res.body, data);
				done();
			});
	});

	it('responds to a GET query with criteria', function(done){
		request
			.get('/')
			.query({criteria: '[{"op":"eq","path":["id"],"value":"'+createdId+'"}]'})
			.send(data)
			.expect(200)
			.end(function(err, res){
				if(err) return done(err);
				assert.isArray(res.body);
				assert.lengthOf(res.body, 1);
				done();
			});
	});

	it('responds to a GET query with a clue', function(done){
		request
			.get('/')
			.query({clue: '{"category": "let\'s have a ball", "question": "sink it and you\\\"ve scratched"}'})
			.send(data)
			.expect(200)
			.end(function(err, res){
				if(err) return done(err);
				assert.isArray(res.body);
				assert.lengthOf(res.body, 2);
				done();
			});
	});

	it('responds 404 to a nonexistant DELETE', function(done){
		request
			.delete('/nonexistant')
			.send(data)
			.expect(404)
			.end(done);
	});

	it('responds 200 to an existant DELETE', function(done){
		request
			.delete('/' + createdId)
			.send(data)
			.expect(200)
			.end(function(err, res){
				if(err) return done(err);
				assert.equal(res.body.id, createdId);
				delete res.body.id;
				assert.deepEqual(res.body, data);
				done();
			});
	});
	
});