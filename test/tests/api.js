'use strict';

var assert = require('chai').assert;
var config = require('../init.js');
var arrdb = require('../../lib/core/arrdb.js')(config.core);

after(function(done){
	arrdb.stop()
	.then(function(){ done(); })
	.catch(done);
});

describe('API', function() {

	it.skip('rejects an invalid POST');
	it.skip('accepts a valid POST');

	it.skip('rejects an invalid PUT');
	it.skip('accepts a valid PUT');

	it.skip('responds to a GET with :id');

	it.skip('responds to a GET query with conditions');
	it.skip('responds to a GET query with a clue');
	it.skip('responds to a GET query with a clue and conditions');

	it.skip('accepts a valid DELETE');
	
});