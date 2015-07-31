# middist

[![NPM version][npm-image]][npm-url] 
[![Build Status][travis-image]][travis-url] 
[![Dependency Status][daviddm-image]][daviddm-url]
[![Test Coverage][coveralls-image]][coveralls-url]

> A generic middleware manager, inspired by [Connect](https://github.com/senchalabs/connect) and [middlebot](https://github.com/yanhick/middlebot).

## Install

```sh
npm install middist --save
```

## Use

```js
  // Instantiate middist.
  var Router = require('middist');
  
  var router = Router();

  // Middleware example.
  var middleware = function(ctx, next) {
    // Do stuff here...
    next();

    // If there was an error call next with an error object.
    next('oups !');

    // Middlewares execution can be stop this way.
    ctx.end();
  }
  
  // Error middleware example, only called when a previous middleware
  //sent an error or throwed an exception
  var errorMiddleware = function(err, ctx, next) {
    //handle error...
    
    //calls following error middlewares
    next(err);
    
    //next can be called without err to ignore error and resume
    //normal middleware execution
    next();
  }

  // Register middleware to be called when ‘myMiddlewares’ is handled.
  router.use('myMiddlewares', middleware);

  // Middleware can be registered for mutiple types at once.
  router.use(['myMiddleWares, myOtherMiddlewares'], middleware);

  // Multiple middlewares can be registered at once.
  router.use('myMiddleWares', middleware, anotherMiddleware);

  // Context objects.
  var ctx = {};

  // Called once all middlewares are handled.
  var done = function (err, ctx) {
    if (err) console.log('error in one of the middleware');

    console.log('middleware executed correctly');
  }

  // Handle all middlewares registered for ‘myMiddleWares’ with req and res.
  router.handle('myMiddleWares', ctx, done);
```

## Test

```sh
npm test
```

## License

MIT

[npm-image]: https://badge.fury.io/js/middist.svg
[npm-url]: https://npmjs.org/package/middist
[travis-image]: https://travis-ci.org/taoyuan/middist.svg?style=shield
[travis-url]: https://travis-ci.org/taoyuan/middist
[daviddm-image]: https://david-dm.org/taoyuan/middist.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/taoyuan/middist
[coveralls-image]: https://coveralls.io/repos/taoyuan/middist/badge.svg
[coveralls-url]: https://coveralls.io/r/taoyuan/middist?branch=master
