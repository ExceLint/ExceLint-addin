 /* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as fs from 'fs';
import * as request from 'request';
import * as rp from 'request-promise';

chai.use(chaiAsPromised);
chai.should();
let expect = chai.expect;

async function getStatusCode(file, options) {
  let fileStream = fs.createReadStream(file);
  let response = await fileStream.pipe(rp(options));
  return response.statusCode;
}

async function getServiceResponse(file, options) {
  let fileStream = fs.createReadStream(file);
  let response = await fileStream.pipe(rp(options));
  return response;
}

describe('Test service scenarios', () => {
  let baseUri = 'https://verificationservice.osi.office.net/ova/addincheckingagent.svc/api/addincheck?lang=';
  let options = {
    uri: baseUri,
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    },
    resolveWithFullResponse: true
  };
  let errors = [];
  let warnings = [];
  let infos = [];
  let supportedProducts = [];

  describe('Valid - 200', () => {
    it('should return validation passed with code 200', () => {
      let manifest = './manifest-to-test/valid_excel.xml';
      return getStatusCode(manifest, options).should.eventually.equal(200);
    });
  });
  describe('Valid - 200, Response contains property \'supportedProducts\'', () => {
    before(async () => {
      let manifest = './manifest-to-test/valid_onenote.xml';
      try {
        let response = await getServiceResponse(manifest, options);
        let formattedBody = JSON.parse(response.body.trim());
        supportedProducts = formattedBody.checkReport.details.supportedProducts;
      }
      catch (err) { }
    });
    it('should have \'supportedProducts\' and \'supportedProducts\' is an array', () => {
      expect(supportedProducts).to.exist.and.is.an('array');
    });
    it('should have \'title\' in \'supportedProducts\'', () => {
      expect(supportedProducts).to.have.deep.property('[0].title');
    });
    it('should have \'version\' in \'supportedProducts\'', () => {
      expect(supportedProducts).to.have.deep.property('[0].version');
    });
  });
  // Make sure service return consistent format.
  // TODO: This test doesn't appear to be correct. This file only contains 2 errors. 
  describe('Invalid - 200, Response contains property \'Errors\' \'Warnings\' \'Infos\'', () => {
    before(async () => {
      let manifest = './manifest-to-test/invalid_200.xml';
      try {
        let response = await getServiceResponse(manifest, options);
        let formattedBody = JSON.parse(response.body.trim());
        let validationReport = formattedBody.checkReport.validationReport;
        errors = validationReport.errors;
        warnings = validationReport.warnings;
        infos = validationReport.infos;
      }
      catch (err) { }
    });
    it('should have \'Errors\' and \'Errors\' is an array', () => {
      expect(errors).to.exist.and.is.an('array');
    });
    it('should have \'Warnings\' and \'Warnings\' is an array', () => {
      expect(warnings).to.exist.and.is.an('array');
    });
    it('should have \'Infos\' and \'Infos\' is an array', () => {
      expect(infos).to.exist.and.is.an('array');
    });
    it('should have \'title\' in \'Errors\'', () => {
      expect(errors).to.have.deep.property('[0].title');
    });
    it('should have \'detail\' in \'Errors\'', () => {
      expect(errors).to.have.deep.property('[0].detail');
    });
    it('should have \'link\' in \'Errors\'', () => {
      expect(errors).to.have.deep.property('[0].link');
    });
  });
  describe('Invalid - 400, request body is not valid xml', () => {
    it('should return validation failed with code 400', () => {
      let manifest = './manifest-to-test/invalid_400.xml';
      return getStatusCode(manifest, options).should.eventually.throw;
    });
  });
  describe('Invalid, can not find file', () => {
    it('should return validation failed', () => {
      let manifest = '';
      return getStatusCode(manifest, options).should.eventually.throw;
    });
  });
});
