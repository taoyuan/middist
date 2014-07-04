"use strict";

var middist = require('../lib/middist');
var t = require('chai').assert;

describe('app, middleware manager', function () {
    var app, data;
    beforeEach(function () {
        app = middist();
        data = {};
    });

    it('should be instantiated', function () {
        t.ok(app.use);
        t.ok(app.handle);
    });

    describe('#use', function() {
        it('should add middleware to use', function () {
            var self = app
                .use(testMiddleWare)
                .use(errorMiddleWare);
            t.equal(self, app);
        });

        it('should add multiple type at once', function () {
            var self = app
                .use(['firstType', 'secondType'], testMiddleWare);
            t.equal(self, app);
        });

        it('should add multiple middlewares at once', function () {
            var self = app
                .use(testMiddleWare, errorMiddleWare);
            t.equal(self, app);
        });

        it('should add multiple middlewares at once and a type', function () {
            var self = app
                .use('test', testMiddleWare, errorMiddleWare);
            t.equal(self, app);
        });
    });

    describe('#handle', function() {
        it('should handle middlewares with no type', function () {
            app
                .use(transformMiddleware)
                .handle('all', data, function (err, data) {
                    t.equal(data.test, 'test');
                });
        });

        it('should handle all middlewares of a type', function () {
            app
                .use('test', testMiddleWare)
                .use('test', testMiddleWare)
                .handle('test', {}, function (err, data) {
                    t.notOk(err);
                });
        });

        it('should handle modifing the response', function () {
            app
                .use('test', transformMiddleware)
                .handle('test', data, function(err, data) {
                    t.equal(data.test, 'test');
                });
        });

        it('should handle errors in middlewares', function () {
            app
                .use('test', errorMiddleWare)
                .handle('test', {}, function (err, data) {
                    t.equal(err, 'oh no !');
                });
        });

        it('should handle exceptions', function() {
            app
                .use(exceptionMiddleware)
                .handle('all', data, function(err, data) {
                    t.equal(err, 'oups !');
                });
        });

        it('should handle multiple middlewares', function() {
            app
                .use(incMiddleware)
                .use(incMiddleware)
                .use(incMiddleware)
                .handle('', data, function(err, data) {
                    t.equal(data.count, 3);
                });
        });

        it('should end middleware execution', function () {
            app
                .use(endMiddleware)
                .use(transformMiddleware)
                .handle('', data, function(err, data) {
                    t.notOk(data.test);
                });
        });

        it('should handle multiple handling calls', function() {
            app
                .use(incMiddleware)
                .handle('', data);
            app
                .handle('', data, function(err, data) {
                    t.equal(data.count, 2);
                });
        });

        it('should handle registering multiple types at once', function() {
            app
                .use(['test', 'test2'], incMiddleware)
                .handle('test', data);
            app
                .handle('test2', data, function(err, data) {
                    t.equal(data.count, 2);
                });
        });

        it('should handle registering multiple middlewares at once', function() {
            app
                .use('test', incMiddleware, incMiddleware)
                .handle('test', data, function(err, data) {
                    t.equal(data.count, 2);
                });
        });

        it('should call only error middlewares when an error occured', function() {
            app
                .use('test', exceptionMiddleware)
                .use('test', errorHandlingMiddleware)
                .use('test', transformMiddleware)
                .handle('test', data, function(err, data) {
                    t.equal(err, 'error handled');
                    t.notOk(data.test);
                });
        });

        it('should not call error middlewares when no error', function () {
            app
                .use('test', transformMiddleware)
                .use('test', errorHandlingMiddleware)
                .handle('test', data, function(err, data) {
                    t.notOk(err);
                });
        });

        it('should call all error middlewares error once an error occured', function () {
            app
                .use('test', exceptionMiddleware)
                .use('test', errorHandlingMiddleware)
                .use('test', anotherErrorHandlingMiddleware)
                .handle('test', data, function(err, data) {
                    t.equal(err, 'error also handled');
                });
        });

        it('should resume normal middleware execution if error handler ignores error', function () {
            app
                .use('test', exceptionMiddleware)
                .use('test', ignoreErrorHandler)
                .use('test', transformMiddleware)
                .handle('test', data, function(err, data) {
                    t.notOk(err);
                    t.equal(data.test, 'test');
                });
        });

        it('should only execute middlewares with the exact handling type', function() {
            app
                .use('test', incMiddleware)
                .use('testSomethingElse', incMiddleware)
                .handle('test', data, function(err,data) {
                    t.equal(data.count, 1);
                });
        });
    });
});

function testMiddleWare(data, next) {
    next();
}

function endMiddleware(data, next) {
    data.end();
}

function incMiddleware(data, next) {
    if (!data.count) data.count = 0;
    data.count++;
    next();
}

function transformMiddleware(data, next) {
    data.test = 'test';
    next();
}

function exceptionMiddleware(data, next) {
    throw 'oups !';
}

function errorMiddleWare(data, next) {
    next('oh no !');
}

function errorHandlingMiddleware(err, data, next) {
    next('error handled');
}

function anotherErrorHandlingMiddleware(err, data, next) {
    next('error also handled');
}

function ignoreErrorHandler(err, data, next) {
    next();
}