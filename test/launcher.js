const _ = require('lodash');
const should = require('should');
const runner = require('../lib/launcher');

const { range, reduce, castArray } = _;

describe('launcher', function() {
  describe('#launch', function() {
    let argv, schema, launch, listeners;

    beforeEach(function() {
      should.use(assertions);

      listeners = reduce(range(5), (result, value) => {
        value++;

        const fn = result[value] = listener();

        fn.index = value;

        return result;
      }, {});

      argv = ['node', '/file.js'];

      schema = {
        '1': listeners[1],
        '2': {
          launch: listeners[2],
          commands: {
            '3': listeners[3]
          }
        },
        '4': {
          launch: listeners[4],
          beforeLaunch: listeners[5]
        }
      };

      launch = argv => runner.launch(schema, argv);
    });

    it('should launch "1"', function() {
      argv.push(1);

      launch(argv);

      should(1).launched();
    });

    it('should launch "2"', function() {
      argv.push(2);

      launch(argv);

      should(2).launched();
    });

    it('should launch "3"', function() {
      argv.push(2, 3);

      launch(argv);

      should(3).launched();
    });

    it('should launch "3"', function() {
      argv.push(2, 3);

      launch(argv);

      should(3).launched();
    });

    it('should launch "3" with options', function() {
      argv.push(2, 3, '--instance', 'test');

      launch(argv);

      should(3).launched();
    });

    it('should launch "3" with options between arguments', function() {
      argv.push(2, '--instance', 'test', 3);

      launch(argv);

      should(3).launched();
    });

    it('should launch "5" before launch "4"', function() {
      argv.push(4);

      launch(argv);

      should([4, 5]).launched();
    });

    it('should not launch anything with arguments', function() {
      argv.push(999);

      launch(argv);

      should().launched();
    });

    it('should not launch anything without arguments', function() {
      launch(argv);

      should().launched();
    });

    function assertions(should, Assertion) {
      Assertion.add('launched', function() {
        const indexes = castArray(this.obj);

        const success = reduce(listeners, (result, listener, index) => {
          if (!result) return false;

          const key = Number(index);
          const shouldLaunched = indexes.includes(key);
          const { launched } = listener;

          const notLaunched = shouldLaunched && !launched;
          const wrongLaunched = !shouldLaunched && launched;
          const failed = notLaunched || wrongLaunched;

          return !failed;
        }, true);

        should(success).eql(true);
      });
    }
  });
});

function listener() {
  const fn = () => fn.launched = true;

  fn.launched = null;

  return fn;
}
