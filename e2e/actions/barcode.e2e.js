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

const { Config } = require('@adobe/aio-sdk').Core;
const fs = require('fs');
const fetch = require('node-fetch');
const barcodeReader = require('javascript-barcode-reader');

// get action url
const namespace = Config.get('runtime.namespace');
const hostname = Config.get('cna.hostname') || 'adobeioruntime.net';
const packageJSON = JSON.parse(fs.readFileSync('package.json').toString());
const runtimePackage = `${packageJSON.name}-${packageJSON.version}`;
const actionUrl = `https://${namespace}.${hostname}/api/v1/web/${runtimePackage}/barcode`;

test('returns a 400 when missing value parameter', async () => {
  const res = await fetch(actionUrl);
  expect(res).toEqual(expect.objectContaining({
    status: 400
  }));
  const body = await res.json();
  expect(body).toEqual(expect.objectContaining({
    error: 'missing parameter(s) \'value\''
  }));
});

test('returns a barcode for the provided value parameter', async () => {
  const param = 'value';
  const res = await fetch(`${actionUrl}?value=${param}`);
  expect(res).toEqual(expect.objectContaining({
    status: 200
  }));
  expect(res.headers.get('content-type')).toEqual('image/png');
  
  const buffer = await res.buffer();
  const barcode = `${__dirname}/barcode.png`;
  fs.writeFile(barcode, buffer);
  
  const value = await barcodeReader({
    image: barcode,
    barcode: 'code-128'
  });
  
  expect(value).toEqual(param);
  
  fs.unlinkSync(barcode);
});
