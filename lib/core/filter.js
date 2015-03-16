'use strict';

// We're splitting hairs here, but we don't want to redeclare
// these strings all the time... maximum performance! :-)
var u = 'undefined';
var f = 'function';
var s = 'string';


function traverse(path, clue) {

	// make sure the `path` is an array
	if(!Array.isArray(path)) throw false;

	// traverse the clue
	var cursor = clue;
	for (var i = 0; i < path.length; i++) {
		cursor = cursor[path[i]];
		if(typeof cursor === u) throw false;
	}

	return cursor;
}

var ops = {


	// Exists
	// ------
	// 
	// Asserts that a path exists.

	exists: function exists(criterion, clue){

		// traverse throws if path doesn't exist
		traverse(criterion.path, clue);

		// no errors
		return true;
	},


	// Match
	// -----
	// 
	// Asserts that the `path` exists and its value is matched by regex `value`.
	// TODO: pre-coerce `criterion.value` using `new Regex()`

	match: function match(criterion, clue){

		// traverse the clue
		var cursor = traverse(criterion.path, clue);

		// make the comparison
		return !!(typeof cursor === s && cursor.match(criterion.value));
	},


	// Equal
	// -----
	// 
	// Asserts that the `path` exists and its value is strictly equal to `value`.

	eq: function eq(criterion, clue){

		// traverse the clue
		var cursor = traverse(criterion.path, clue);

		// make the comparison
		return cursor === criterion.value;
	},


	// Not Equal
	// ---------
	// 
	// Asserts that the `path` does not exist or its value is not strictly equal to `value`.

	ne: function ne(criterion, clue){
		var cursor;

		// traverse the clue
		try { cursor = traverse(criterion.path, clue); }
		catch(e) { return true; }

		// make the comparison
		return cursor !== criterion.value;
	},


	// Greater Than
	// ------------
	// 
	// Asserts that the `path` exists and its value is greater than `value`.

	gt: function gt(criterion, clue){

		// traverse the clue
		var cursor = traverse(criterion.path, clue);

		// make the comparison
		return cursor > criterion.value;
	},


	// Greater Than or Equal
	// ---------------------
	// 
	// Asserts that the `path` exists and its value is greater than or equal to `value`.

	ge: function ge(criterion, clue){

		// traverse the clue
		var cursor = traverse(criterion.path, clue);

		// make the comparison
		return cursor >= criterion.value;
	},


	// Less Than
	// ---------
	// 
	// Asserts that the `path` exists and its value is less than `value`.

	lt: function lt(criterion, clue){

		// traverse the clue
		var cursor = traverse(criterion.path, clue);

		// make the comparison
		return cursor < criterion.value;
	},


	// Less Than or Equal
	// ------------------
	// 
	// Asserts that the `path` exists and its value is less than or equal to `value`.

	le: function le(criterion, clue){

		// traverse the clue
		var cursor = traverse(criterion.path, clue);

		// make the comparison
		return cursor <= criterion.value;
	}
};

function filter(criteria, clue) {

	if(!Array.isArray(criteria)) return false;

	try {
		for (var i = 0; i < criteria.length; i++) {

			// make sure operation exists
			if(typeof ops[criteria[i].op] !== f)
				return false;

			// all criteria must be met
			if(ops[criteria[i].op](criteria[i], clue) === false)
				return false;
		}
	} catch(e) {
		return false;
	}

	// all criteria passed
	return true;
}

module.exports = filter;
