"use strict";

var t = require('chai').assert;
var middist = require('../');


describe('router/middleware manager', function () {
  var router, data;

  beforeEach(function () {
    router = middist();
    data = {};
  });

  it('should be instantiated', function () {
    t.ok(router.use);
    t.ok(router.handle);
  });

  describe('#use', function () {
    it('should add middleware to use', function () {
      var that = router
        .use(testMiddleWare)
        .use(errorMiddleWare);
      t.equal(that, router);
    });

    it('should add multiple type at once', function () {
      var that = router
        .use(['firstType', 'secondType'], testMiddleWare);
      t.equal(that, router);
    });

    it('should add multiple middlewares at once', function () {
      var that = router
        .use(testMiddleWare, errorMiddleWare);
      t.equal(that, router);
    });

    it('should add multiple middlewares at once and a type', function () {
      var that = router
        .use('test', testMiddleWare, errorMiddleWare);
      t.equal(that, router);
    });
  });

  describe('#handle', function () {
    it('should handle middlewares with no type', function () {
      router
        .use(transformMiddleware)
        .handle('all', data, function (err, data) {
          t.equal(data.test, 'test');
        });
    });

    it('should handle all middlewares of a type', function () {
      router
        .use('test', testMiddleWare)
        .use('test', testMiddleWare)
        .handle('test', {}, function (err, data) {
          t.notOk(err);
        });
    });

    it('should handle modifing the response', function () {
      router
        .use('test', transformMiddleware)
        .handle('test', data, function (err, data) {
          t.equal(data.test, 'test');
        });
    });

    it('should handle errors in middlewares', function () {
      router
        .use('test', errorMiddleWare)
        .handle('test', {}, function (err, data) {
          t.equal(err, 'oh no !');
        });
    });

    it('should handle exceptions', function () {
      router
        .use(exceptionMiddleware)
        .handle('all', data, function (err, data) {
          t.equal(err, 'oups !');
        });
    });

    it('should handle multiple middlewares', function () {
      router
        .use(incMiddleware)
        .use(incMiddleware)
        .use(incMiddleware)
        .handle('', data, function (err, data) {
          t.equal(data.count, 3);
        });
    });

    it('should end middleware execution', function (done) {
      router
        .use(endMiddleware)
        .use(transformMiddleware)
        .handle('', data, function (err, data) {
          t.notOk(data.test);
          done();
        });
    });

    it('should handle multiple handling calls', function () {
      router
        .use(incMiddleware)
        .handle('', data);
      router
        .handle('', data, function (err, data) {
          t.equal(data.count, 2);
        });
    });

    it('should handle registering multiple types at once', function () {
      router
        .use(['test', 'test2'], incMiddleware)
        .handle('test', data);
      router
        .handle('test2', data, function (err, data) {
          t.equal(data.count, 2);
        });
    });

    it('should handle registering multiple middlewares at once', function () {
      router
        .use('test', incMiddleware, incMiddleware)
        .handle('test', data, function (err, data) {
          t.equal(data.count, 2);
        });
    });

    it('should call only error middlewares when an error occured', function () {
      router
        .use('test', exceptionMiddleware)
        .use('test', errorHandlingMiddleware)
        .use('test', transformMiddleware)
        .handle('test', data, function (err, data) {
          t.equal(err, 'error handled');
          t.notOk(data.test);
        });
    });

    it('should not call error middlewares when no error', function () {
      router
        .use('test', transformMiddleware)
        .use('test', errorHandlingMiddleware)
        .handle('test', data, function (err, data) {
          t.notOk(err);
        });
    });

    it('should call all error middlewares error once an error occured', function () {
      router
        .use('test', exceptionMiddleware)
        .use('test', errorHandlingMiddleware)
        .use('test', anotherErrorHandlingMiddleware)
        .handle('test', data, function (err, data) {
          t.equal(err, 'error also handled');
        });
    });

    it('should resume normal middleware execution if error handler ignores error', function () {
      router
        .use('test', exceptionMiddleware)
        .use('test', ignoreErrorHandler)
        .use('test', transformMiddleware)
        .handle('test', data, function (err, data) {
          t.notOk(err);
          t.equal(data.test, 'test');
        });
    });

    it('should only execute middlewares with the exact handling type', function () {
      router
        .use('test', incMiddleware)
        .use('testSomethingElse', incMiddleware)
        .handle('test', data, function (err, data) {
          t.equal(data.count, 1);
        });
    });

    it('should can use another middist', function (done) {
      router = middist();
      var anotherApp = middist();
      anotherApp.use(function (data) {
        data.foo = 'bar';
      });
      router.use(anotherApp);
      router.handle(data, function (err, data) {
        t.propertyVal(data, 'foo', 'bar');
        done();
      })
    });

    it('should throw error for unhandled error', function () {
      router = middist();
      router.use(function () {
        throw new Error('boom');
      });
      t.throws(router.handle.bind(router, data));
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