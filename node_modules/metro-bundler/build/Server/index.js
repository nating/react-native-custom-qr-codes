/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new Promise(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return Promise.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}

const AssetServer = require('../AssetServer');
const Bundler = require('../Bundler');
const MultipartResponse = require('./MultipartResponse');

const defaults = require('../defaults');
const emptyFunction = require('fbjs/lib/emptyFunction');
const mime = require('mime-types');
const parsePlatformFilePath = require('../node-haste/lib/parsePlatformFilePath');
const path = require('path');
const symbolicate = require('./symbolicate');
const url = require('url');

const debug = require('debug')('RNP:Server');var _require =
















require('../Logger');const createActionStartEntry = _require.createActionStartEntry,createActionEndEntry = _require.createActionEndEntry,log = _require.log;

function debounceAndBatch(fn, delay) {
  let args = [];
  let timeout;
  return value => {
    args.push(value);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const a = args;
      args = [];
      fn(a);
    }, delay);
  };
}























































const bundleDeps = new WeakMap();
const NODE_MODULES = `${path.sep}node_modules${path.sep}`;

class Server {









































  constructor(options) {
    this._opts = {
      assetExts: options.assetExts || defaults.assetExts,
      blacklistRE: options.blacklistRE,
      cacheVersion: options.cacheVersion || '1.0',
      extraNodeModules: options.extraNodeModules || {},
      getTransformOptions: options.getTransformOptions,
      globalTransformCache: options.globalTransformCache,
      hasteImpl: options.hasteImpl,
      moduleFormat: options.moduleFormat != null ? options.moduleFormat : 'haste',
      platforms: options.platforms || defaults.platforms,
      polyfillModuleNames: options.polyfillModuleNames || [],
      postProcessModules: options.postProcessModules,
      postMinifyProcess: options.postMinifyProcess,
      projectRoots: options.projectRoots,
      providesModuleNodeModules: options.providesModuleNodeModules,
      reporter: options.reporter,
      resetCache: options.resetCache || false,
      silent: options.silent || false,
      sourceExts: options.sourceExts || defaults.sourceExts,
      transformCache: options.transformCache,
      transformModulePath: options.transformModulePath,
      transformTimeoutInterval: options.transformTimeoutInterval,
      watch: options.watch || false,
      workerPath: options.workerPath };


    const processFileChange =
    (_ref) => {let type = _ref.type,filePath = _ref.filePath;return this.onFileChange(type, filePath);};

    this._reporter = options.reporter;
    this._projectRoots = this._opts.projectRoots;
    this._bundles = Object.create(null);
    this._changeWatchers = [];
    this._fileChangeListeners = [];
    this._platforms = new Set(this._opts.platforms);

    this._assetServer = new AssetServer({
      assetExts: this._opts.assetExts,
      projectRoots: this._opts.projectRoots });


    const bundlerOpts = Object.create(this._opts);
    bundlerOpts.assetServer = this._assetServer;
    bundlerOpts.allowBundleUpdates = this._opts.watch;
    bundlerOpts.globalTransformCache = options.globalTransformCache;
    bundlerOpts.watch = this._opts.watch;
    bundlerOpts.reporter = options.reporter;
    this._bundler = new Bundler(bundlerOpts);

    // changes to the haste map can affect resolution of files in the bundle
    this._bundler.getResolver().then(resolver => {
      resolver.getDependencyGraph().getWatcher().on(
      'change',
      (_ref2) => {let eventsQueue = _ref2.eventsQueue;return eventsQueue.forEach(processFileChange);});

    });

    this._debouncedFileChangeHandler = debounceAndBatch(filePaths => {
      // only clear bundles for non-JS changes
      if (filePaths.every(RegExp.prototype.test, /\.js(?:on)?$/i)) {
        for (const key in this._bundles) {
          this._bundles[key].then(bundle => {
            const deps = bundleDeps.get(bundle);
            filePaths.forEach(filePath => {
              // $FlowFixMe(>=0.37.0)
              if (deps.files.has(filePath)) {
                // $FlowFixMe(>=0.37.0)
                deps.outdated.add(filePath);
              }
            });
          }).catch(e => {
            debug(`Could not update bundle: ${e}, evicting from cache`);
            delete this._bundles[key];
          });
        }
      } else {
        debug('Clearing bundles due to non-JS change');
        this._clearBundles();
      }
      this._informChangeWatchers();
    }, 50);

    this._symbolicateInWorker = symbolicate.createWorker();
    this._nextBundleBuildID = 1;
  }

