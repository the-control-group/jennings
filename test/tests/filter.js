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

	describe('equal', function(){
		it('accepts strict equal', function(){
			assert.isTrue(filter(
				[{op: 'equal', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});

		it('accepts deep equal', function(){
			assert.isTrue(filter(
				[{op: 'equal', path: ['foo','bar'], value: true}],
				{foo: {bar: true}}
			));
		});

		it('rejects failed equal', function(){
			assert.isFalse(filter(
				[{op: 'equal', path: ['foo'], value: 1}],
				{foo: 'asdf'}
			));
		});

		it('rejects loose equal', function(){
			assert.isFalse(filter(
				[{op: 'equal', path: ['foo'], value: 1}],
				{foo: true}
			));
		});

		it('rejects nonexistant path', function(){
			assert.isFalse(filter(
				[{op: 'equal', path: ['foo'], value: true}],
				{}
			));
		});

		it('rejects nonexistant deep path', function(){
			assert.isFalse(filter(
				[{op: 'equal', path: ['foo','bar'], value: 'baz'}],
				{foo: 'bar'}
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
					{op: 'equal', path: ['foo'], value: 'bar'},
					{op: 'equal', path: ['baz'], value: 'bah'}
				],
				{foo: 'bar', baz: 'bah'}
			));
		});

		it('rejects if either is false', function(){
			assert.isFalse(filter(
				[
					{op: 'equal', path: ['foo'], value: 'bar'},
					{op: 'equal', path: ['baz'], value: false}
				],
				{foo: 'bar', baz: 'bah'}
			));
		});

	})

});