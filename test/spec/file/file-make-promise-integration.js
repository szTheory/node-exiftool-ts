"use strict";

const assert = require("assert");
const createWritable = require("../../../src/file/create-writable");
const erase = require("../../../src/file/erase");
const fs = require("fs");
const makePromise = require("../../../src/file/make-promise");
const Stats = fs.Stats;
const Catchment = require("catchment");
const lockfile = require("lockfile");
const path = require("path");

// const filepath = path.join(__dirname, "/fixtures/some-file.lock");

const IntegrationTestSuite = {
  "should be able to unlock a file": () => {
    let filepath;
    let writeStream;
    return createWritable()
      .then((ws) => {
        writeStream = ws;
        assert(writeStream.writable);
        filepath = writeStream.path;
        return makePromise(fs.stat, filepath);
      })
      .then(() => {
        return makePromise(lockfile.unlock, filepath);
      })
      .then(() => {
        assert(writeStream.writable); // stream not closed
        return makePromise(fs.stat, filepath);
      })
      .then(
        () => {
          throw new Error("should have been rejected");
        },
        (err) => {
          assert(err instanceof Error);
          // console.log(Date.now(), 'no file')
          assert(/ENOENT: no such file or directory, stat/.test(err.message));
          return makePromise(writeStream.end.bind(writeStream));
        }
      )
      .then(() => {
        // console.log(Date.now(), 'write stream closed')
        assert(!writeStream.writable);
      });
  },
  "should write to a file stream": () => {
    const testData = "some-test-data";
    let catchmentPromise;
    let writeStream;
    return createWritable()
      .then((ws) => {
        writeStream = ws;
        return makePromise(ws.write.bind(ws), testData, ws);
      })
      .then(() => {
        // read file
        return new Promise((resolve, reject) => {
          const rs = fs.createReadStream(writeStream.path);
          rs.once("open", () => resolve(rs));
          rs.once("error", reject);
        })
          .then((rs) => {
            const catchment = new Catchment();
            rs.pipe(catchment);
            catchmentPromise = catchment.promise;
            return makePromise(writeStream.end.bind(writeStream));
          })
          .then(() => catchmentPromise)
          .then((res) => {
            assert.equal(res, testData);
          });
      });
  },
  "should unlink a file": () => {
    let file;
    return createWritable()
      .then((ws) => {
        file = ws.path;
        return new Promise((resolve, reject) => {
          ws.once("close", resolve);
          ws.once("error", reject);
          ws.close();
        });
      })
      .then(() => {
        const promise = makePromise(fs.unlink, file, file);
        return promise;
      });
  },
  "should end stream": () => {
    return createWritable()
      .then((ws) => {
        const promise = makePromise(ws.end.bind(ws), null, ws);
        return promise;
      })
      .then((ws) => {
        assert(!ws.writable);
      });
  },
  "should read stats": () => {
    return createWritable()
      .then((ws) => {
        assert(ws.writable);
        const promise = makePromise(fs.stat, ws.path).then((res) => {
          assert(res instanceof Stats);
          return ws;
        });
        return promise;
      })
      .then((ws) => {
        return erase(ws);
      });
  },
  "should not read stats of non-existent file": () => {
    return createWritable()
      .then((ws) => {
        return erase(ws).then(() => ws);
      })
      .then((ws) => {
        assert(!ws.writable);
        const promise = makePromise(fs.stat, ws.path);
        return promise;
      })
      .then(
        () => {
          throw new Error("should have been rejected");
        },
        (err) => {
          assert(err instanceof Error);
          assert(/ENOENT: no such file or directory, stat/.test(err.message));
        }
      );
  },
};

module.exports = IntegrationTestSuite;
