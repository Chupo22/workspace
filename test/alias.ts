import { build } from '../src';

describe('alias', () => {
  it(`should generate alias`, () => {
    const content = build({
      schema: (s) => s.alias('testAlias', 'echo 123'),
    });

    expect(content).toBe('alias testAlias="echo 123"');
  });

  it(`should join name`, () => {
    const content = build({
      schema: (s) => s.alias(['test', 'alias'], 'echo 123'),
    });

    expect(content).toBe('alias testAlias="echo 123"');
  });

  describe('DSL', () => {
    describe('#alias', () => {
      it(`should build aliases`, () => {
        const content = build({
          schema: (s) => {
            s.alias('alias1', 'echo alias1');
            s.alias('alias2', 'echo alias2');
            s.alias('alias3', 'echo alias3');
          },
        });

        expect(content).toBe(
          [
            'alias alias1="echo alias1"',
            'alias alias2="echo alias2"',
            'alias alias3="echo alias3"',
          ].join('\n'),
        );
      });
    });

    describe('#group', () => {
      it(`should build group of alias`, () => {
        const content = build({
          schema: (s) => {
            s.alias('noGrouped', 'alias');
            s.group('grouped', (g) => {
              g.alias('first', 'alias1');
              g.alias('second', 'alias2');
            });
          },
        });

        expect(content).toBe(
          [
            'alias noGrouped="alias"',
            'alias groupedFirst="alias1"',
            'alias groupedSecond="alias2"',
          ].join('\n'),
        );
      });
    });

    it(`should build group recursive`, () => {
      const content = build({
        schema: (s) => {
          s.group('first', (g1) => {
            g1.alias('alias1', 'alias1');

            g1.group('second', (g2) => {
              g2.alias('alias2', 'alias2');
              g2.alias('alias3', 'alias3');

              g2.group('third', (g3) => {
                g3.alias('alias4', 'alias4');
                g3.alias('alias5', 'alias5');
              });
            });
          });
        },
      });

      expect(content).toBe(
        [
          'alias firstAlias1="alias1"',
          'alias firstSecondAlias2="alias2"',
          'alias firstSecondAlias3="alias3"',
          'alias firstSecondThirdAlias4="alias4"',
          'alias firstSecondThirdAlias5="alias5"',
        ].join('\n'),
      );
    });

    it(`should build group with array of words in name`, () => {
      const content = build({
        schema: (s) => {
          s.group(['first', 'second'], (g) => g.alias('third', 'alias'));
        },
      });

      expect(content).toBe('alias firstSecondThird="alias"');
    });

    it(`should build with params as object`, () => {
      const content = build({ schema: (s) => s.alias('test', 'alias') });

      expect(content).toBe('alias test="alias"');
    });
  });

  describe('#useAlias', () => {
    it('should use another alias', () => {
      const content = build({
        schema: (s) => {
          const ssh = s.alias('dev', 'ssh user@domain.com');

          s.useAlias(ssh, 'log', 'tail -f /var/log/file.log');
        },
      });

      expect(content).toBe(
        [
          'alias dev="ssh user@domain.com"',
          'alias devLog="dev tail -f /var/log/file.log"',
        ].join('\n'),
      );
    });

    it('should not attach group name and work nested', () => {
      const content = build({
        schema: (s) => {
          const first = s.alias('first', 'echo');

          s.group('group1', (g) => {
            const second = g.useAlias(first, 'second', 'my text');

            g.group('group2', (g) => g.useAlias(second, 'third', '| grep my'));
          });
        },
      });

      expect(content).toBe(
        [
          'alias first="echo"',
          'alias firstSecond="first my text"',
          'alias firstSecondThird="firstSecond | grep my"',
        ].join('\n'),
      );
    });
  });

  describe('#conveyor', () => {
    it('should build conveyor', () => {
      const content = build({
        schema: (s) => s.conveyor('conveyor', ['echo 123', 'echo 321']),
      });

      expect(content).toBe('alias conveyor="echo 123 && echo 321"');
    });

    it('should build conveyor with alias', () => {
      const content = build({
        schema: (s) => {
          const alias = s.alias('myAlias', 'echo 123');

          s.conveyor('conveyor', ['echo 321', alias]);
        },
      });

      expect(content).toBe(
        [
          'alias myAlias="echo 123"',
          'alias conveyor="echo 321 && myAlias"',
        ].join('\n'),
      );
    });

    // TODO: Нужно?
    // it('should build nothing', () => {
    //   const content = build({
    //     schema: (rc) => rc.conveyor('conveyor', null, '', NaN, undefined),
    //   });
    //
    //   expect(content).toBe(
    //     [
    //       'alias myAlias="echo 123"',
    //       'alias conveyor="echo 321 && myAlias"',
    //     ].join('\n'),
    //   );
    // });
    //
    // it('should ignore negative values', function () {
    //   const content = build({
    //     schema: (s) =>
    //       s.conveyor('conveyor', [null, '', NaN, 'echo 123', undefined]),
    //   });
    //
    //   expect(content).toBe('alias conveyor="echo 123"');
    // });
  });
});
