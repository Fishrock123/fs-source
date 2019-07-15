'use strict'

const FileSource = require('../index.js')
const { AssertionSink } = require('bob-streams')

const fileSource = new FileSource('./test/fixtures/file')
const assertionSink = new AssertionSink(
  [
    'Chunk one\ndata data\n\n',
    'Chunk two\ndata data\n\n',
    'Chunk three\ndata data\n',
    ''
  ],
  'utf8'
)

assertionSink.bindSource(fileSource).start(error => {
  if (error)
    console.error('Stream returned ->', error.stack)
  else {
    console.log('ok')
  }
})
