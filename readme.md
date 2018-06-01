# FS Source (BOB)

A file system source for the [BOB](https://github.com/Fishrock123/bob) streaming protocol.

## Usage

```
const FileSource = require('fs-source')
new FileSource(path, options)
```

Implements a [BOB source](https://github.com/Fishrock123/bob/blob/master/reference-source.js) from files.

### Example

```
const FileSource = require('fs-source')

const source = new FileSource('my-file')
const sink = new MyBOBSink()

sink.bindSource(source, error => {
  if (error)
    console.error('Stream returned error ->', error.stack)
  else {
    console.log('ok')
  }
})
```

See [test-basic](test/test-basic) for a good working example.

## License

[MIT Licensed](license) — _[Contributions via DCO 1.1](contributing.md#developers-certificate-of-origin)_
