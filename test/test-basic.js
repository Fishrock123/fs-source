'use strict'

const tap = require('tap')

const FileSource = require('../index.js')
const { AssertionSink } = require('bob-streams')

tap.test('test file read', t => {
  t.plan(1)
  const fileSource = new FileSource('./test/fixtures/file')
  const sink = new AssertionSink(
    [
      'Chunk one\ndata data\n\n',
      'Chunk two\ndata data\n\n',
      'Chunk three\ndata data\n',
      ''
    ],
    'utf8'
  )

  sink.bindSource(fileSource).start(error => {
    t.error(error, 'Exit Callback received unexpected error')
    t.end()
  })
})
