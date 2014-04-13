var wrench = require('wrench');
var tmp = require('tmp');

// TODO: Update description to 'Create/copy folder to temporary working directory'

function FixtureDir(folderName) {
  assert(folderName, '`FixtureDir` requires a `folderName` for its constructor. This is used as a namespace in `tmp`');
  this.folderName = folderName;
}
FixtureDir.prototype = {
  enter: function (options, cb) {
    // Fallback options
    options = options || {};

    // If we are already in a directory (and we are not being wreckless), complain
    if (this.previousDirectory && !options.allowPreviousDirectory) {
      throw new Error('`FixtureDir#enter` cannot enter multiple directories at the same time. Please run `FixtureDir#exit` first');
    }

    // Define a folder name (with tmp-generated fallback)
    var dirpath = path.join(tmp.tmpdir, this.folderName, options.folderName);
    if (!options.folderName) {
      dirpath = tmp.tmpName({prefix: this.folderName});
    }

    // Save `previousDirectory`
    this.previousDirectory = process.cwd();

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

        // TODO: Should we be performing chdir?

        // Callback with the directory path
        cb(null, dirpath);
      }
    });
  },
  exit: function () {
    // TODO: rm folder
    // TODO: Reset previous directory
  }
};

// TODO: Make complementary mocha wrapper which receives `fixture-dir` and does enter/exit automagically

module.exports = FixtureDir;
