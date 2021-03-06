/**
 * Create a promise from a function.
 * @param {function} fn Function to call
 * @param {any[]|any} [args] Array of arguments to use in call, or one argument, or none
 * @param {any} [resolveValue] Override function's return value with this
 * @returns {Promise<any>} A promise resolved on callback invocation w/out error,
 * and rejected on callback called w/ error.
 */
function makePromise(fn, args, resolveValue) {
  if (typeof fn !== "function") {
    return Promise.reject(new Error("function must be passed"));
  }
  return new Promise((resolve, reject) => {
    const cb = (err, res) => {
      if (err) return reject(err);
      return resolve(resolveValue || res);
    };
    const allArgs = [];
    if (Array.isArray(args)) {
      args.forEach((arg) => allArgs.push(arg));
    } else if (args) {
      allArgs.push(args);
    }
    allArgs.push(cb);
    fn.apply(fn.this, allArgs);
  });
}

module.exports = makePromise;
