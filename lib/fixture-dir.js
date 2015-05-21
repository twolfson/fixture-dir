// Load in dependencies
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var async = require('async');
var wrench = require('wrench');
var mkdirp = require('mkdirp');
var tmp = require('tmp');

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
  firstRun: true,
  mkdir: function (options, cb) {
    // Fallback options
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    // Define a folder name (with tmp-generated fallback)
    var folderPath = path.join(tmp.tmpdir, that.folderName);
    var dirpath;
    var that = this;
    async.series([
      function claimTmpFolder (next) {
        // If this is not the first run, continue
        if (!that.firstRun) {
          return next();
        }

        // Grab our folder statistics
        fs.stat(folderPath, function handleStats (err, stats) {
          // If the folder does not exist exist, create it
          if (err && err.code === 'ENOENT') {
            return mkdirp(folderPath, next);
          }

          // Otherwise, continue
          next(err);
        });
      },
      function assertPermissions (next) {
        // If this is not the first run, continue
        if (!that.firstRun) {
          return next();
        }

        // Grab our folder statistics
        // DEV: We make this request again to make sure that if there was a mkdirp, it used the proper permissions
        fs.stat(folderPath, function handleStats (err, stats) {
          // If there was an error, then callback with it
          if (err) {
            return next(err);
          }

          // If we don't own the folder, then complain and leave
          if (process.getuid() !== stats.uid) {
            return next(new Error('Folder requested for `fixture-dir` is not owned by user. ' +
              'Please remove or adjust user ownership before running `fixture-dir` for "' + folderPath + '"'));
          }

          // If the permissions are incorrect, then adjust them
          // https://github.com/substack/node-mkdirp/blob/0.5.1/index.js#L20
          // https://github.com/twolfson/fixture-dir/issues/1
          //   e.g. `stats.mode & 0777`: 100644 & 0777 -> 0644
          // DEV: We don't worry about subfolders because they are deleted every time
          var actualMode = stats.mode & 0777;
          var desiredMode = 0777 & (~process.umask());
          if (actualMode !== desiredMode) {
            return fs.chmod(folderPath, desiredMode, next);
          }

          // Otherwise, continue
          next();
        });
      },
      function getDirpath (next) {
        // Mark the first run as completed
        that.firstRun = false;

        // If there is a folder name, use it
        if (options.folderName) {
          dirpath = path.join(tmp.tmpdir, that.folderName, options.folderName);
          next();
        // Otherwise, generate a random one
        } else {
          tmp.tmpName({prefix: path.join(that.folderName, '/')}, function handleTmpname (err, _dirpath) {
            // If there was an error, callback with it
            if (err) {
              return next(err);
            }

            // Otherwise, save the dirpath and continue
            dirpath = _dirpath;
            next();
          });
        }
      },
      function removeDirectory (next) {
        // Determine if the folder currently exists
        fs.exists(dirpath, function handleExists (exists) {
          // If it does, clean it up
          if (exists) {
            wrench.rmdirRecursive(dirpath, next);
          // Otherwise, continue
          } else {
            next();
          }
        });
      },
      function createDirectory (next) {
        // If there is a folder to copy from, copy it into our location
        if (options.copyFrom) {
          wrench.copyDirRecursive(options.copyFrom, dirpath, next);
        // Otherwise, create the folder
        } else {
          mkdirp(dirpath, next);
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

// Expose Directory and FixtureDir
FixtureDir.Directory = Directory;
module.exports = FixtureDir;
