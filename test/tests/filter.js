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

	describe('equals', function(){
		it('accepts strict equals', function(){
			assert.isTrue(filter(
				[{op: 'equals', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});

		it('accepts deep equals', function(){
			assert.isTrue(filter(
				[{op: 'equals', path: ['foo','bar'], value: true}],
				{foo: {bar: true}}
			));
		});

		it('rejects failed equals', function(){
			assert.isFalse(filter(
				[{op: 'equals', path: ['foo'], value: 1}],
				{foo: 'asdf'}
			));
		});

		it('rejects loose equals', function(){
			assert.isFalse(filter(
				[{op: 'equals', path: ['foo'], value: 1}],
				{foo: true}
			));
		});

		it('rejects nonexistant path', function(){
			assert.isFalse(filter(
				[{op: 'equals', path: ['foo'], value: true}],
				{}
			));
		});

		it('rejects nonexistant deep path', function(){
			assert.isFalse(filter(
				[{op: 'equals', path: ['foo','bar'], value: 'baz'}],
				{foo: 'bar'}
			));
		});
	});

	describe('match', function(){
		it('accepts match', function(){
			assert.isTrue(filter(
				[{op: 'matches', path: ['foo'], value: 'bar'}],
				{foo: 'bar'}
			));
		});

		it('accepts deep match', function(){
			assert.isTrue(filter(
				[{op: 'matches', path: ['foo','bar'], value: '^.az$'}],
				{foo: {bar: 'baz'}}
			));
		});

		it('rejects non-string path value', function(){
			assert.isFalse(filter(
				[{op: 'matches', path: ['foo'], value: true}],
				{foo: true}
			));
		});

		it('rejects failed match', function(){
			assert.isFalse(filter(
				[{op: 'matches', path: ['foo'], value: 'fff'}],
				{foo: 'asdf'}
			));
		});

		it('rejects nonexistant path', function(){
			assert.isFalse(filter(
				[{op: 'matches', path: ['foo'], value: true}],
				{}
			));
		});

		it('rejects nonexistant deep path', function(){
			assert.isFalse(filter(
				[{op: 'matches', path: ['foo','bar'], value: 'baz'}],
				{foo: 'bar'}
			));
		});
	});

	describe('multiple', function(){
		it('accepts strict equals', function(){
			assert.isTrue(filter(
				[
					{op: 'equals', path: ['foo'], value: 'bar'},
					{op: 'equals', path: ['baz'], value: 'bah'}
				],
				{foo: 'bar', baz: 'bah'}
			));
		});

		it('rejects if either is false', function(){
			assert.isFalse(filter(
				[
					{op: 'equals', path: ['foo'], value: 'bar'},
					{op: 'equals', path: ['baz'], value: false}
				],
				{foo: 'bar', baz: 'bah'}
			));
		});

	})

});