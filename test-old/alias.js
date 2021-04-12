const _ = require('lodash');
const should = require('should');
const { Alias } = require('../dist');
const rcFile = require('../dist/rc-file');

const { isArray } = _;
const { build } = rcFile;

describe('alias', function () {
  beforeEach(function () {
    should.use(assertions);
  });

  it('should generate alias', function () {
    should({ name: 'testAlias', command: 'echo 123' }).alias(
      'alias testAlias="echo 123"',
    );
  });

  it('should join name', function () {
    should({ name: ['test', 'alias'], command: 'echo 123' }).alias(
      'alias testAlias="echo 123"',
    );
  });

  describe('DSL', function () {
    describe('#alias', function () {
      it('should build aliases', function () {
        should((rc) => {
          rc.alias('alias1', 'echo alias1');
          rc.alias('alias2', 'echo alias2');
          rc.alias('alias3', 'echo alias3');
        }).build([
          'alias alias1="echo alias1"',
          'alias alias2="echo alias2"',
          'alias alias3="echo alias3"',
        ]);
      });
    });

    describe('#group', function () {
      it('should build group of alias', function () {
        should((rc) => {
          rc.alias('noGrouped', 'alias');
          rc.group('grouped', (rc) => {
            rc.alias('first', 'alias1');
            rc.alias('second', 'alias2');
          });
        }).build([
          'alias noGrouped="alias"',
          'alias groupedFirst="alias1"',
          'alias groupedSecond="alias2"',
        ]);
      });

      it('should build group recursive', function () {
        should((rc) => {
          rc.group('first', (rc) => {
            rc.alias('alias1', 'alias1');

            rc.group('second', (rc) => {
              rc.alias('alias2', 'alias2');
              rc.alias('alias3', 'alias3');

              rc.group('third', (rc) => {
                rc.alias('alias4', 'alias4');
                rc.alias('alias5', 'alias5');
              });
            });
          });
        }).build([
          'alias firstAlias1="alias1"',
          'alias firstSecondAlias2="alias2"',
          'alias firstSecondAlias3="alias3"',
          'alias firstSecondThirdAlias4="alias4"',
          'alias firstSecondThirdAlias5="alias5"',
        ]);
      });

      it('should build group with array of words in name', function () {
        should((rc) =>
          rc.group(['first', 'second'], (rc) => rc.alias('third', 'alias')),
        ).build('alias firstSecondThird="alias"');
      });

      it('should build with params as object', function () {
        const params = { schema: (rc) => rc.alias('test', 'alias') };

        should(params).build('alias test="alias"');
      });
    });

    describe('#useAlias', function () {
      it('should use another alias', function () {
        should((rc) => {
          const ssh = rc.alias('dev', 'ssh user@domain.com');

          rc.useAlias(ssh, 'log', 'tail -f /var/log/file.log');
        }).build([
          'alias dev="ssh user@domain.com"',
          'alias devLog="dev tail -f /var/log/file.log"',
        ]);
      });

      it('should not attach group name and work nested', function () {
        should((rc) => {
          const first = rc.alias('first', 'echo');

          rc.group('group1', (g) => {
            const second = g.useAlias(first, 'second', 'my text');

            g.group('group2', (g) => g.useAlias(second, 'third', '| grep my'));
          });
        }).build([
          'alias first="echo"',
          'alias firstSecond="first my text"',
          'alias firstSecondThird="firstSecond | grep my"',
        ]);
      });
    });

    describe('#conveyor', function () {
      it('should build conveyor', function () {
        should((rc) => rc.conveyor('conveyor', 'echo 123', 'echo 321')).build(
          'alias conveyor="echo 123 && echo 321"',
        );
      });

      it('should build conveyor with alias', function () {
        should((rc) => {
          const alias = rc.alias('myAlias', 'echo 123');

          rc.conveyor('conveyor', 'echo 321', alias);
        }).build([
          'alias myAlias="echo 123"',
          'alias conveyor="echo 321 && myAlias"',
        ]);
      });

      it('should build nothing', function () {
        const schema = (rc) =>
          rc.conveyor('conveyor', null, '', NaN, undefined);

        should(schema).build('');
      });

      it('should ignore negative values', function () {
        const items = [null, '', NaN, 'echo 123', undefined];

        should((rc) => rc.conveyor('conveyor', items)).build(
          'alias conveyor="echo 123"',
        );
      });
    });
  });
});

function assertions(should, Assertion) {
  Assertion.add('alias', function (expected) {
    const { name, command } = this.obj;
    const assertion = new Alias(name, command).toString();

    should(assertion).equal(expected);
  });

  Assertion.add('build', function (expected) {
    const assertion = build({ schema: this.obj });

    if (isArray(expected)) {
      expected = expected.join('\n');
    }

    should(assertion).equal(expected);
  });
}
