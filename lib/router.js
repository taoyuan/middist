"use strict";

/**
 * Instantiate middist.
 */

var assert = require('assert');
var flatten = require('lodash.flatten');
var proto = require('./proto');

var middist = module.exports = function create() {
  var router = function (data, next) {
    router.handle(data, next);
  };
  merge(router, proto);
  router.stack = [];
  var args = flatten(arguments);
  for (var i = 0; i < args.length; ++i) {
    router.use(args[i]);
  }
  return router;
};

/**
 *
 * @param {Function} iterator - function (layer, data, next)
 * @returns {Function}
 */
middist.build = function (iterator) {

  return function (stack, data, done) {
    assert(stack, 'stack is required');
    assert(data, 'data is required');

    done = done || noop;

    var idx = 0, layer, ended;

    function next(err) {
      if (ended) return;
      if (err) {
        ended = true;
        return done(err);
      }

      layer = stack[idx++];

      if (!layer) {
        ended = true;
        return done();
      }

      try {
        iterator(layer, data, next);
      } catch (e) {
        next(e);
      }
    }

    next();
  };

};

function noop() {
  //noop
}

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}
