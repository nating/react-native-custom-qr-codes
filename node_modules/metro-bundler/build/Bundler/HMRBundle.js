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

'use strict';var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};

const BundleBase = require('./BundleBase');
const ModuleTransport = require('../lib/ModuleTransport');






class HMRBundle extends BundleBase {





  constructor(_ref)





  {let sourceURLFn = _ref.sourceURLFn,sourceMappingURLFn = _ref.sourceMappingURLFn;
    super();
    this._sourceURLFn = sourceURLFn;
    this._sourceMappingURLFn = sourceMappingURLFn;
    this._sourceURLs = [];
    this._sourceMappingURLs = [];
  }

  addModule(
  /* $FlowFixMe: broken OOP design: function signature should be the same */
  resolver,
  /* $FlowFixMe: broken OOP design: function signature should be the same */
  response,
  /* $FlowFixMe: broken OOP design: function signature should be the same */
  module,
  /* $FlowFixMe: broken OOP design: function signature should be the same */
  moduleTransport)
  {
    const code = resolver.resolveRequires(
    response,
    module,
    moduleTransport.code,
    /* $FlowFixMe: may not exist */
    moduleTransport.meta.dependencyOffsets);


    super.addModule(new ModuleTransport(_extends({}, moduleTransport, { code })));
    this._sourceMappingURLs.push(
    this._sourceMappingURLFn(moduleTransport.sourcePath));

    this._sourceURLs.push(this._sourceURLFn(moduleTransport.sourcePath));
    // inconsistent with parent class return type
    return Promise.resolve();
  }

  getModulesIdsAndCode() {
    return this.__modules.map(module => {
      return {
        id: JSON.stringify(module.id),
        code: module.code };

    });
  }

  getSourceURLs() {
    return this._sourceURLs;
  }

  getSourceMappingURLs() {
    return this._sourceMappingURLs;
  }}


module.exports = HMRBundle;