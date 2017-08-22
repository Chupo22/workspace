const should = require('should');
const helpers = require('../helpers');
const RcFileDSL = require('../lib/dsl/rc-file');

const { trimForBash } = helpers;

describe('rc-file', function() {
  beforeEach(function() {
    should.use(assertions);
  });

  it('should build rc file', function() {
    const fn = rc => {
      rc.alias('first', 'echo 123');
      rc.alias('second', 'echo 321');
    };

    should(fn).build(`
      alias first="echo 123"
      alias second="echo 321"
    `);
  });

  it('should build task in group', function() {
    const fn = rc => rc.group('groupName', g =>
      g.task('task', t => t.command('echo 123')));

    should(fn).build('alias groupNameTask="echo 123"');
  });
});

function assertions(should, Assertion) {
  Assertion.add('build', function(expected) {
    const fn = this.obj;
    const dsl = new RcFileDSL();

    fn(dsl);

    const assertion = dsl.toString();

    should(assertion).eql(trimForBash(expected));
  });
}
