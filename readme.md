Jennings
========

[![wercker status](https://app.wercker.com/status/7c36ae034960f9fc1efe31095c2625dc/s "wercker status")](https://app.wercker.com/project/bykey/7c36ae034960f9fc1efe31095c2625dc)

Jennings is a simple, crazy-fast NodeJS library/router/service for processing inverted queries. What is an inverted query? It's kind of like the game show Jeopardy: you're using a clue in the form of a statement to narrow down a list of answers formed as questions. It's not a perfect metaphor, but it's a good starting point. In practice, inverted queries are part of any notification system, bidding system, etc.

Jennings is designed for extremely low latency and easy clustering; the entire answers database is replicated in-memory on each node.


Query Language
--------------
Criteria are inspired by the JSON Patch spec ([RFC 6902](https://tools.ietf.org/html/rfc6902)). A criterion is an object that consists of an `op` property which specifies which operation to use; a `path` property which can be either a [json-pointer](https://tools.ietf.org/html/rfc6901) or (preferred) an array of path parts; and a `value` property which is used by the operation. The following operations are currently supported:

**exists** ensures that the clue contains a property at the given `path`; `value` should be set to null

**match** ensures that the clue contains a property at the given `path`, and that its value is matched by the regular expression supplied in `value`

**eq** ensures that the clue contains a property at the given `path`, and that its value is strictly equal to `value`

**ne** ensures that the clue lacks a property at the given `path`, or that its value is not strictly equal to `value`

**lt** ensures that the clue contains a property at the given `path`, and that its value is less than `value`

**le** ensures that the clue contains a property at the given `path`, and that its value is less than or loosly equal to `value`

**gt** ensures that the clue contains a property at the given `path`, and that its value is greater than `value`

**ge** ensures that the clue contains a property at the given `path`, and that its value is greater than or loosly equal to `value`

----

**Example:**

```js
// Clue
{
	"category": "let's have a ball",
	"question": "sink it and you've scratched"
}

// Answer - this is one answer that might be returned in response to the above clue
{
	"id": "3dd771a1-c9d1-4c42-8057-e44ed788bf52",
	"data": {
		"response": "cue ball"
	},
	"criteria": [
		{
			"op": "eq",
			"path": ["category"],
			"value": "let's have a ball"
		},
		{
			"op": "match",
			"path": ["question"],
			"value": "scratched"
		},
		{
			"op": "match",
			"path": ["question"],
			"value": "sink"
		}
	]
}
```


How To Use
----------

Jennings is written for [nodejs](http://nodejs.org/) and uses [RethinkDB](rethinkdb.com) for persistance and synchronization. You'll need to make sure both are installed and that RethinkDB is running. You can obtain Jennings from npm: `npm install jennings --save`, and use it as a standalone service or embed it in your node project.


**as a library**

All library methods return a promise object that resolves to the noted types.

```js
var jennings = require('js');

// insert a new answer and auto-generate ID (resolves to the new answer)
jennings.create({criteria: [{op: 'eq', path: ['foo'], 'value': 'bar'}], data: {cool: 'beans'}});

// replace/insert an answer by ID (resolves to the new answer)
jennings.save('one', {id: 'one', criteria: [{op: 'eq', path: ['foo'], 'value': 'bar'}], data: {cool: 'beans'}});

// get an answer by ID (resolves to the requested answer or null)
jennings.get('one');

// delete an answer by ID (resolves to the deleted answer)
jennings.delete('one');

// get all answers (resolves to an array of answers)
jennings.query();

// get all answers with strong consistency (resolves to an array of answers)
jennings.query(null, null, true);

// query for answers by clue (resolves to an array of answers)
jennings.query({foo: 'bar'});

// query for by criteria (resolves to an array of answers)
jennings.query(null, [{op: 'eq', path: ['id'], value: 'one'}]);

```

**as a router**

```js
var config = require('path/to/your/config.json');
var app = require('express')();

var jennings = require('jennings');

// add the router to your express app
app.use('/prefix', jennings.router);

// (create) POST   /prefix
// (save)   POST   /prefix/:id
// (get)    GET    /prefix/:id
// (delete) DELETE /prefix/:id
// (query)  GET    /prefix
// (query)  GET    /prefix?clue={"foo": "bar"}
// (query)  GET    /prefix?criteria=[{"op": "eq", "path": ["foo"], "value": "bar"}]

```

**as a service**

In production, it's recommended to use a process manager like [forever](https://www.npmjs.com/package/forever) or [pm2](https://www.npmjs.com/package/pm2) to restart your script in the event of a crash. However, it should be noted that the Jennings server already clusters operations across all available processor cores, so little is gained by using the cluster or fork features of PM2.

```bash
# in development
node server.js

# using forever in production
forever start server.js

# using pm2 in production
pm2 start server.js -n jennings -x 1
```


Performance Tips
----------------

Jennings is designed to very easily scale horizontally to acommodate an extremely large number of simultaneous requests. It is designed to hold thousands of answers, but not millions. To accomidate large numbers of answers and maintain awesome response times, you'll have to scale vertically.

