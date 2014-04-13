// Load in dependencies
var async = require('async');
var wrench = require('wrench');
var tmp = require('tmp');

// TODO: Update description to 'Create/copy folder to temporary working directory'

// Object that represents a directory we can interact with (and destroy)
function Directory(dirpath) {
  this.path = dirpath;
}
Directory.prototype = {
  destroy: function (cb) {
    // Remove the folder
    wrench.rmdirRecursive(this.path, cb);
  }
};

// Define FixtureDir constructor
function FixtureDir(folderName) {
  assert(folderName, '`FixtureDir` requires a `folderName` for its constructor. This is used as a namespace in `tmp`');
  this.folderName = folderName;
}
FixtureDir.prototype = {
  mkdir: function (options, cb) {
    // Fallback options
    options = options || {};

    // Define a folder name (with tmp-generated fallback)
    var dirpath = path.join(tmp.tmpdir, this.folderName, options.folderName);
    async.series([
      function getDirpath (next) {
        // If there was no folder name, generate a random one
        if (!options.folderName) {
          tmp.tmpName({prefix: this.folderName}, function handleTmpname (err, _dirpath) {
            // If there was an error, callback with it
            if (err) {
              return next(err);
            }

            // Otherwise, save the dirpath and continue
            dirpath = _dirpath;
            next();
          });
        // Otherwise, continue
        } else {
          next();
        }
      },
      function removeDirectory (next) {
        // Remove the existing folder
        // TODO: Will this error our when we the directory exists
        wrench.rmdirRecursive(dirpath, next);
      },
      function createDirectory (next) {
        // If there is a folder to copy from, copy it into our location
        if (options.copyFrom) {
          wrench.copyDirRecursive(dirpath, next);
        // Otherwise, create the folder
        } else {
          wrench.mkdirRecursive(dirpath, next);
        }
      }
    ], function handleError (err) {
      // If there was an error, callback with it
      if (err) {
        return cb(err);
      }

      // Callback with a directory object
      cb(null, new Directory(dirpath));
    });
  }
};

// TODO: Make complementary mocha wrapper which receives `fixture-dir` and does mkdir/exit automagically

module.exports = FixtureDir;
