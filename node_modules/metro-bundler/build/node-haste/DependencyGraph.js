/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

'use strict';function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const AssetResolutionCache = require('./AssetResolutionCache');
const DependencyGraphHelpers = require('./DependencyGraph/DependencyGraphHelpers');
const FilesByDirNameIndex = require('./FilesByDirNameIndex');
const JestHasteMap = require('jest-haste-map');
const Module = require('./Module');
const ModuleCache = require('./ModuleCache');
const ResolutionRequest = require('./DependencyGraph/ResolutionRequest');
const ResolutionResponse = require('./DependencyGraph/ResolutionResponse');

const fs = require('fs');
const invariant = require('fbjs/lib/invariant');
const isAbsolutePath = require('absolute-path');
const parsePlatformFilePath = require('./lib/parsePlatformFilePath');
const path = require('path');
const util = require('util');var _require =





require('../Logger');const createActionEndEntry = _require.createActionEndEntry,createActionStartEntry = _require.createActionStartEntry,log = _require.log;var _require2 =
require('events');const EventEmitter = _require2.EventEmitter;































const JEST_HASTE_MAP_CACHE_BREAKER = 1;

class DependencyGraph extends EventEmitter {









  constructor(config)




  {
    super();
    invariant(
    config.opts.maxWorkerCount >= 1,
    'worker count must be greater or equal to 1');

    this._opts = config.opts;
    this._filesByDirNameIndex = new FilesByDirNameIndex(
    config.initialHasteFS.getAllFiles());

    this._assetResolutionCache = new AssetResolutionCache({
      assetExtensions: new Set(config.opts.assetExts),
      getDirFiles: dirPath => this._filesByDirNameIndex.getAllFiles(dirPath),
      platforms: config.opts.platforms });

    this._haste = config.haste;
    this._hasteFS = config.initialHasteFS;
    this._moduleMap = config.initialModuleMap;
    this._helpers = new DependencyGraphHelpers(this._opts);
    this._haste.on('change', this._onHasteChange.bind(this));
    this._moduleCache = this._createModuleCache();
  }

  static _createHaste(opts) {
    return new JestHasteMap({
      extensions: opts.sourceExts.concat(opts.assetExts),
      forceNodeFilesystemAPI: opts.forceNodeFilesystemAPI,
      ignorePattern: opts.ignoreFilePath,
      maxWorkers: opts.maxWorkerCount,
      mocksPattern: '',
      name: 'react-native-packager-' + JEST_HASTE_MAP_CACHE_BREAKER,
      platforms: Array.from(opts.platforms),
      providesModuleNodeModules: opts.providesModuleNodeModules,
      resetCache: opts.resetCache,
      retainAllFiles: true,
      roots: opts.roots,
      useWatchman: opts.useWatchman,
      watch: opts.watch });

  }

  static load(opts) {return _asyncToGenerator(function* () {
      const initializingPackagerLogEntry = log(
      createActionStartEntry('Initializing Packager'));

      opts.reporter.update({ type: 'dep_graph_loading' });
      const haste = DependencyGraph._createHaste(opts);var _ref =
      yield haste.build();const hasteFS = _ref.hasteFS,moduleMap = _ref.moduleMap;
      log(createActionEndEntry(initializingPackagerLogEntry));
      opts.reporter.update({ type: 'dep_graph_loaded' });
      return new DependencyGraph({
        haste,
        initialHasteFS: hasteFS,
        initialModuleMap: moduleMap,
        opts });})();

  }

  _getClosestPackage(filePath) {
    const parsedPath = path.parse(filePath);
    const root = parsedPath.root;
    let dir = parsedPath.dir;
    do {
      const candidate = path.join(dir, 'package.json');
      if (this._hasteFS.exists(candidate)) {
        return candidate;
      }
      dir = path.dirname(dir);
    } while (dir !== '.' && dir !== root);
    return null;
  }

