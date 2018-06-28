'use strict'

const fs = require('fs')
const status_type = require('bob-status')

module.exports = FileSource

function FileSource(path, options) {
  if (!(this instanceof FileSource)) {
    return new FileSource(path, options)
  }

  if (options !== undefined && typeof options !== 'object') {
    throw new TypeError(`options MUST be an Object, found ${typeof options}`)
  }

  options = copyObject(options)

  if (path !== undefined && typeof path !== 'string') {
    throw new TypeError(`path MUST be a String, found ${typeof path}`)
  }

  this.path = path

  this.fd = options.fd === undefined ? null : options.fd;
  this.flags = options.flags === undefined ? 'r' : options.flags;
  this.mode = options.mode === undefined ? 0o666 : options.mode;

  this.pos = 0;

  if (options.start !== undefined) {
    if (typeof options.start !== 'number') {
      throw new TypeError(`options.start MUST be a Number, found ${typeof options.start}`)
    }
    if (options.end === undefined) {
      options.end = Infinity;
    } else if (typeof options.end !== 'number') {
      throw new TypeError(`options.end MUST be a Number or undefined, found ${typeof options.end}`)
    }

    if (options.start > options.end) {
      const errVal = `{start: ${options.start}, end: ${options.end}}`;
      throw new RangeError(`start must be greater than end, found ${errVal}`)
    }

    this.pos = options.start !== undefined ? options.start : 0;
  }

  // XXX(Fishrock123):
  // streams3 opens the FD here, but I think error handling might be better if
  // it is opened during pull flow.
  //
  // That has some disadvantages, namely around telling when to actually open
  // the file, but also the delayment of error until after stream construction.
  //
  // if (typeof this.fd !== 'number')
  //   this.open()
}

FileSource.prototype.bindSink = function bindSink (sink) {
  this.sink = sink
}

FileSource.prototype.sendError = function sendError (error) {
  this.sink.next(status_type.error, error, Buffer.alloc(0), 0)
}

FileSource.prototype.pull = function pull (error, buffer) {
  if (error) {
    if (typeof this.fd === 'number') {
      fs.close(this.fd, (closeError) => {
        this.fd = null
        this.sendError(closeError || error)
      })
    } else {
      return this.sendError(error)
    }
  }

  if (typeof this.fd !== 'number') {
    fs.open(this.path, this.flags, this.mode, (error, fd) => {
      if (error) {
        return this.sendError(error)
      }

      this.fd = fd

      this.readFromFile(buffer)
    })
  } else {
    this.readFromFile(buffer)
  }
}

FileSource.prototype.readFromFile = function readFromFile (buffer) {
  if (typeof this.fd !== 'number') {
    return this.pull(null, buffer)
  }

  fs.read(this.fd, buffer, 0, buffer.length, this.pos, (error, bytesRead) => {
    if (error) {
      fs.close(this.fd, (closeError) => {
        this.fd = null
        this.sendError(closeError || error)
      })
    } else {
      if (bytesRead > 0) {
        this.pos += bytesRead;
        this.sink.next(status_type.continue, null, buffer, bytesRead)
      } else {
        fs.close(this.fd, (closeError) => {
          this.fd = null
          if (closeError) {
            this.sendError(closeError)
          } else {
            this.sink.next(status_type.end, null, buffer, 0)
          }
        })
      }
    }
  })
}

/* ## Helpers ## */

function copyObject(source) {
  var target = {};
  for (var key in source)
    target[key] = source[key];
  return target;
}
