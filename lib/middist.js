"use strict";

/**
 * Instantiate middist.
 */

module.exports = Middist;

function Middist(parent) {
    if (!(this instanceof Middist)) return new Middist(parent);

    this.parent = parent;
    this.stack = [];
}

/**
 * Add a middleware in the stack for the given type.
 *
 * @param {String|Array} [type] the handler type where to use
 * the middleware. If not provided, middleware is always
 * used. Can be either a string or an array of string
 * @param {Function|?} handler
 * @returns {Object} the middist instance
 */
Middist.prototype.use = function (type, handler) {
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
    args.forEach(function(arg){
        stack.push({type: type, handle: arg});
    });

    return this;
};

/**
 * Handle all middlewares of the provided
 * type.
 *
 * @param {String} [type] the middleware type to handle
 * @param {Object} data data object
 * @param {Function} [out] optional function to be called once
 *   all middleware have been handled
 * @returns the middist instance
 */

Middist.prototype.handle = function (type, data, out) {
    if (typeof type !== 'string' && !Array.isArray(type)) {
        out = data;
        data = type;
        type = null;
    }

    var parent = this.parent;

    if (!out) out = function (err) {
        if (err && parent && parent.emit) {
            parent.emit('error', err);
        }
    };

    data = data || {};
    var stack = this.stack;
    var index = 0;
    var ended = false;
    var callbacks = [];
    var fn;

    data.end = end;

    // Handle next middleware in stack.
    function next(err, cb) {
        if (typeof err === 'function') {
            cb = err;
            err = null
        }
        if (typeof cb === "function") callbacks.push(cb);

        var layer = stack[index++];

        // No more middlewares or early end.
        if (!layer || ended) {
            while (fn = callbacks.pop()) {
                err = fn(err, data);
            }
            return out(err, data);
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
                    layer.handle(err, data, next);
                } else {
                    next(err);
                }
            } else if (arity < 2) {
                layer.handle(data);
                next();
            } else if (arity < 3) {
                layer.handle(data, next);
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
    }

    // Start handling.
    next();

    return this;
};