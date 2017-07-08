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

const fs = require('fs');
const mkdirp = require('mkdirp');var _require =

require('path');const dirname = _require.dirname;
















function wrapWorkerFn(
workerFunction)
{
  return (
  infile,
  outfile,
  options,
  callback) =>
  {
    const contents = fs.readFileSync(infile);
    workerFunction(contents, options, (error, result) => {
      if (error) {
        callback(error);
        return;
      }

      try {
        mkdirp.sync(dirname(outfile));
        fs.writeFileSync(outfile, JSON.stringify(result), 'utf8');
      } catch (writeError) {
        callback(writeError);
        return;
      }

      callback(null);
    });
  };
}

module.exports = wrapWorkerFn;