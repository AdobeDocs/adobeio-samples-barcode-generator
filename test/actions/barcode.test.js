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
const bwipjs = require('bwip-js');
const action = require('./../../actions/barcode/index.js');

jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn()
  }
}));

const mockLoggerInstance = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn()
};
Core.Logger.mockReturnValue(mockLoggerInstance);

jest.mock('bwip-js');

beforeEach(() => {
  Core.Logger.mockClear();
  mockLoggerInstance.info.mockReset();
  mockLoggerInstance.debug.mockReset();
  mockLoggerInstance.error.mockReset();
});

const params = {
  value: 'test'
};

describe('barcode', () => {
  test('main should be defined', () => {
    expect(action.main).toBeInstanceOf(Function);
  });
  
  test('should set logger to use LOG_LEVEL param', async () => {
    await action.main({
      LOG_LEVEL: 'level'
    });
    expect(Core.Logger).toHaveBeenCalledWith(expect.any(String), { level: 'level' });
  });
  
  test('should return a 200 http response', async () => {
    bwipjs.toBuffer.mockResolvedValue('barcode');
    
    const response = await action.main(params);
    expect(response.statusCode).toEqual(200);
    expect(response.headers['Content-Type']).toEqual('image/png');
    expect(response.body).toEqual('barcode');
  });
  
  test('if there is an error should return a 500 and log the error', async () => {
    const error = new Error('barcode error');
    bwipjs.toBuffer.mockRejectedValue(error);
    
    const response = await action.main(params);
    expect(response).toEqual({
      error : {
        statusCode: 500,
        body: { error: 'barcode error' }
      }
    });
    expect(mockLoggerInstance.error).toHaveBeenCalledWith(error);
  });
  
  test('missing input request parameters, should return 400', async () => {
    const response = await action.main({});
    expect(response).toEqual({
      error: {
        statusCode: 400,
        body: { error: 'missing parameter(s) \'value\'' }
      }
    })
  });
});

