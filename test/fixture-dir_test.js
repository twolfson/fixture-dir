var FixtureDir = require('../');

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

    it('creates a temporary directory in our namespace', function () {

    });

    describe('when destroyed', function () {
      it('no longer exists', function () {

      });
    });
  });

  describe('of a named folder', function () {
    it('creates a directory under that name', function () {

    });
  });

  describe('copying another folder', function () {
    it('creates a directory with the same contents', function () {

    });

    describe('when destroyed', function () {
      it('no longer exists', function () {

      });
    });
  });

  describe('of a named folder that already exists and has contents (e.g. bad test/no cleanup)', function () {
    it('cleans out the directory', function () {

    });

    it('creates a directory under that name', function () {

    });
  });
});
