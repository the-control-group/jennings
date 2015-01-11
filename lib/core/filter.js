'use strict';

// We're splitting hairs here, but we don't want to redeclare
// these strings all the time... maximum performance! :-)
var u = 'undefined';
var s = 'string';

var ops = {

	// Exists
	// ------
	// 
	// Asserts that a path exists.

	exists: function exists(criterion, clue){

		// make sure the `path` is an array
		if(!Array.isArray(criterion.path)) return false;

		// traverse the clue
		var cursor = clue;
		for (var i = 0; i < criterion.path.length; i++) {
			cursor = cursor[criterion.path[i]];
			if(typeof cursor === u) return false;
		}

		// no errors
		return true;
	},

	// Equals
	// ------
	// 
	// Asserts that the `path` exists and its value exactly equals `value`.

	equals: function equals(criterion, clue){

		// make sure the path is an array
		if(!Array.isArray(criterion.path)) return false;

		// traverse the clue
		var cursor = clue;
		for (var i = 0; i < criterion.path.length; i++) {
			cursor = cursor[criterion.path[i]];
			if(typeof cursor === u) return false;
		}

		// make the comparison
		return cursor === criterion.value;
	},

	// Matches
	// -------
	// 
	// Asserts that the `path` exists and its value is matched by regex `value`.
	// TODO: pre-coerce `criterion.value` using `new Regex()`

	matches: function matches(criterion, clue){

		// make sure the path is an array
		if(!Array.isArray(criterion.path)) return false;

		// traverse the clue
		var cursor = clue;
		for (var i = 0; i < criterion.path.length; i++) {
			cursor = cursor[criterion.path[i]];
			if(typeof cursor === u) return false;
		}

		// make the comparison
		return !!(typeof cursor === s && cursor.match(criterion.value));
	}
};


function filter(criteria, clue) {

	if(!Array.isArray(criteria)) return false;

	for (var i = 0; i < criteria.length; i++) {

		// make sure operation exists
		if(typeof ops[criteria[i].op] === u)
			return false;

		// all criteria must be met
		if(ops[criteria[i].op](criteria[i], clue) === false)
			return false;
	}

	// all criteria passed
	return true;
}

module.exports = filter;
