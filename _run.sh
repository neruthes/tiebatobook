#!/bin/sh

node prefetch.js
node fetch.js
node parse.js
open 'http://localhost:10482/'
node server.js
