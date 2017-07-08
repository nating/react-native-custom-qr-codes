/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};

const JsFileWrapping = require('./JsFileWrapping');

const asyncify = require('async/asyncify');
const collectDependencies = require('./collect-dependencies');
const defaults = require('../../defaults');
const docblock = require('../../node-haste/DependencyGraph/docblock');
const generate = require('./generate');
const path = require('path');
const series = require('async/series');var _require =

require('path');const basename = _require.basename;


















const defaultTransformOptions = {
  dev: true,
  generateSourceMaps: true,
  hot: false,
  inlineRequires: false,
  platform: '',
  projectRoot: '' };

const defaultVariants = { default: {} };

const ASSET_EXTENSIONS = new Set(defaults.assetExts);

function transformModule(
content,
options,
callback)
{
  if (ASSET_EXTENSIONS.has(path.extname(options.filename).substr(1))) {
    transformAsset(content, options, callback);
    return;
  }

  const code = content.toString('utf8');
  if (options.filename.endsWith('.json')) {
    transformJSON(code, options, callback);
    return;
  }const

  filename = options.filename,transformer = options.transformer;var _options$variants = options.variants;const variants = _options$variants === undefined ? defaultVariants : _options$variants;
  const tasks = {};
  Object.keys(variants).forEach(name => {
    tasks[name] = asyncify(() =>
    transformer.transform({
      filename,
      localPath: filename,
      options: _extends({}, defaultTransformOptions, variants[name]),
      src: code }));


  });

  series(tasks, (error, results) => {
    if (error) {
      callback(error);
      return;
    }

    const transformed = {};

    //$FlowIssue #14545724
    Object.entries(results).forEach((_ref) => {var _ref2 = _slicedToArray(_ref, 2);let key = _ref2[0],value = _ref2[1];
      transformed[key] = makeResult(
      value.ast,
      filename,
      code,
      options.polyfill);

    });

    const annotations = docblock.parseAsObject(docblock.extract(code));

    callback(null, {
      type: 'code',
      details: {
        assetContent: null,
        code,
        file: filename,
        hasteID: annotations.providesModule || null,
        transformed,
        type: options.polyfill ? 'script' : 'module' } });


  });
  return;
}

function transformJSON(json, options, callback) {
  const value = JSON.parse(json);const
  filename = options.filename;
  const code = `__d(function(${JsFileWrapping.MODULE_FACTORY_PARAMETERS.join(', ')}) { module.exports = \n${json}\n});`;

  const moduleData = {
    code,
    map: null, // no source map for JSON files!
    dependencies: [] };

  const transformed = {};

  Object.keys(options.variants || defaultVariants).forEach(
  key => transformed[key] = moduleData);


  const result = {
    assetContent: null,
    code: json,
    file: filename,
    hasteID: value.name,
    transformed,
    type: 'module' };


  if (basename(filename) === 'package.json') {
    result.package = {
      name: value.name,
      main: value.main,
      browser: value.browser,
      'react-native': value['react-native'] };

  }
  callback(null, { type: 'code', details: result });
}

function transformAsset(
content,
options,
callback)
{
  callback(null, {
    details: {
      assetContentBase64: content.toString('base64'),
      filePath: options.filename },

    type: 'asset' });

}

function makeResult(ast, filename, sourceCode) {let isPolyfill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  let dependencies, dependencyMapName, file;
  if (isPolyfill) {
    dependencies = [];
    file = JsFileWrapping.wrapPolyfill(ast);
  } else {var _collectDependencies =
    collectDependencies(ast);dependencies = _collectDependencies.dependencies;dependencyMapName = _collectDependencies.dependencyMapName;
    file = JsFileWrapping.wrapModule(ast, dependencyMapName);
  }

  const gen = generate(file, filename, sourceCode);
  return { code: gen.code, map: gen.map, dependencies, dependencyMapName };
}

module.exports = transformModule;