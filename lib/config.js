const DSL = require('./dsl/config');

module.exports = function(fn) {
  const dsl = new DSL();

  fn(dsl);

};
