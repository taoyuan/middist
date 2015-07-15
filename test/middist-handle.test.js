"use strict";

var t = require('chai').assert;
var pd = require('plando');
var middist = require('../');


describe('middist/handle', function () {

    it('should handle function stack', function (done) {
        var answer = [];

        function plus(a, b) {
            answer.push(a + b);
        }

        function minus(a, b) {
            answer.push(a - b);
        }

        function multiply(a, b, cb) {
            answer.push(a * b);
            cb();
        }

        function divide(a, b, done) {
            if (!b) throw new Error('divide error');
            answer.push(a / b);
            done();
        }


        var p = pd.plan(2, done);
        middist.handle([plus, minus, multiply, divide], [10, 5], function (err) {
            t.notOk(err);
            t.deepEqual(answer, [10 + 5, 10 - 5, 10 * 5, 10 / 5]);
            p.check();
        });

        middist.handle([plus, minus, multiply, divide], [10, 0], function (err) {
            p.ok(err);
            p.check();
        });
    });
});