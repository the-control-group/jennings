'use strict';

// We're splitting hairs here, but we don't want to redeclare
// these strings all the time... maximum performance! :-)
var a = 'array';
var u = 'undefined';

var ops = {

	// Exists
	// ------
	// 
	// Asserts that a key exists.

	exists: function exists(criterion, subject){

		// make sure the `key` is an array
		if(typeof criterion.key !== a) return false;

		// traverse the subject
		var cursor = subject;
		for (var i = 0; i < criterion.key.length; i++) {
			cursor = cursor[criterion.key[i]];
			if(typeof cursor === u) return false;
		}

		// no errors
		return true;
	},

	// Equals
	// ------
	// 
	// Asserts that the `key` exists and its value exactly equals `term`.

	equals: function equals(criterion, subject){

		// make sure the key is an array
		if(typeof criterion.key !== a) return false;

		// traverse the subject
		var cursor = subject;
		for (var i = 0; i < criterion.key.length; i++) {
			cursor = cursor[criterion.key[i]];
			if(typeof cursor === u) return false;
		}

		// make the comparison
		return cursor === criterion.term;
	}
};


function filter(criteria, subject) {
	for (var i = 0; i < criteria.length; i++) {

		// make sure operation exists
		if(typeof ops[criteria[i].op] === u)
			return false;

		// all criteria must be met
		if(ops[criteria[i].op](ops[criteria[i].op], subject) === false)
			return false;
	}

	// all criteria passed
	return true;
}

module.exports = filter;