  _onHasteChange(_ref2) {let eventsQueue = _ref2.eventsQueue,hasteFS = _ref2.hasteFS,moduleMap = _ref2.moduleMap;
    this._hasteFS = hasteFS;
    this._filesByDirNameIndex = new FilesByDirNameIndex(hasteFS.getAllFiles());
    this._assetResolutionCache.clear();
    this._moduleMap = moduleMap;
    eventsQueue.forEach((_ref3) => {let type = _ref3.type,filePath = _ref3.filePath;return (
        this._moduleCache.processFileChange(type, filePath));});

    this.emit('change');
  }

  _createModuleCache() {const
    _opts = this._opts;
    return new ModuleCache(
    {
      assetDependencies: _opts.assetDependencies,
      depGraphHelpers: this._helpers,
      getClosestPackage: this._getClosestPackage.bind(this),
      getTransformCacheKey: _opts.getTransformCacheKey,
      globalTransformCache: _opts.globalTransformCache,
      moduleOptions: _opts.moduleOptions,
      reporter: _opts.reporter,
      roots: _opts.roots,
      transformCode: _opts.transformCode },

    _opts.platforms);

  }

  /**
     * Returns a promise with the direct dependencies the module associated to
     * the given entryPath has.
     */
  getShallowDependencies(
  entryPath,
  transformOptions)
  {
    return this._moduleCache.
    getModule(entryPath).
    getDependencies(transformOptions);
  }

  getWatcher() {
    return this._haste;
  }

  /**
     * Returns the module object for the given path.
     */
  getModuleForPath(entryFile) {
    return this._moduleCache.getModule(entryFile);
  }

  getAllModules() {
    return Promise.resolve(this._moduleCache.getAllModules());
  }

  getDependencies(_ref4)











  {let entryPath = _ref4.entryPath,options = _ref4.options,platform = _ref4.platform,onProgress = _ref4.onProgress;var _ref4$recursive = _ref4.recursive;let recursive = _ref4$recursive === undefined ? true : _ref4$recursive;
    platform = this._getRequestPlatform(entryPath, platform);
    const absPath = this._getAbsolutePath(entryPath);
    const dirExists = filePath => {
      try {
        return fs.lstatSync(filePath).isDirectory();
      } catch (e) {}
      return false;
    };
    const req = new ResolutionRequest({
      dirExists,
      entryPath: absPath,
      extraNodeModules: this._opts.extraNodeModules,
      hasteFS: this._hasteFS,
      helpers: this._helpers,
      moduleCache: this._moduleCache,
      moduleMap: this._moduleMap,
      platform,
      preferNativePlatform: this._opts.preferNativePlatform,
      resolveAsset: (dirPath, assetName) =>
      this._assetResolutionCache.resolve(dirPath, assetName, platform),
      sourceExts: this._opts.sourceExts });


    const response = new ResolutionResponse(options);

    return req.
    getOrderedDependencies({
      response,
      transformOptions: options.transformer,
      onProgress,
      recursive }).

    then(() => response);
  }

  matchFilesByPattern(pattern) {
    return Promise.resolve(this._hasteFS.matchFiles(pattern));
  }

  _getRequestPlatform(entryPath, platform) {
    if (platform == null) {
      platform = parsePlatformFilePath(entryPath, this._opts.platforms).
      platform;
    } else if (!this._opts.platforms.has(platform)) {
      throw new Error('Unrecognized platform: ' + platform);
    }
    return platform;
  }

  _getAbsolutePath(filePath) {
    if (isAbsolutePath(filePath)) {
      return path.resolve(filePath);
    }

    for (let i = 0; i < this._opts.roots.length; i++) {
      const root = this._opts.roots[i];
      const potentialAbsPath = path.join(root, filePath);
      if (this._hasteFS.exists(potentialAbsPath)) {
        return path.resolve(potentialAbsPath);
      }
    }

    throw new NotFoundError(
    'Cannot find entry file %s in any of the roots: %j',
    filePath,
    this._opts.roots);

  }

  createPolyfill(options) {
    return this._moduleCache.createPolyfill(options);
  }}


function NotFoundError() {
  /* $FlowFixMe: monkey-patching */
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
  var msg = util.format.apply(util, args);
  this.message = msg;
  this.type = this.name = 'NotFoundError';
  this.status = 404;
}
util.inherits(NotFoundError, Error);

module.exports = DependencyGraph;