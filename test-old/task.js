const _ = require('lodash');
const should = require('should');
const helpers = require('../dist/shared');
const rcFile = require('../dist/rc-file');

const { reduce, isObject, castArray } = _;
const { escapeQuotes } = helpers;
const { build } = rcFile;

// describe('task', function () {
//   beforeEach(function () {
//     should.use(assertions);
//   });
//
//   describe('DSL', function () {
//     describe('task', function () {
//       it('should build task', function () {
//         should({
//           name: 'task',
//           fn: (t) => t.command('echo "123"'),
//         }).task({ name: 'task', commands: ['echo "123"'] });
//       });
//
//       it('should build task with array of commands', function () {
//         should({
//           name: 'task',
//           fn: (t) => t.command(['echo 123', 'echo 321']),
//         }).task({
//           name: 'task',
//           commands: ['echo 123', 'echo 321'],
//         });
//       });
//
//       it('should build task with info', function () {
//         should({
//           name: 'task',
//           fn: (t) => {
//             t.command('echo 123');
//             t.info(`
//               some info
//               some more info
//             `);
//           },
//         }).task([
//           {
//             name: 'taskInfo',
//             commands: ['echo "some info"', 'echo "some more info"'],
//           },
//           { name: 'task', commands: ['echo 123 && taskInfo'] },
//         ]);
//       });
//     });
//   });
// });

function assertions(should, Assertion) {
  Assertion.add('task', function (expected) {
    const { name, fn } = this.obj;
    const rcSchema = (rc) => rc.task(name, fn);

    const assertion = build({ schema: rcSchema });

    expected = reduce(
      castArray(expected),
      (result, item) => {
        if (isObject(item)) {
          const { name, commands } = item;
          const conveyor = escapeQuotes(commands.join(' && '));

          result.push(`alias ${name}="${conveyor}"`);
        }

        return result;
      },
      [],
    ).join('\n');

    should(assertion).equal(expected);
  });
}
