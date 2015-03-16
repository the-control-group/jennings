'use strict';

var assert = require('chai').assert;
var filter = require('../../lib/core/filter.js');

describe('Filter', function() {

	describe('exists', function(){
		it('accepts existant path', function(){
			assert.isTrue(filter(
				[{op: 'exists', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});
		it('accepts deep existant path', function(){
			assert.isTrue(filter(
				[{op: 'exists', path: ['foo','bar'], value: 'baz'}],
				{foo: {bar: 'baz'}}
			));
		});

		it('rejects nonexistant path', function(){
			assert.isFalse(filter(
				[{op: 'exists', path: ['foo'], value: true}],
				{}
			));
		});

		it('rejects nonexistant deep path', function(){
			assert.isFalse(filter(
				[{op: 'exists', path: ['foo','bar'], value: true}],
				{foo: true}
			));
		});
	});

	describe('eq', function(){
		it('accepts strict equal', function(){
			assert.isTrue(filter(
				[{op: 'eq', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});

		it('accepts deep equal', function(){
			assert.isTrue(filter(
				[{op: 'eq', path: ['foo','bar'], value: true}],
				{foo: {bar: true}}
			));
		});

		it('rejects failed equal', function(){
			assert.isFalse(filter(
				[{op: 'eq', path: ['foo'], value: 1}],
				{foo: 'asdf'}
			));
		});

		it('rejects loose equal', function(){
			assert.isFalse(filter(
				[{op: 'eq', path: ['foo'], value: 1}],
				{foo: true}
			));
		});

		it('rejects nonexistant path', function(){
			assert.isFalse(filter(
				[{op: 'eq', path: ['foo'], value: true}],
				{}
			));
		});

		it('rejects nonexistant deep path', function(){
			assert.isFalse(filter(
				[{op: 'eq', path: ['foo','bar'], value: 'baz'}],
				{foo: 'bar'}
			));
		});
	});

	describe('ne', function(){
		it('rejects strict equal', function(){
			assert.isFalse(filter(
				[{op: 'ne', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});

		it('rejects deep equal', function(){
			assert.isFalse(filter(
				[{op: 'ne', path: ['foo','bar'], value: true}],
				{foo: {bar: true}}
			));
		});

		it('accepts failed equal', function(){
			assert.isTrue(filter(
				[{op: 'ne', path: ['foo'], value: 1}],
				{foo: 'asdf'}
			));
		});

		it('accepts loose equal', function(){
			assert.isTrue(filter(
				[{op: 'ne', path: ['foo'], value: 1}],
				{foo: true}
			));
		});

		it('accepts nonexistant path', function(){
			assert.isTrue(filter(
				[{op: 'ne', path: ['foo'], value: true}],
				{}
			));
		});

		it('accepts nonexistant deep path', function(){
			assert.isTrue(filter(
				[{op: 'ne', path: ['foo','bar'], value: 'baz'}],
				{foo: 'bar'}
			));
		});
	});

	describe('lt', function(){
		it('returns false when greater', function(){
			assert.isFalse(filter(
				[{op: 'lt', path: ['foo'], value: 4}],
				{foo: 5}
			));
		});

		it('returns false when equal', function(){
			assert.isFalse(filter(
				[{op: 'lt', path: ['foo'], value: 5}],
				{foo: 5}
			));
		});

		it('returns true when less', function(){
			assert.isTrue(filter(
				[{op: 'lt', path: ['foo'], value: 6}],
				{foo: 5}
			));
		});
	});

	describe('le', function(){
		it('returns false when greater', function(){
			assert.isFalse(filter(
				[{op: 'le', path: ['foo'], value: 4}],
				{foo: 5}
			));
		});

		it('returns true when equal', function(){
			assert.isTrue(filter(
				[{op: 'le', path: ['foo'], value: 5}],
				{foo: 5}
			));
		});

		it('returns true when less', function(){
			assert.isTrue(filter(
				[{op: 'le', path: ['foo'], value: 6}],
				{foo: 5}
			));
		});
	});


	describe('gt', function(){
		it('returns true when greater', function(){
			assert.isTrue(filter(
				[{op: 'gt', path: ['foo'], value: 4}],
				{foo: 5}
			));
		});

		it('returns false when equal', function(){
			assert.isFalse(filter(
				[{op: 'gt', path: ['foo'], value: 5}],
				{foo: 5}
			));
		});

		it('returns false when less', function(){
			assert.isFalse(filter(
				[{op: 'gt', path: ['foo'], value: 6}],
				{foo: 5}
			));
		});
	});

	describe('ge', function(){
		it('returns true when greater', function(){
			assert.isTrue(filter(
				[{op: 'ge', path: ['foo'], value: 4}],
				{foo: 5}
			));
		});

		it('returns true when equal', function(){
			assert.isTrue(filter(
				[{op: 'ge', path: ['foo'], value: 5}],
				{foo: 5}
			));
		});

		it('returns false when less', function(){
			assert.isFalse(filter(
				[{op: 'ge', path: ['foo'], value: 6}],
				{foo: 5}
			));
		});
	});

	describe('match', function(){
		it('accepts match', function(){
			assert.isTrue(filter(
				[{op: 'match', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});

		it('accepts deep match', function(){
			assert.isTrue(filter(
				[{op: 'match', path: ['foo','bar'], value: '^.az$'}],
				{foo: {bar: 'baz'}}
			));
		});

		it('rejects non-string path value', function(){
			assert.isFalse(filter(
				[{op: 'match', path: ['foo'], value: true}],
				{foo: true}
			));
		});

		it('rejects failed match', function(){
			assert.isFalse(filter(
				[{op: 'match', path: ['foo'], value: 'fff'}],
				{foo: 'asdf'}
			));
		});

		it('rejects nonexistant path', function(){
			assert.isFalse(filter(
				[{op: 'match', path: ['foo'], value: true}],
				{}
			));
		});

		it('rejects nonexistant deep path', function(){
			assert.isFalse(filter(
				[{op: 'match', path: ['foo','bar'], value: 'baz'}],
				{foo: 'bar'}
			));
		});
	});

	describe('multiple', function(){
		it('accepts strict equal', function(){
			assert.isTrue(filter(
				[
					{op: 'eq', path: ['foo'], value: 'bar'},
					{op: 'eq', path: ['baz'], value: 'bah'}
				],
				{foo: 'bar', baz: 'bah'}
			));
		});

		it('rejects if either is false', function(){
			assert.isFalse(filter(
				[
					{op: 'eq', path: ['foo'], value: 'bar'},
					{op: 'eq', path: ['baz'], value: false}
				],
				{foo: 'bar', baz: 'bah'}
			));
		});

	});

});