  end() {
    return this._bundler.end();
  }

  setHMRFileChangeListener(listener) {
    this._hmrFileChangeListener = listener;
  }

  addFileChangeListener(listener) {
    if (this._fileChangeListeners.indexOf(listener) === -1) {
      this._fileChangeListeners.push(listener);
    }
  }

  buildBundle(options) {var _this = this;return _asyncToGenerator(function* () {
      const bundle = yield _this._bundler.bundle(options);
      const modules = bundle.getModules();
      const nonVirtual = modules.filter(function (m) {return !m.virtual;});
      bundleDeps.set(bundle, {
        files: new Map(nonVirtual.map(function (_ref3) {let sourcePath = _ref3.sourcePath,meta = _ref3.meta;return (
            [sourcePath, meta != null ? meta.dependencies : []]);})),

        idToIndex: new Map(modules.map(function (_ref4, i) {let id = _ref4.id;return [id, i];})),
        dependencyPairs: new Map(
        nonVirtual.
        filter(function (_ref5) {let meta = _ref5.meta;return meta && meta.dependencyPairs;})
        /* $FlowFixMe: the filter above ensures `dependencyPairs` is not null. */.
        map(function (m) {return [m.sourcePath, m.meta.dependencyPairs];})),

        outdated: new Set() });

      return bundle;})();
  }

  buildBundleFromUrl(reqUrl) {
    const options = this._getOptionsFromUrl(reqUrl);
    return this.buildBundle(options);
  }

  buildBundleForHMR(
  options,
  host,
  port)
  {
    return this._bundler.hmrBundle(options, host, port);
  }

  getShallowDependencies(options) {
    return Promise.resolve().then(() => {
      const platform = options.platform != null ?
      options.platform : parsePlatformFilePath(options.entryFile, this._platforms).platform;const
      entryFile = options.entryFile,dev = options.dev,minify = options.minify,hot = options.hot;
      return this._bundler.getShallowDependencies(
      { entryFile, platform, dev, minify, hot, generateSourceMaps: false });

    });
  }

  getModuleForPath(entryFile) {
    return this._bundler.getModuleForPath(entryFile);
  }

  getDependencies(options) {
    return Promise.resolve().then(() => {
      const platform = options.platform != null ?
      options.platform : parsePlatformFilePath(options.entryFile, this._platforms).platform;const
      entryFile = options.entryFile,dev = options.dev,minify = options.minify,hot = options.hot;
      return this._bundler.getDependencies(
      { entryFile, platform, dev, minify, hot, generateSourceMaps: false });

    });
  }

  getOrderedDependencyPaths(options)





  {
    return Promise.resolve().then(() => {
      return this._bundler.getOrderedDependencyPaths(options);
    });
  }

  onFileChange(type, filePath) {
    this._assetServer.onFileChange(type, filePath);

    // If Hot Loading is enabled avoid rebuilding bundles and sending live
    // updates. Instead, send the HMR updates right away and clear the bundles
    // cache so that if the user reloads we send them a fresh bundle
    const _hmrFileChangeListener = this._hmrFileChangeListener;
    if (_hmrFileChangeListener) {
      // Clear cached bundles in case user reloads
      this._clearBundles();
      _hmrFileChangeListener(type, filePath);
      return;
    } else if (type !== 'change' && filePath.indexOf(NODE_MODULES) !== -1) {
      // node module resolution can be affected by added or removed files
      debug('Clearing bundles due to potential node_modules resolution change');
      this._clearBundles();
    }

    Promise.all(
    this._fileChangeListeners.map(listener => listener(filePath))).
    then(
    () => this._onFileChangeComplete(filePath),
    () => this._onFileChangeComplete(filePath));

  }

  _onFileChangeComplete(filePath) {
    // Make sure the file watcher event runs through the system before
    // we rebuild the bundles.
    this._debouncedFileChangeHandler(filePath);
  }

  _clearBundles() {
    this._bundles = Object.create(null);
  }

  _informChangeWatchers() {
    const watchers = this._changeWatchers;
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8' };


    watchers.forEach(function (w) {
      w.res.writeHead(205, headers);
      w.res.end(JSON.stringify({ changed: true }));
    });

    this._changeWatchers = [];
  }

