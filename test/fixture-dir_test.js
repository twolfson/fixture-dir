var fs = require('fs');
var expect = require('chai').expect;
var rimraf = require('rimraf');
var FixtureDir = require('../');

var fsUtils = {
  readdir: function (dirpath) {
    before(function (done) {
      var that = this;
      fs.readdir(dirpath, function (err, files) {
        that.files = files;
        done(err);
      });
    });
    after(function () {
      delete this.files;
    });
  }
};

// Clean up tmp directory
before(function (done) {
  rimraf('/tmp/fixture-dir-tests', done);
});

describe('A FixtureDir', function () {
  var fixtureDir = new FixtureDir('fixture-dir-tests');

  describe('of a nameless folder', function () {
    before(function (done) {
      var that = this;
      fixtureDir.mkdir(function (err, dir) {
        that.dir = dir;
        done(err);
      });
    });
    fsUtils.readdir('/tmp/fixture-dir-tests');

    it('creates a temporary directory in our namespace', function () {
      expect(this.files).to.have.length(1);
    });

    describe('when destroyed', function () {
      before(function (done) {
        this.dir.destroy(done);
      });
      fsUtils.readdir('/tmp/fixture-dir-tests');

      it('no longer exists', function () {
        expect(this.files).to.have.length(0);
      });
    });
  });

  describe.skip('of a named folder', function () {
    it('creates a directory under that name', function () {

    });
  });

  describe.skip('copying another folder', function () {
    it('creates a directory with the same contents', function () {

    });

    describe('when destroyed', function () {
      it('no longer exists', function () {

      });
    });
  });

  describe.skip('of a named folder that already exists and has contents (e.g. bad test/no cleanup)', function () {
    it('cleans out the directory', function () {

    });

    it('creates a directory under that name', function () {

    });
  });
});
