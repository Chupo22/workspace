const should = require('should');
const helpers = require('../dist/shared');

const { trimForBash, escapeQuotes } = helpers;

describe('helpers', function () {
  it('should escape quotes', function () {
    should(escapeQuotes("echo '123'")).eql("echo \\'123\\'");
  });

  it('should escape double quotes', function () {
    should(escapeQuotes('echo "123"')).eql('echo \\"123\\"');
  });

  it('should trim for bash', function () {
    const assertion = trimForBash(`
      
      alias a1="echo a1"
      
      
      alias a2="echo a2"
      
      alias a3="echo a3"
      alias a4="echo a4"
    `);
    const expected = [
      'alias a1="echo a1"',
      'alias a2="echo a2"',
      'alias a3="echo a3"',
      'alias a4="echo a4"',
    ].join('\n');

    should(assertion).eql(expected);
  });
});
