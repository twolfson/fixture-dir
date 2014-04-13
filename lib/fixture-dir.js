var wrench = require('wrench');
var tmp = require('tmp');

// TODO: Update description to 'Create/copy folder to temporary working directory'

function FixtureDir(folderName) {
  assert(folderName, '`FixtureDir` requires a `folderName` for its constructor. This is used as a namespace in `tmp`');
  this.folderName = folderName;
}
FixtureDir.prototype = {
  mkdir: function (options, cb) {
    // Fallback options
    options = options || {};

    // If we are already in a directory (and we are not being wreckless), complain
    if (this.currentDirectory && !options.ignoreDirectoryCleanup) {
      throw new Error('`FixtureDir#mkdir` cannot create multiple directories at the same time. Please run `FixtureDir#exit` first');
    }

    // Define a folder name (with tmp-generated fallback)
    var dirpath = path.join(tmp.tmpdir, this.folderName, options.folderName);
    if (!options.folderName) {
      dirpath = tmp.tmpName({prefix: this.folderName});
    }

    // Mark that we are using a directory
    this.currentDirectory = dirpath;

    // Remove the existing folder
    wrench.rmdirRecursive(dirpath, function handleRm (err) {
      // If there was an error, callback with it
      // TODO: Will this error our when we the directory exists
      if (err) {
        return cb(err);
      }

      // If there is a folder to copy from, copy it into our location
      if (options.copyFrom) {
        wrench.copyDirRecursive(dirpath, handleFolderCreation);
      // Otherwise, create the folder
      } else {
        wrench.mkdirRecursive(dirpath, handleFolderCreation);
      }

      // Define a method to handle folder creation
      function handleFolderCreation (err) {
        // If there was an error, callback with it
        if (err) {
          return cb(err);
        }

        // Callback with the directory path
        cb(null, dirpath);
      }
    });
  },
  destroy: function (cb) {
    // Remove the folder
  }
};

// TODO: Make complementary mocha wrapper which receives `fixture-dir` and does mkdir/exit automagically

module.exports = FixtureDir;
