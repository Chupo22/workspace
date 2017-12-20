const _ = require('lodash');
const minimist = require('minimist');

const { slice, isFunction } = _;

const getArgs = argv => minimist(slice(argv, 2));

module.exports = { launch, getArgs, getCurrent };

/**
 * // TODO: подумать что и как показать если не найдена функция выполнения
 * Launch runner schema by argv
 *
 * @param {Object} schema
 * @param {String[]} argv
 * @param {Function} callback
 */
function launch(schema, argv, callback) {
  const args = minimist(slice(argv, 2));
  const current = getCurrent(schema, args);

  if (!current) return;

  const { launch, beforeLaunch } = current;
  const fn = launch || current;

  if (isFunction(beforeLaunch)) beforeLaunch(args);
  if (isFunction(fn)) {
    fn(args, callback);
  } else {
    // FIXME: Это нужно сделать как-то умнее.
    // Сейчас как минимум нелогичное сообщение, в том случае, если найдена
    // команда, но не указана дочерняя команда.
    // TODO: нужно добавить выведение `current` в сообщении
    console.log('Command not found');
    // console.log(Object.keys(current.commands).join('\n'));
    callback && callback();
  }
}

/**
 * Returns current command by schema and args
 *
 * @param {Object} schema
 * @param {String[]} args
 */
function getCurrent(schema, args) {
  if (!args._.length) return;

  let argument;
  let depth = 0;
  let current = { commands: schema };

  for (let i = 0; i < args._.length; i++) {
    argument = args._[i];

    if (!current) return;

    const { commands } = current;

    if (isFunction(current[argument])) current = current[argument];
    if (!commands) break;

    depth++;
    current = commands[argument];
  }

  // TODO: возможно сам `depth` стоит засунуть в `this`
  if (current) current.depth = depth;

  return current;
}
