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
'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();

const buildSourceMapWithMetaData = require('../../shared/output/unbundle/build-unbundle-sourcemap-with-metadata.js');
const nullthrows = require('fbjs/lib/nullthrows');var _require =

require('../../Bundler/util');const createRamBundleGroups = _require.createRamBundleGroups;var _require2 =
require('../../shared/output/unbundle/as-indexed-file');const buildTableAndContents = _require2.buildTableAndContents,createModuleGroups = _require2.createModuleGroups;var _require3 =
require('./util');const addModuleIdsToModuleWrapper = _require3.addModuleIdsToModuleWrapper,concat = _require3.concat;




function asIndexedRamBundle(_ref)






{let filename = _ref.filename,idForPath = _ref.idForPath,modules = _ref.modules,preloadedModules = _ref.preloadedModules,ramGroupHeads = _ref.ramGroupHeads,requireCalls = _ref.requireCalls;var _partition =
  partition(modules, preloadedModules),_partition2 = _slicedToArray(_partition, 2);const startup = _partition2[0],deferred = _partition2[1];
  const startupModules = Array.from(concat(startup, requireCalls));
  const deferredModules = deferred.map(m => toModuleTransport(m, idForPath));
  const ramGroups = createRamBundleGroups(ramGroupHeads || [], deferredModules, subtree);
  const moduleGroups = createModuleGroups(ramGroups, deferredModules);

  const tableAndContents = buildTableAndContents(
  startupModules.map(m => getModuleCode(m, idForPath)).join('\n'),
  deferredModules,
  moduleGroups,
  'utf8');


  return {
    code: Buffer.concat(tableAndContents),
    map: buildSourceMapWithMetaData({
      fixWrapperOffset: false,
      lazyModules: deferredModules,
      moduleGroups,
      startupModules: startupModules.map(m => toModuleTransport(m, idForPath)) }) };


}

function toModuleTransport(module, idForPath) {const
  dependencies = module.dependencies,file = module.file;
  return {
    code: getModuleCode(module, idForPath),
    dependencies,
    id: idForPath(file),
    map: file.map,
    name: file.path,
    sourcePath: file.path };

}

function getModuleCode(module, idForPath) {const
  file = module.file;
  return file.type === 'module' ?
  addModuleIdsToModuleWrapper(module, idForPath) :
  file.code;
}

function partition(modules, preloadedModules) {
  const startup = [];
  const deferred = [];
  for (const module of modules) {
    (preloadedModules.has(module.file.path) ? startup : deferred).push(module);
  }

  return [startup, deferred];
}

function* subtree(
moduleTransport,
moduleTransportsByPath)

{let seen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();
  seen.add(moduleTransport.id);
  for (const _ref2 of moduleTransport.dependencies) {const path = _ref2.path;
    const dependency = nullthrows(moduleTransportsByPath.get(path));
    if (!seen.has(dependency.id)) {
      yield dependency.id;
      yield* subtree(dependency, moduleTransportsByPath, seen);
    }
  }
}

function createBuilder(
preloadedModules,
ramGroupHeads)
{
  return x => asIndexedRamBundle(_extends({}, x, { preloadedModules, ramGroupHeads }));
}

exports.createBuilder = createBuilder;