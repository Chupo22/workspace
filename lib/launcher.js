const _ = require('lodash');
const minimist = require('minimist');

const { slice, isFunction } = _;

module.exports = { launch };

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
  let current = { commands: schema };

  if (!args._.length) return;

  for (let i = 0; i < args._.length; i++) {
    const argument = args._[i];

    if (!current) return;

    const { commands } = current;
    const next = commands && commands[argument];

    if (!next) break;

    current = next;
  }

  if (!current) return;

  const { launch, beforeLaunch } = current;

  const fn = launch || current;

  if (isFunction(beforeLaunch)) beforeLaunch(args);
  if (isFunction(fn)) fn(args, callback);
  else {
    // TODO: Чтото вывести пользователю.
  }
}
