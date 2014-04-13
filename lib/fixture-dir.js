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
  mkdir: function (options, cb) {
    // Fallback options
    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    // Define a folder name (with tmp-generated fallback)
    var dirpath;
    var that = this;
    async.series([
      function getDirpath (next) {
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

module.exports = FixtureDir;
