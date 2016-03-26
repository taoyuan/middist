"use strict";

var debug = require('debug')('middis');
var proto = module.exports = {};

/**
 * Add a middleware in the stack for the given type.
 *
 * @param {String|String[]} [type] the handler type where to use
 * the middleware. If not provided, middleware is always
 * used. Can be either a string or an array of string
 * @param {Function} handler
 * @returns {Object} the middist instance
 */
proto.use = function (type, handler) {
  // Convert args to array.
  var args = Array.prototype.slice.call(arguments);

  // Check if type not provided.
  if ('string' !== typeof type && !Array.isArray(type)) {
    type = [];
  } else {
    if ('string' === typeof type) {
      //wrap string in array to homogenize handling
      type = [type];
    }
    args.shift();
  }

  var stack = this.stack;
  args.forEach(function (arg) {
    stack.push({type: type, handle: arg});
  });

  return this;
};

/**
 * Handle all middlewares of the provided
 * type.
 *
 * @param {String} [type] the middleware type to handle
 * @param {*} ctx ctx object
 * @param {Function} [out] optional function to be called once
 *   all middleware have been handled
 * @returns {Object} the middist instance
 */

proto.handle = function (type, ctx, out) {
  if (typeof type !== 'string' && !Array.isArray(type)) {
    out = ctx;
    ctx = type;
    type = null;
  }

  ctx = ctx || {};
  var stack = this.stack;
  var index = 0;
  var ended = false;
  var callbacks = [];
  var fn;

  ctx.end = end;

  // Handle next middleware in stack.
  function next(err, cb) {
    if (typeof err === 'function') {
      debug('pushed filter callback');
      cb = err;
      err = null;
    }
    if (typeof cb === "function") callbacks.push(cb);

    debug('call middleware index', index);
    var layer = stack[index++];

    // No more middlewares or early end.
    if (!layer || ended) {
      debug('middleware-s call done');
      fn = callbacks.pop();
      while (fn) {
        err = fn(err, ctx);
        if (err) break;
        fn = callbacks.pop();
      }
      if (out) return out(err, ctx);
      if (err) throw err;
      return;
    }

    // Check if middleware type matches or if it has no type.
    if (layer.type.length > 0 && layer.type.indexOf(type) < 0) {
      return next(err);
    }

    try {
      var arity = layer.handle.length;
      //if err, only execute error middlewares
      if (err) {
        //error middlewares have an arity of 3, the first
        //arg being the error
        if (arity === 3) {
          layer.handle(err, ctx, next);
        } else {
          next(err);
        }
      } else if (arity < 2) {
        layer.handle(ctx);
        if (!ended) next();
      } else if (arity < 3) {
        layer.handle(ctx, next);
      } else {
        next();
      }
    }
    catch (e) {
      next(e);
    }
  }

  // Stop middlewares execution.
  function end() {
    ended = true;
    ctx.handled = true;
    next();
  }

  // Start handling.
  next();

  return this;
};
