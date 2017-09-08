const _ = require('lodash');
const should = require('should');
const ConfigDSL = require('../lib/dsl/config');

const { isString } = _;

const repositoryIsExists = dsl => name => !!dsl.getRepository(name);
const instanceIsExists = dsl => name => !!dsl.getInstance(name);

describe('config', function() {
  let dsl;

  beforeEach(function() {
    dsl = new ConfigDSL();
    should.use(assertions);
  });

  describe('DSL', function() {
    describe('repository', function() {
      let repository;

      beforeEach(function() {
        repository = {
          name: 'repository',
          path: '/path/to/repository'
        };
      });

      it('should add repository', function() {
        should(repository).addRepository();
      });

      it('should add repository by name with `c.path(...)` path', function() {
        dsl.path('/my/path');
        dsl.addRepository('repository');

        const assertion = !!dsl.getRepository('repository');

        should(assertion).eql(true);
      });

      it('should add repository with name as array', function() {
        repository.name = ['my', 'repository'];

        should(repository).addRepository();
      });

      it('should set repository path by name and `config.path`', function() {
        dsl.path('/my/path');
        dsl.addRepository('repository');

        const repository = dsl.getRepository('repository');

        should(repository.path).eql('/my/path/repository');
      });

      it('should add repositories by array of objects', function() {
        dsl.path('/my/path');
        dsl.addRepository([
          'repository1',
          'repository2',
          'repository3',
        ]);

        const checker = repositoryIsExists(dsl);
        const assertion =
          checker('repository1')
          && checker('repository2')
          && checker('repository3');

        should(!!assertion).eql(true);
      });

      it('should add repositories by array of strings', function() {
        dsl.path('/my/path');
        dsl.addRepository([
          { name: 'repository1' },
          { name: 'repository2' },
          { name: 'repository3' },
        ]);

        const checker = repositoryIsExists(dsl);
        const assertion =
          checker('repository1')
          && checker('repository2')
          && checker('repository3');

        should(!!assertion).eql(true);
      });

      it('should not register repositories with same name', function() {
        let assertion;
        const expected = 'Repository "repository" already registered';

        try {
          dsl.path('/my/path');
          dsl.addRepository('repository');
          dsl.addRepository('repository');
        } catch (e) {
          assertion = e.message;
        }

        should(assertion).eql(expected);
      });

      it('should not register repository without path', function() {
        let assertion;
        const expected = '"repository.path" or "config.path" should be set';

        try {
          dsl.addRepository('repository');
        } catch (e) {
          assertion = e.message;
        }

        should(assertion).eql(expected);
      });

      it('should get repositories', function() {
        dsl.path('/my/path');
        dsl.addRepository({ name: 'repository1' });
        dsl.addRepository({ name: 'repository2' });

        const assertion = Object.keys(dsl.getRepositories()).length;

        should(assertion).eql(2);
      });

      it('should get repository by name', function() {
        dsl.addRepository(repository);

        const assertion = dsl.getRepository('repository').name;

        should(assertion).eql('repository');
      });

      it('should get repository by name as array', function() {
        dsl.addRepository(repository);

        const assertion = dsl.getRepository(['repository']).name;

        should(assertion).eql('repository');
      });
    });

    describe('instances', function() {
      let instance;

      beforeEach(function() {
        instance = { name: 'instance' };
      });

      it('should add instance', function() {
        should(instance).addInstance();
      });

      it('should add instance by string name', function() {
        should(instance).addInstance();
      });

      it('should add instance by array of objects', function() {
        dsl.addInstance([
          { name: 'instance1' },
          { name: 'instance2' },
          { name: 'instance3' },
        ]);

        const checker = instanceIsExists(dsl);
        const assertion =
          checker('instance1')
          && checker('instance2')
          && checker('instance3');

        should(assertion).eql(true);
      });

      it('should add instance by array of strings', function() {
        dsl.addInstance([
          'instance1',
          'instance2',
          'instance3',
        ]);

        const checker = instanceIsExists(dsl);
        const assertion =
          checker('instance1')
          && checker('instance2')
          && checker('instance3');

        should(assertion).eql(true);
      });

      it('should not register instance with same name', function() {
        let assertion;
        const expected = 'Instance "instance" already registered';

        try {
          dsl.addInstance('instance');
          dsl.addInstance('instance');
        } catch (e) {
          assertion = e.message;
        }

        should(assertion).eql(expected);
      });

      it('should not register without required db fields', function() {
        let assertion;
        const expected = '"name", "host" and "login" are required for' +
          ' database connection';

        try {
          // Required - 'login', 'host', 'password'
          instance.db = {};
          dsl.addInstance(instance);

        } catch (e) {
          assertion = e.message;
        }

        should(assertion).eql(expected);
      });

      it('should get instances', function() {
        dsl.path('/my/path');
        dsl.addRepository({ name: 'instance1' });
        dsl.addRepository({ name: 'instance2' });

        const assertion = Object.keys(dsl.getRepositories()).length;

        should(assertion).eql(2);
      });

      it('should get repository by name', function() {
        dsl.addInstance(instance);

        const assertion = dsl.getInstance('instance').name;

        should(assertion).eql('instance');
      });

      it('should get repository by name as array', function() {
        dsl.addInstance(instance);

        const assertion = dsl.getInstance(['instance']).name;

        should(assertion).eql('instance');
      });
    });
  });
});

function assertions(should, Assertion) {
  Assertion.add('addRepository', function() {
    const repository = this.obj;
    const name = isString(repository) ? repository : repository.name;
    const dsl = new ConfigDSL();

    dsl.addRepository(repository);

    const assertion = !!dsl.getRepository(name);

    should(assertion).eql(true);
  });

  Assertion.add('addInstance', function() {
    const instance = this.obj;
    const name = isString(instance) ? instance : instance.name;
    const dsl = new ConfigDSL();

    dsl.addInstance(instance);

    const assertion = !!dsl.getInstance(name);

    should(assertion).eql(true);
  });
}
