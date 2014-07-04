# middist

[![Build Status](https://travis-ci.org/taoyuan/middist.svg?branch=master)](https://travis-ci.org/taoyuan/middist)
[![Dependency Status](https://david-dm.org/taoyuan/middist.svg?theme=shields.io)](https://david-dm.org/taoyuan/middist)
[![devDependency Status](https://david-dm.org/taoyuan/middist/dev-status.svg?theme=shields.io)](https://david-dm.org/taoyuan/middist#info=devDependencies)

A generic middleware manager, inspired by Connect and [middlebot](github.com/yanhick/middlebot).

## Install

```sh
npm install middist
```

## Use

```js
  // Instantiate middist.
  var app = require('middist')();

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
  app.use('myMiddlewares', middleware);

  // Middleware can be registered for mutiple types at once.
  app.use(['myMiddleWares, myOtherMiddlewares'], middleware);

  // Multiple middlewares can be registered at once.
  app.use('myMiddleWares', middleware, anotherMiddleware);

  // Context objects.
  var ctx = {};

  // Called once all middlewares are handled.
  var done = function (err, ctx) {
    if (err) console.log('error in one of the middleware');

    console.log('middleware executed correctly');
  }

  // Handle all middlewares registered for ‘myMiddleWares’ with req and res.
  app.handle('myMiddleWares', ctx, done);
```

## Test

```sh
npm test
```

## License

MIT
