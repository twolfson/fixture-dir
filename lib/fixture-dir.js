// TODO: Update description to 'Create/copy folder to temporary working directory'

function FixtureDir(folderName) {
  assert(folderName, '`FixtureDir` requires a `folderName` for its constructor. This is used as a namespace in `tmp`');
  this.folderName = folderName;
}
FixtureDir.prototype = {
  enter: function (options) {
    // If we are already in a directory, complain
    if (this.previousDirectory) {
      throw new Error('`FixtureDir#enter` cannot enter multiple directories at the same time. Please run `FixtureDir#exit` first');
    }

    // Fallback options
    options = options || {};

    //
    var dir = path.join(this.folderName, options.folderName);

    // TODO: Save `previousDirectory`

    // TODO: rm folder if it exists
    // If there is a copyFrom, use `wrench.copy`
    // Otherwise, wrench.mkdirp

    // Move to the new directory
  },
  exit: function () {
    // TODO: rm folder
    // TODO: Reset previous directory
  }
};

// TODO: Make complementary mocha wrapper which receives `fixture-dir` and does enter/exit automagically

module.exports = FixtureDir;
