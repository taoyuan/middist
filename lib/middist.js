"use strict";

/**
 * Instantiate middist.
 */

var proto = require('./proto');

module.exports = createMiddist;

function createMiddist() {
    var middist = function (data, next) { middist.handle(data, next); };
    merge(middist, proto);
    middist.stack = [];
    for (var i = 0; i < arguments.length; ++i) {
        middist.use(arguments[i]);
    }
    return middist;
}

function merge(a, b){
    if (a && b) {
        for (var key in b) {
            a[key] = b[key];
        }
    }
    return a;
}