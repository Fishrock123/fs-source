'use strict'

const { Buffer } = require('buffer')
const assert = require('assert').strict
const status_type = require('bob-status')

class AssertionSink {
  constructor (assertions_queue) {
    this.source = null
    this.bindCb = null

    this._queue_index = 0
    this._assertions_queue = assertions_queue
  }

  bindSource (source, bindCb) {
    this.source = source
    this.bindCb = bindCb

    this.source.bindSink(this)

    this.source.pull(null, Buffer.alloc(this._assertions_queue[this._queue_index].length))
  }

  next (status, error, buffer, bytes) {
    if (status === status_type.end) return
    if (error) return this.bindCb(error)

    assert.equal(this._assertions_queue[this._queue_index], buffer.slice(0, bytes).toString('utf8'), `assertion ${this._queue_index} failed, data:\n ${buffer.slice(0, bytes).toString('utf8')} - assertion:\n ${this._assertions_queue[this._queue_index]}`)

    this._queue_index++
    if (this._queue_index === this._assertions_queue.length) {
      return this.source.pull(null, Buffer.alloc(0))
    }

    this.source.pull(null, Buffer.alloc(this._assertions_queue[this._queue_index].length))
  }
}

module.exports = AssertionSink
