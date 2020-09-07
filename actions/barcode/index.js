/*
 * Copyright 2020 Adobe Inc. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const { Core } = require('@adobe/aio-sdk');
const { errorResponse, stringParameters, checkMissingRequestInputs } = require('../utils');
const bwipjs = require('bwip-js');

// main function that will be executed by Adobe I/O Runtime
async function main (params) {
  // create a Logger
  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

  try {
    // 'info' is the default level if not set
    logger.info('Calling the main action');

    // log parameters, only if params.LOG_LEVEL === 'debug'
    logger.debug(stringParameters(params));

    // check for missing request input parameters and headers
    const requiredParams = ['value'];
    const errorMessage = checkMissingRequestInputs(params, requiredParams);
    if (errorMessage) {
      // return and log client errors
      return errorResponse(400, errorMessage, logger);
    }
  
    const buffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: params.value,
      scale: 3,
      height: 10,
      includetext: false,
      backgroundcolor: 'ffffff'
    });
    
    return {
      headers: { 'Content-Type': 'image/png' },
      statusCode: 200,
      body: buffer.toString('base64')
    };
  } catch (error) {
    // log any server errors
    logger.error(error);
    // return with 500
    return errorResponse(500, error.message, logger);
  }
}

exports.main = main;
