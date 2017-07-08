/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */
'use strict';

const emptyFunction = require('fbjs/lib/emptyFunction');
const invariant = require('fbjs/lib/invariant');
const memoize = require('async/memoize');
const emptyModule = require('./module').empty;
const nullthrows = require('fbjs/lib/nullthrows');
const queue = require('async/queue');
const seq = require('async/seq');

































const NO_OPTIONS = {};

exports.create = function create(resolve, load) {
  function Graph(entryPoints, platform, options) {let callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : emptyFunction;var _ref =




    options || NO_OPTIONS,_ref$log = _ref.log;const log = _ref$log === undefined ? console : _ref$log;var _ref$optimize = _ref.optimize;const optimize = _ref$optimize === undefined ? false : _ref$optimize,skip = _ref.skip;

    if (typeof platform !== 'string') {
      log.error('`Graph`, called without a platform');
      callback(Error('The target platform has to be passed'));
      return;
    }

    const loadQueue = queue(seq(
    (_ref2, cb) => {let id = _ref2.id,parent = _ref2.parent;return resolve(id, parent, platform, options || NO_OPTIONS, cb);},
    memoize((file, cb) => load(file, { log, optimize }, cb))),
    Number.MAX_SAFE_INTEGER);var _createGraphHelpers =

    createGraphHelpers(loadQueue, skip);const collect = _createGraphHelpers.collect,loadModule = _createGraphHelpers.loadModule;

    loadQueue.drain = () => {
      loadQueue.kill();
      callback(null, collect());
    };
    loadQueue.error = error => {
      loadQueue.error = emptyFunction;
      loadQueue.kill();
      callback(error);
    };

    let i = 0;
    for (const entryPoint of entryPoints) {
      loadModule(entryPoint, null, i++);
    }

    if (i === 0) {
      log.error('`Graph` called without any entry points');
      loadQueue.kill();
      callback(Error('At least one entry point has to be passed.'));
    }
  }

  return Graph;
};

function createGraphHelpers(loadQueue, skip) {
  const modules = new Map([[null, emptyModule()]]);

  function collect()



  {let path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;let serialized = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { entryModules: [], modules: [] };let seen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
    const module = modules.get(path);
    if (module == null || seen.has(path)) {
      return serialized;
    }const

    dependencies = module.dependencies;
    if (path === null) {
      serialized.entryModules =
      dependencies.map(dep => nullthrows(modules.get(dep.path)));
    } else {
      serialized.modules.push(module);
      seen.add(path);
    }

    for (const dependency of dependencies) {
      collect(dependency.path, serialized, seen);
    }

    return serialized;
  }

  function loadModule(id, parent, parentDepIndex) {
    loadQueue.push(
    { id, parent },
    (error, file, dependencyIDs) =>
    onFileLoaded(error, file, dependencyIDs, id, parent, parentDepIndex));

  }

  function onFileLoaded(
  error,
  file,
  dependencyIDs,
  id,
  parent,
  parentDependencyIndex)
  {
    if (error) {
      return;
    }var _nullthrows =

    nullthrows(file);const path = _nullthrows.path;
    dependencyIDs = nullthrows(dependencyIDs);

    const parentModule = modules.get(parent);
    invariant(parentModule, 'Invalid parent module: ' + String(parent));
    parentModule.dependencies[parentDependencyIndex] = { id, path };

    if ((!skip || !skip.has(path)) && !modules.has(path)) {
      const module = {
        dependencies: Array(dependencyIDs.length),
        file: nullthrows(file) };

      modules.set(path, module);
      for (let i = 0; i < dependencyIDs.length; ++i) {
        loadModule(dependencyIDs[i], path, i);
      }
    }
  }

  return { collect, loadModule };
}