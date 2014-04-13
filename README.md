# fixture-dir [![Build status](https://travis-ci.org/twolfson/fixture-dir.png?branch=master)](https://travis-ci.org/twolfson/fixture-dir)

Create/copy directory to temporary directory

This was built for quickly setting up/tearing down directories that originate from tests but should not contaminate the repo. Previous to this repo's creation, I have used this pattern in [foundry-release-git][] and [sexy-bash-prompt][].

[foundry-release-git]: https://github.com/twolfson/foundry-release-git/blob/1.0.1/test/utils/fixtures.js
[sexy-bash-prompt]: https://github.com/twolfson/sexy-bash-prompt/blob/0.21.0/test/prompt_test.sh#L8-L19

A mocha flavor, [mocha-fixture-dir][], is available for automatic directory cleanup.

[mocha-fixture-dir]: https://github.com/twolfson/mocha-fixture-dir

## Getting Started
Install the module with: `npm install fixture-dir`

```javascript
// Generate a tmp namespace for our tests
var exec = require('child_process').exec;
var FixtureDir = require('fixture-dir');
var fixtureDir = new FixtureDir('my-node-module-tests');

// Inside of our tests, copy over folder contents and interact with them
before(function () {
  // Create a `git-log` folder with the contents of our `git-log` fixture
  var that = this;
  fixtureDir.mkdir({
    folderName: 'git-log',
    copyFrom: __dirname + '/test-files/git-log' // Folder with `.git` activity
  }, function (err, dir) {
    // Save the directory for cleanup and callback
    that.dir = dir;
    done();
  });
});
before(function (done) {
  // Run `git log` in our directory (/tmp/my-node-module-tests/git-log)
  exec('git log', {cwd: this.dir.path}, function (err, stdout, stderr) {
    // Save our stdout and callback
    this.stdout = stdout;
    done(err);
  });
});
after(function (done) {
  // Cleanup our directory
  this.dir.destroy(done);
  delete this.done;
});

it('retrieved `git log` in our fixture directory', function () {
  assert(this.stdout);
});
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## Unlicense
As of Apr 12 2014, Todd Wolfson has released this repository and its contents to the public domain.

It has been released under the [UNLICENSE][].

[UNLICENSE]: UNLICENSE
