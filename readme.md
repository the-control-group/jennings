Jennings
========

Jennings is a simple, crazy-fast NodeJS library/router/service for processing inverted queries. What is an inverted query? It's kind of like the game show Jeopardy: you're using a clue in the form of a statement to narrow down a list of answers formed as questions. It's not a perfect metaphor, but it's a good starting point. In practice, inverted queries are part of any notification system, bidding system, etc.

Jennings is designed for extremely low latency and easy clustering; the entire answers database is replicated in-memory on each node.


Query Language
--------------
Conditions are inspired by the JSON Patch spec ([RFC 6902](https://tools.ietf.org/html/rfc6902)). A condition is an object that consists of an `op` property which specifies which operation to use; a `path` property which can be either a [json-pointer](https://tools.ietf.org/html/rfc6901) or (preferred) an array of path parts; and a `value` property which is used by the operation. The following operations are currently supported:

**exists** ensures that the clue contains a property at the given `path`; `value` should be set to null

**equal** ensures that the contains a propert at the given `path`, and that its value is strictly equal to `value`

**match** ensures that the contains a propert at the given `path`, and that its value is matched by the regular expression supplied in `value`


How To Use
----------

**as a library**
```js
var jennings = require('js');

// insert a new answer (returns a promise)
jennings.insert({conditions: [{op: 'equal', path: ['foo'], 'value': 'bar'}], data: {cool: 'beans'}});

// replace an existing answer (returns a promise)
jennings.replace('one', {id: 'one', conditions: [{op: 'equal', path: ['foo'], 'value': 'bar'}], data: {cool: 'beans'}});

// get an answer by ID
jennings.get('one');

// get all answers
jennings.query();

// query for answers by clue
jennings.query({foo: 'bar'});

// query for by conditions
jennings.query(null, [{op: 'equal', path: ['id'], value: 'one'}]);

```

**as a router**
```js
var config = require('path/to/your/config.json');
var app = require('express')();

var jennings = require('jennings');

// add the router to your express app
app.use('/prefix', jennings.router);

```

**as a service**
```bash
# run the server
node server.js

# in production, it's recommended to cluster using PM2
pm2 start server.js -i max -n jennings
```


Performance Tips
----------------

Jennings is designed to very easily scale horizontally to acommodate an extremely large number of simultaneous requests. It is designed to hold thousands of answers, but not millions. To accomidate more answers and maintain awesome response times, you'll have to scale vertically.

