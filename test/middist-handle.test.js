"use strict";

var t = require('chai').assert;
var pd = require('plando');
var middist = require('../');


describe('middist/handle', function () {

    function plus(args, result) {
        var answer = 0;
        args.forEach(function (arg) {
            answer += arg;
        });
        result.push(answer);
    }

    function minus(args, result) {
        var answer = args.shift();
        args.forEach(function (arg) {
            answer -= arg;
        });
        result.push(answer);
    }

    function multiply(args, result, done) {
        var answer = 1;
        args.forEach(function (arg) {
            answer *= arg;
        });
        result.push(answer);
        process.nextTick(done);
    }

    function divide(args, result, done) {
        var answer = args.shift();
        args.forEach(function (arg) {
            if (!arg) throw new Error('divide error');
            answer /= arg;
        });
        result.push(answer);
        process.nextTick(done);
    }

    var handle = middist.build(function (operator, data, next) {
        data.result = data.result || [];
        if (operator.length > 2) {
            operator(data.args.slice(), data.result, next);
        } else {
            operator(data.args.slice(), data.result);
            next();
        }
    });

    it('should handle function stack', function (done) {

        var p = pd.plan(2, done);

        var operators = [plus, minus, multiply, divide];


        var data = {
            args: [10, 5]
        };
        handle(operators, data, function (err) {
            t.notOk(err);
            t.deepEqual(data.result, [10 + 5, 10 - 5, 10 * 5, 10 / 5]);
            p.check();
        });

        var data2 = {
            args: [10, 0]
        };
        handle(operators, data2, function (err) {
            p.ok(err);
            p.check();
        });
    });
});