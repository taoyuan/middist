"use strict";

/**
 * Instantiate middist.
 */

var proto = require('./proto');

var middist = module.exports = function create() {
  var router = function (data, next) {
    router.handle(data, next);
  };
  merge(router, proto);
  router.stack = [];
  for (var i = 0; i < arguments.length; ++i) {
    router.use(arguments[i]);
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
    if (!done && typeof data === 'function') {
      done = data;
      data = undefined;
    }

    done = done || function () {
      };

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

function merge(a, b) {
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
}
