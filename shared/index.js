const _ = require('lodash');

const {
  map,
  isArray,
  upperFirst,
  lowerFirst,
  flattenDeep,
} = _;

module.exports = { getName };

/**
 * Returns alias name. Convert to string if array given.
 *
 * @param {String[]|String} words
 * @return {String}
 */
function getName(words) {
  if (!isArray(words)) return words;

  words = flattenDeep(words);

  const upperFirstWords = map(words, upperFirst);

  return lowerFirst(upperFirstWords.join(''));
}

