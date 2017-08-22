const _ = require('lodash');
const path = require('path');
const shared = require('../../shared');
const helpers = require('../../helpers');

const { asArray } = helpers;
const { getName } = shared;
const { clone, forEach, isString } = _;

module.exports = DSL;

function DSL() {
  this._path = '';
  this._repositories = {};
  this._instances = {};
}

/**
 * Set working directory for project
 *
 * @param {String} path
 * @return {String}
 */
DSL.prototype.path = function(path) {
  if (path) this._path = path;

  return this._path;
};

/**
 * Add one or more repositories to config
 *
 * @param {Object[]|Object|String[]|String} repositories
 * @param {String[]|String} repositories[].name
 * @param {String} repositories[].path
 */
DSL.prototype.addRepository = function(repositories) {
  forEachItem(repositories, repository => {
    const { name } = repository;
    const code = getName(name);
    const workingPath = this.path();

    if (!repository.path && workingPath)
      repository.path = path.join(workingPath, code);

    if (!code)
      throw new Error('"name" is required for repository');
    if (!repository.path)
      throw new Error('"repository.path" or "config.path" should be set');

    if (this._repositories[code])
      throw new Error(`Repository "${code}" already registered`);

    this._repositories[code] = repository;
  });
};

/**
 * Returns repository by name
 *
 *  @param {String[]|String} name
 *  @return {Object}
 */
DSL.prototype.getRepository = function(name) {
  return clone(this._repositories[getName(name)]);
};

/**
 * Returns registered repositories
 *
 * @return {Object}
 */
DSL.prototype.getRepositories = function() {
  return clone(this._repositories);
};

/**
 * Add one or more instances
 *
 * @param {Object[]|Object|String[]|String} instances
 * @param {String[]|String} instances[].name
 * @param {String} instances[].db.name
 * @param {String} instances[].db.host
 * @param {String} instances[].db.login
 * @param {String} instances[].db.password
 */
DSL.prototype.addInstance = function(instances) {
  forEachItem(instances, instance => {
    const { db, name } = instance;
    const code = getName(name);

    if (db) {
      const { name, host, login } = db;

      if (!name || !host || !login)
        throw new Error('"name", "host" and "login" are required for database' +
          ' connection');

      db.password = db.password || null;
    }

    if (this._instances[code])
      throw new Error(`Instance "${code}" already registered`);

    this._instances[code] = instance;
  });
};

/**
 * Returns instance by name
 *
 * @param {String[]|String} name
 * @return {Object}
 */
DSL.prototype.getInstance = function(name) {
  return this._instances[getName(name)];
};

/**
 * Returns registered instances
 *
 * @return {Object}
 */
DSL.prototype.getInstances = function() {
  return this._instances;
};

/**
 * Cast input to array. Cast item to object while it is string.
 *
 * @param {Object[]|Object|String[]|String} items
 * @param {Function} callback
 */
function forEachItem(items, callback) {
  items = asArray(items);

  forEach(items, item => {
    if (isString(item)) item = { name: item };

    callback(item);
  });
}
