'use strict'

const FileSource = require('../index.js')
const AssertionSink = require('./assertion-helper-sink')

const fileSource = new FileSource('./test/fixtures/file')
const assertionSink = new AssertionSink(
  [
    'Chunk two\ndata data\n\n',
    'Chunk two\ndata data\n\n',
    'Chunk two\ndata data\n\n'
  ],
  {
    offset: 'Chunk one\ndata data\n\n'.length
  }
)

assertionSink.bindSource(fileSource, error => {
  if (error)
    console.error('Stream returned ->', error.stack)
  else {
    console.log('ok')
  }
})
