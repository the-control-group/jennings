Jennings
========

Jennings is a simple, crazy-fast NodeJS library/router/service for processing inverted queries. What is an inverted query? It's kind of like the game show Jeopardy: you're using a clue in the form of a statement to narrow down a list of answers formed as questions. It's not a perfect metaphor, but it's a good starting point. In practice, inverted queries are part of any notification system, bidding system, etc.

Jennings is designed for extremely low latency and easy clustering; the entire answers database is replicated in-memory on each node.


Query Language
--------------

**exists**

**equals**


How To Use
----------

**as a library**

**as a router**

**as a service**



Performance Tips
----------------

TODO


TODO
----
- core should be an event emitter, emitting
	- disconnect
	- update
	- reset
