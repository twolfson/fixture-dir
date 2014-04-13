var fs = require('fs');
var expect = require('chai').expect;
var rimraf = require('rimraf');
var FixtureDir = require('../');

function cleanupFixtureDir() {
  after(function (done) {
    this.dir.destroy(done);
    delete this.dir;
  });
}

var fsUtils = {
  mkdir: function (dirpath) {
    before(function (done) {
      fs.mkdir(dirpath, done);
    });
  },
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
  },
  writeFile: function (filepath, content) {
    before(function (done) {
      fs.writeFile(filepath, content, done);
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
        delete this.dir;
      });
      fsUtils.readdir('/tmp/fixture-dir-tests');

      it('no longer exists', function () {
        expect(this.files).to.have.length(0);
      });
    });
  });

  describe('of a named folder', function () {
    before(function (done) {
      var that = this;
      fixtureDir.mkdir({folderName: 'named'}, function (err, dir) {
        that.dir = dir;
        done(err);
      });
    });
    fsUtils.readdir('/tmp/fixture-dir-tests');
    cleanupFixtureDir();

    it('creates a directory under that name', function () {
      expect(this.files).to.deep.equal(['named']);
    });
  });

  describe('copying another folder', function () {
    before(function (done) {
      var that = this;
      fixtureDir.mkdir({
        copyFrom: __dirname + '/test-files/copy',
        folderName: 'copied'
      }, function (err, dir) {
        that.dir = dir;
        done(err);
      });
    });
    fsUtils.readdir('/tmp/fixture-dir-tests/copied');

    it('creates a directory with the same contents', function () {
      expect(this.files).to.deep.equal(['hai.txt']);
    });

    describe('when destroyed', function () {
      before(function (done) {
        this.dir.destroy(done);
        delete this.dir;
      });
      fsUtils.readdir('/tmp/fixture-dir-tests');

      it('no longer exists', function () {
        expect(this.files).to.not.contain('copied');
      });
    });
  });

  describe('of a named folder that already exists and has contents (e.g. bad test/no cleanup)', function () {
    // Generate our named folder and content
    fsUtils.mkdir('/tmp/fixture-dir-tests/existing');
    fsUtils.writeFile('/tmp/fixture-dir-tests/existing/hello.txt', 'world');

    // Assert the file was created for sanity
    fsUtils.readdir('/tmp/fixture-dir-tests/existing');
    before(function () {
      expect(this.files).to.deep.equal(['hello.txt']);
    });

    // Generate our fixture dir
    before(function (done) {
      var that = this;
      fixtureDir.mkdir({
        folderName: 'existing'
      }, function (err, dir) {
        that.dir = dir;
        done(err);
      });
    });
    fsUtils.readdir('/tmp/fixture-dir-tests/existing');
    cleanupFixtureDir();

    it('cleans out the directory', function () {
      expect(this.files).to.have.length(0);
    });

    it('creates a directory under that name', function () {
      // Proved by reading the directory
    });
  });
});
