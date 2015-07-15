"use strict";

/**
 * Instantiate middist.
 */

var proto = require('./proto');

var middist = module.exports = function create() {
    var app = function (data, next) {
        app.handle(data, next);
    };
    merge(app, proto);
    app.stack = [];
    for (var i = 0; i < arguments.length; ++i) {
        app.use(arguments[i]);
    }
    return app;
};

middist.handle = function handle(stack, args, done) {

    if (typeof args === 'function') {
        done = args;
        args = [];
    }
    done = done || function () {};

    var fullArgs = args.slice();
    fullArgs.push(next);

    var idx = 0, fn, ended;

    function next(err) {
        if (ended) return;
        if (err) {
            ended = true;
            return done(err);
        }

        fn = stack[idx++];

        if (!fn) {
            ended = true;
            return done();
        }

        try {
            var arity = fn.length;
            if (arity > args.length) {
                fn.apply(undefined, fullArgs);
            } else {
                fn.apply(undefined, args);
                next();
            }
        } catch (e) {
            next(e);
        }
    }

    next();
};

function merge(a, b) {
    if (a && b) {
        for (var key in b) {
            a[key] = b[key];
        }
    }
    return a;
}

function call(fn, args, done) {

}