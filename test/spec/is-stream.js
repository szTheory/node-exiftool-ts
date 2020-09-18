const fs = require("fs");
const assert = require("assert");
const Stream = require("stream");
const net = require("net");
const crypto = require("crypto");
const os = require("os");
const path = require("path");
const isStream = require("../../src/is-stream");

function tempFile() {
  const tempDir = fs.realpathSync(os.tmpdir());
  const fileName = crypto.randomBytes(32).toString("hex");

  return path.join(tempDir, fileName);
}

const isStreamTestSuite = {
  isStream: {
    "correctly identifies streams": () => {
      assert(isStream(new Stream.Stream()));
      assert(isStream(new Stream.Readable()));
      assert(isStream(new Stream.Writable()));
      assert(isStream(new Stream.Duplex()));
      assert(isStream(new Stream.Transform()));
      assert(isStream(new Stream.PassThrough()));
      assert(isStream(fs.createReadStream(__filename)));
      assert(isStream(fs.createWriteStream(tempFile())));
      assert(isStream(new net.Socket()));

      assert(!isStream({}));
      assert(!isStream(null));
      assert(!isStream(undefined));
      assert(!isStream(""));
    },
  },
  writable: {
    "knows whether a stream is writable": () => {
      assert(isStream.writable(new Stream.Writable()));
      assert(isStream.writable(new Stream.Duplex()));
      assert(isStream.writable(new Stream.Transform()));
      assert(isStream.writable(new Stream.PassThrough()));
      assert(isStream.writable(fs.createWriteStream(tempFile())));

      assert(!isStream.writable(new Stream.Stream()));
      assert(!isStream.writable(new Stream.Readable()));
      assert(!isStream.writable(fs.createReadStream(__filename)));
    },
  },
  readable: {
    "knows whether a stream is readable": () => {
      assert(isStream.readable(new Stream.Readable()));
      assert(isStream.readable(new Stream.Duplex()));
      assert(isStream.readable(new Stream.Transform()));
      assert(isStream.readable(new Stream.PassThrough()));
      assert(isStream.readable(fs.createReadStream(__filename)));

      assert(!isStream.readable(new Stream.Stream()));
      assert(!isStream.readable(new Stream.Writable()));
      assert(!isStream.readable(fs.createWriteStream(tempFile())));
    },
  },
};

module.exports = isStreamTestSuite;
