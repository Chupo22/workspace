/* eslint-disable */
const { compilerOptions } = require('../tsconfig');
// const { pathsToModuleNameMapper } = require('ts-jest/utils');
//
// // TODO: REMOVE ME
// console.log(compilerOptions);

module.exports = {
  preset: 'ts-jest',
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.ts$',
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
  //   prefix: '<rootDir>/../test',
  // }),
};
