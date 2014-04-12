// TODO: Update description to 'Create/copy folder to temporary working directory'

function FixtureDir(dir) {
  this.dir = dir;
}
FixtureDir.prototype = {
  enter: function (folderName, options) {
    options = options || {};
    var dir = path.join(this.dir, folderName);
    // TODO: rm folder if it exists
    // If there is a copyFrom, use `wrench.copy`
    // Otherwise, wrench.mkdirp
  },
  exit: function (folderName) {
    // TODO: rm folder
  }
};

// TODO: Make complementary mocha wrapper which receives `fixture-dir` and does enter/exit automagically

module.exports = FixtureDir;