  _processDebugRequest(reqUrl, res) {
    let ret = '<!doctype html>';
    const pathname = url.parse(reqUrl).pathname;
    /* $FlowFixMe: pathname would be null for an invalid URL */
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 1) {
      ret += '<div><a href="/debug/bundles">Cached Bundles</a></div>';
      res.end(ret);
    } else if (parts[1] === 'bundles') {
      ret += '<h1> Cached Bundles </h1>';
      Promise.all(Object.keys(this._bundles).map(optionsJson =>
      this._bundles[optionsJson].then(p => {
        ret += '<div><h2>' + optionsJson + '</h2>';
        ret += p.getDebugInfo();
      }))).
      then(
      () => res.end(ret),
      e => {
        res.writeHead(500);
        res.end('Internal Error');
        // FIXME: $FlowFixMe: that's a hack, doesn't work with JSON-mode output
        this._reporter.terminal && this._reporter.terminal.log(e.stack);
      });

    } else {
      res.writeHead(404);
      res.end('Invalid debug request');
      return;
    }
  }

  _processOnChangeRequest(req, res) {
    const watchers = this._changeWatchers;

    watchers.push({
      req,
      res });


    req.on('close', () => {
      for (let i = 0; i < watchers.length; i++) {
        if (watchers[i] && watchers[i].req === req) {
          watchers.splice(i, 1);
          break;
        }
      }
    });
  }

  _rangeRequestMiddleware(
  req,
  res,
  data,
  assetPath)
  {
    if (req.headers && req.headers.range) {var _req$headers$range$re =
      req.headers.range.replace(/bytes=/, '').split('-'),_req$headers$range$re2 = _slicedToArray(_req$headers$range$re, 2);const rangeStart = _req$headers$range$re2[0],rangeEnd = _req$headers$range$re2[1];
      const dataStart = parseInt(rangeStart, 10);
      const dataEnd = rangeEnd ? parseInt(rangeEnd, 10) : data.length - 1;
      const chunksize = dataEnd - dataStart + 1;

      res.writeHead(206, {
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Range': `bytes ${dataStart}-${dataEnd}/${data.length}`,
        'Content-Type': mime.lookup(path.basename(assetPath[1])) });


      return data.slice(dataStart, dataEnd + 1);
    }

    return data;
  }

  _processAssetsRequest(req, res) {
    const urlObj = url.parse(decodeURI(req.url), true);
    /* $FlowFixMe: could be empty if the url is invalid */
    const assetPath = urlObj.pathname.match(/^\/assets\/(.+)$/);

    const processingAssetRequestLogEntry =
    log(createActionStartEntry({
      action_name: 'Processing asset request',
      asset: assetPath[1] }));


    /* $FlowFixMe: query may be empty for invalid URLs */
    this._assetServer.get(assetPath[1], urlObj.query.platform).
    then(
    data => {
      // Tell clients to cache this for 1 year.
      // This is safe as the asset url contains a hash of the asset.
      if (process.env.REACT_NATIVE_ENABLE_ASSET_CACHING === true) {
        res.setHeader('Cache-Control', 'max-age=31536000');
      }
      res.end(this._rangeRequestMiddleware(req, res, data, assetPath));
      process.nextTick(() => {
        log(createActionEndEntry(processingAssetRequestLogEntry));
      });
    },
    error => {
      console.error(error.stack);
      res.writeHead(404);
      res.end('Asset not found');
    });

  }

  optionsHash(options) {
    // onProgress is a function, can't be serialized
    return JSON.stringify(Object.assign({}, options, { onProgress: null }));
  }

  /**
     * Ensure we properly report the promise of a build that's happening,
     * including failed builds. We use that separately for when we update a bundle
     * and for when we build for scratch.
     */
  _reportBundlePromise(
  buildID,
  options,
  bundlePromise)
  {
    this._reporter.update({
      buildID,
      entryFilePath: options.entryFile,
      type: 'bundle_build_started' });

    return bundlePromise.then(bundle => {
      this._reporter.update({
        buildID,
        type: 'bundle_build_done' });

      return bundle;
    }, error => {
      this._reporter.update({
        buildID,
        type: 'bundle_build_failed' });

      return Promise.reject(error);
    });
  }

  useCachedOrUpdateOrCreateBundle(
  buildID,
  options)
  {
    const optionsJson = this.optionsHash(options);
    const bundleFromScratch = () => {
      const building = this.buildBundle(options);
      this._bundles[optionsJson] = building;
      return building;
    };

    if (optionsJson in this._bundles) {
      return this._bundles[optionsJson].then(bundle => {
        const deps = bundleDeps.get(bundle);
        // $FlowFixMe(>=0.37.0)
        const dependencyPairs = deps.dependencyPairs,files = deps.files,idToIndex = deps.idToIndex,outdated = deps.outdated;
        if (outdated.size) {

          const updatingExistingBundleLogEntry =
          log(createActionStartEntry({
            action_name: 'Updating existing bundle',
            outdated_modules: outdated.size }));


          debug('Attempt to update existing bundle');

          // $FlowFixMe(>=0.37.0)
          deps.outdated = new Set();const

          platform = options.platform,dev = options.dev,minify = options.minify,hot = options.hot;

          // Need to create a resolution response to pass to the bundler
          // to process requires after transform. By providing a
          // specific response we can compute a non recursive one which
          // is the least we need and improve performance.
          const bundlePromise = this._bundles[optionsJson] =
          Promise.all([
          this.getDependencies({
            platform, dev, hot, minify,
            entryFile: options.entryFile,
            recursive: false }),

          Promise.all(Array.from(outdated, this.getModuleForPath, this))]).
          then((_ref6) => {var _ref7 = _slicedToArray(_ref6, 2);let response = _ref7[0],changedModules = _ref7[1];
            debug('Update bundle: rebuild shallow bundle');

            changedModules.forEach(m => {
              response.setResolvedDependencyPairs(
              m,
              /* $FlowFixMe: should be enforced not to be null. */
              dependencyPairs.get(m.path),
              { ignoreFinalized: true });

            });

            return this.buildBundle(_extends({},
            options, {
              resolutionResponse: response.copy({
                dependencies: changedModules }) })).

            then(updateBundle => {
              const oldModules = bundle.getModules();
              const newModules = updateBundle.getModules();
              for (let i = 0, n = newModules.length; i < n; i++) {
                const moduleTransport = newModules[i];const
                meta = moduleTransport.meta,sourcePath = moduleTransport.sourcePath;
                if (outdated.has(sourcePath)) {
                  /* $FlowFixMe: `meta` could be empty */
                  if (!contentsEqual(meta.dependencies, new Set(files.get(sourcePath)))) {
                    // bail out if any dependencies changed
                    return Promise.reject(Error(
                    `Dependencies of ${sourcePath} changed from [${
                    /* $FlowFixMe: `get` can return empty */
                    files.get(sourcePath).join(', ')
                    }] to [${
                    /* $FlowFixMe: `meta` could be empty */
                    meta.dependencies.join(', ')
                    }]`));

                  }

                  oldModules[idToIndex.get(moduleTransport.id)] = moduleTransport;
                }
              }

              bundle.invalidateSource();

              log(createActionEndEntry(updatingExistingBundleLogEntry));

              debug('Successfully updated existing bundle');
              return bundle;
            });
          }).catch(e => {
            debug('Failed to update existing bundle, rebuilding...', e.stack || e.message);
            return bundleFromScratch();
          });
          return this._reportBundlePromise(buildID, options, bundlePromise);
        } else {
          debug('Using cached bundle');
          return bundle;
        }
      });
    }

    return this._reportBundlePromise(buildID, options, bundleFromScratch());
  }

  processRequest(
  req,
  res,
  next)
  {
    const urlObj = url.parse(req.url, true);const
    host = req.headers.host;
    debug(`Handling request: ${host ? 'http://' + host : ''}${req.url}`);
    /* $FlowFixMe: Could be empty if the URL is invalid. */
    const pathname = urlObj.pathname;

    let requestType;
    if (pathname.match(/\.bundle$/)) {
      requestType = 'bundle';
    } else if (pathname.match(/\.map$/)) {
      requestType = 'map';
    } else if (pathname.match(/\.assets$/)) {
      requestType = 'assets';
    } else if (pathname.match(/^\/debug/)) {
      this._processDebugRequest(req.url, res);
      return;
    } else if (pathname.match(/^\/onchange\/?$/)) {
      this._processOnChangeRequest(req, res);
      return;
    } else if (pathname.match(/^\/assets\//)) {
      this._processAssetsRequest(req, res);
      return;
    } else if (pathname === '/symbolicate') {
      this._symbolicate(req, res);
      return;
    } else {
      next();
      return;
    }

    const options = this._getOptionsFromUrl(req.url);
    const requestingBundleLogEntry =
    log(createActionStartEntry({
      action_name: 'Requesting bundle',
      bundle_url: req.url,
      entry_point: options.entryFile }));


    const buildID = this.getNewBuildID();
    let reportProgress = emptyFunction;
    if (!this._opts.silent) {
      reportProgress = (transformedFileCount, totalFileCount) => {
        this._reporter.update({
          buildID,
          type: 'bundle_transform_progressed',
          transformedFileCount,
          totalFileCount });

      };
    }

    const mres = MultipartResponse.wrap(req, res);
    options.onProgress = (done, total) => {
      reportProgress(done, total);
      mres.writeChunk({ 'Content-Type': 'application/json' }, JSON.stringify({ done, total }));
    };

    debug('Getting bundle for request');
    const building = this.useCachedOrUpdateOrCreateBundle(buildID, options);
    building.then(
    p => {
      if (requestType === 'bundle') {
        debug('Generating source code');
        const bundleSource = p.getSource({
          inlineSourceMap: options.inlineSourceMap,
          minify: options.minify,
          dev: options.dev });

        debug('Writing response headers');
        const etag = p.getEtag();
        mres.setHeader('Content-Type', 'application/javascript');
        mres.setHeader('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
          debug('Responding with 304');
          mres.writeHead(304);
          mres.end();
        } else {
          mres.end(bundleSource);
        }
        debug('Finished response');
        log(createActionEndEntry(requestingBundleLogEntry));
      } else if (requestType === 'map') {
        const sourceMap = p.getSourceMapString({
          minify: options.minify,
          dev: options.dev });


        mres.setHeader('Content-Type', 'application/json');
        mres.end(sourceMap);
        log(createActionEndEntry(requestingBundleLogEntry));
      } else if (requestType === 'assets') {
        const assetsList = JSON.stringify(p.getAssets());
        mres.setHeader('Content-Type', 'application/json');
        mres.end(assetsList);
        log(createActionEndEntry(requestingBundleLogEntry));
      }
    },
    error => this._handleError(mres, this.optionsHash(options), error)).
    catch(error => {
      process.nextTick(() => {
        throw error;
      });
    });
  }

  _symbolicate(req, res) {
    const symbolicatingLogEntry =
    log(createActionStartEntry('Symbolicating'));

    debug('Start symbolication');

    /* $FlowFixMe: where is `rowBody` defined? Is it added by
                                   * the `connect` framework? */
    Promise.resolve(req.rawBody).then(body => {
      const stack = JSON.parse(body).stack;

      // In case of multiple bundles / HMR, some stack frames can have
      // different URLs from others
      const urls = new Set();
      stack.forEach(frame => {
        const sourceUrl = frame.file;
        // Skip `/debuggerWorker.js` which drives remote debugging because it
        // does not need to symbolication.
        // Skip anything except http(s), because there is no support for that yet
        if (!urls.has(sourceUrl) &&
        !sourceUrl.endsWith('/debuggerWorker.js') &&
        sourceUrl.startsWith('http')) {
          urls.add(sourceUrl);
        }
      });

      const mapPromises =
      Array.from(urls.values()).map(this._sourceMapForURL, this);

      debug('Getting source maps for symbolication');
      return Promise.all(mapPromises).then(maps => {
        debug('Sending stacks and maps to symbolication worker');
        const urlsToMaps = zip(urls.values(), maps);
        return this._symbolicateInWorker(stack, urlsToMaps);
      });
    }).then(
    stack => {
      debug('Symbolication done');
      res.end(JSON.stringify({ stack }));
      process.nextTick(() => {
        log(createActionEndEntry(symbolicatingLogEntry));
      });
    },
    error => {
      console.error(error.stack || error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
    });

  }

  _sourceMapForURL(reqUrl) {
    const options = this._getOptionsFromUrl(reqUrl);
    // We're not properly reporting progress here. Reporting should be done
    // from within that function.
    const building = this.useCachedOrUpdateOrCreateBundle(
    this.getNewBuildID(),
    options);

    return building.then(p => p.getSourceMap({
      minify: options.minify,
      dev: options.dev }));

  }

  _handleError(res, bundleID, error)






  {
    res.writeHead(error.status || 500, {
      'Content-Type': 'application/json; charset=UTF-8' });


    if (error instanceof Error && (
    error.type === 'TransformError' ||
    error.type === 'NotFoundError' ||
    error.type === 'UnableToResolveError'))
    {
      error.errors = [{
        description: error.description,
        filename: error.filename,
        lineNumber: error.lineNumber }];

      res.end(JSON.stringify(error));

      if (error.type === 'NotFoundError') {
        delete this._bundles[bundleID];
      }
      this._reporter.update({ error, type: 'bundling_error' });
    } else {
      console.error(error.stack || error);
      res.end(JSON.stringify({
        type: 'InternalError',
        message: 'react-packager has encountered an internal error, ' +
        'please check your terminal error output for more details' }));

    }
  }

  _getOptionsFromUrl(reqUrl) {
    // `true` to parse the query param as an object.
    const urlObj = url.parse(reqUrl, true);

    /* $FlowFixMe: `pathname` could be empty for an invalid URL */
    const pathname = decodeURIComponent(urlObj.pathname);

    // Backwards compatibility. Options used to be as added as '.' to the
    // entry module name. We can safely remove these options.
    const entryFile = pathname.replace(/^\//, '').split('.').filter(part => {
      if (part === 'includeRequire' || part === 'runModule' ||
      part === 'bundle' || part === 'map' || part === 'assets') {
        return false;
      }
      return true;
    }).join('.') + '.js';

    // try to get the platform from the url
    /* $FlowFixMe: `query` could be empty for an invalid URL */
    const platform = urlObj.query.platform ||
    parsePlatformFilePath(pathname, this._platforms).platform;

    /* $FlowFixMe: `query` could be empty for an invalid URL */
    const assetPlugin = urlObj.query.assetPlugin;
    const assetPlugins = Array.isArray(assetPlugin) ?
    assetPlugin :
    typeof assetPlugin === 'string' ? [assetPlugin] : [];

    const dev = this._getBoolOptionFromQuery(urlObj.query, 'dev', true);
    const minify = this._getBoolOptionFromQuery(urlObj.query, 'minify', false);
    return {
      sourceMapUrl: url.format({
        hash: urlObj.hash,
        pathname: pathname.replace(/\.bundle$/, '.map'),
        query: urlObj.query,
        search: urlObj.search }),

      entryFile,
      dev,
      minify,
      hot: this._getBoolOptionFromQuery(urlObj.query, 'hot', false),
      runBeforeMainModule: defaults.runBeforeMainModule,
      runModule: this._getBoolOptionFromQuery(urlObj.query, 'runModule', true),
      inlineSourceMap: this._getBoolOptionFromQuery(
      urlObj.query,
      'inlineSourceMap',
      false),

      isolateModuleIDs: false,
      platform,
      resolutionResponse: null,
      entryModuleOnly: this._getBoolOptionFromQuery(
      urlObj.query,
      'entryModuleOnly',
      false),

      generateSourceMaps:
      minify || !dev || this._getBoolOptionFromQuery(urlObj.query, 'babelSourcemap', false),
      assetPlugins,
      onProgress: null,
      unbundle: false };

  }

  _getBoolOptionFromQuery(query, opt, defaultVal) {
    /* $FlowFixMe: `query` could be empty when it comes from an invalid URL */
    if (query[opt] == null) {
      return defaultVal;
    }

    return query[opt] === 'true' || query[opt] === '1';
  }

  getNewBuildID() {
    return (this._nextBundleBuildID++).toString(36);
  }}





Server.DEFAULT_BUNDLE_OPTIONS = {
  assetPlugins: [],
  dev: true,
  entryModuleOnly: false,
  generateSourceMaps: false,
  hot: false,
  inlineSourceMap: false,
  isolateModuleIDs: false,
  minify: false,
  onProgress: null,
  resolutionResponse: null,
  runBeforeMainModule: defaults.runBeforeMainModule,
  runModule: true,
  sourceMapUrl: null,
  unbundle: false };


function contentsEqual(array, set) {
  return array.length === set.size && array.every(set.has, set);
}

function* zip(xs, ys) {
  //$FlowIssue #9324959
  const ysIter = ys[Symbol.iterator]();
  for (const x of xs) {
    const y = ysIter.next();
    if (y.done) {
      return;
    }
    yield [x, y.value];
  }
}

module.exports = Server;