const assert = require("assert");
const makePromise = require("../../../src/file/make-promise");

function Context() {
  Object.defineProperties(this, {
    testArg: {
      value: "test-arg",
    },
    nullErrFn: {
      get: () => (arg, cb) => {
        if (typeof arg === "function") {
          // assume no argument is expected
          return arg(null);
        }
        return cb(null, arg);
      },
    },
    errFn: {
      get: () => (err, cb) => cb(err, null),
    },
  });
}

const makePromiseTestSuite = {
  context: Context,
  "should create a promise": (ctx) => {
    const res = makePromise(ctx.nullErrFn);
    assert(res instanceof Promise);
    return res.catch(() => {});
  },
  "should resolve with undefined": (ctx) => {
    const promise = makePromise(ctx.nullErrFn);
    return promise.then((res) => {
      assert.equal(res, undefined);
    });
  },
  "should resolve with function result": (ctx) => {
    const promise = makePromise(ctx.nullErrFn, ctx.testArg);
    return promise.then((res) => {
      assert.equal(res, ctx.testArg);
    });
  },
  "should reject if not a function": () => {
    const notAFunction = "this is not a function";
    const res = makePromise(notAFunction);
    return res.then(
      () => {
        throw new Error("should have been rejected");
      },
      (err) => {
        assert(/function must be passed/.test(err.message));
      }
    );
  },
  "should resolve with supplied argument": (ctx) => {
    const testValue = "test-value";
    const promise = makePromise(ctx.nullErrFn, ctx.testArg, testValue);
    return promise.then((res) => {
      assert.equal(res, testValue);
    });
  },
  "should reject with error": (ctx) => {
    const testError = new Error("test-error");
    const res = makePromise(ctx.errFn, testError);
    return res.then(
      () => {
        throw new Error("expected to have been rejected");
      },
      (err) => {
        assert.equal(err, testError);
      }
    );
  },
  // test context
};

module.exports = makePromiseTestSuite;
