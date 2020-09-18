"use strict";

const isStream = (stream) =>
  stream !== null &&
  typeof stream === "object" &&
  typeof stream.pipe === "function";

isStream.writable = (stream) =>
  isStream(stream) &&
  stream.writable !== false &&
  typeof stream._write === "function" &&
  typeof stream._writableState === "object";

isStream.readable = (stream) =>
  isStream(stream) &&
  stream.readable !== false &&
  typeof stream._read === "function" &&
  typeof stream._readableState === "object";

module.exports = isStream;
