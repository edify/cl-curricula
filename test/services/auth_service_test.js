/**
 * Created by diugalde on 19/09/16.
 */

const assert = require('assert');
const chai = require('chai');
const proxyquire = require('proxyquire').noCallThru();;
const sinon = require('sinon');

var logMock = {};

//const apiKeyService = proxyquire('../../../cl-auth/cl-auth-js/lib/services/api_key_service');
var authService = proxyquire('../../lib/services/auth_service', {'log': logMock});
/*
logMock.info = function(msg) {
    console.log('JAMAS ', msg);
};


// Mock definitions.

const redisMock = {
    createClient(port) {}
};



const redisClientMock = {
    hgetAsync(apiKeyId, apiSecretKey) {
        return Promise.resolve('LN2qSArEGS3kI0CKGLNwM4T0neC9H6PALtb3yr9vGD3ep1ljviTsaEFD44Ti4TlT')
    }
};


// Set mocks using rewire set function.
//apiKeyService.__set__("redis", redisMock);
//apiKeyService.redisClient = redisClientMock;
//apiKeyService.passphrase = 'holacomoestas';


authService.f();*/


describe('Incoming request authentication', function() {

    it('Should return true when the authorization header is valid', function(done) {

        let authHeader = 'SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160913/SwXjqNYRao0FVnx/sauthc1_request, ' +
                         'sauthc1SignedHeaders=host;x-stormpath-date, ' +
                         'sauthc1Signature=b1b5498294187cb1e14fbf222f795edc7a37a4db8b2f018d6d3b85b2c1e81d69';

        let dateHeader = '20160913T170507Z';

        let headers = {};
        headers['authorization'] = authHeader;
        headers['x-stormpath-date'] = dateHeader;

        let method = 'get';
        let requestURL = 'http://localhost:8080/api/v1/linkedlearningobjects?all=true&from=0&size=1&name=Non%20existing%20name';
        let body = '';

        authService.authenticate(headers, method, requestURL, body).then(function(authorized) {
            assert.ok(authorized);
            done()
        });


    });

    it('Should return false when the authorization header is invalid', function(done) {
        let authHeader = 'SAuthc1 sauthc1Id=5chg4d6a3bdc68ffb02e3ce309964ac558/20160913/SwXjqNYRao0FVnx/sauthc1_request, ' +
                         'sauthc1SignedHeaders=host;x-stormpath-date, ' +
                         'sauthc1Signature=b1b5498294187cb1e14fbf222f795edc7a37a4db8b2f018d6d3b85b2c1e81d69';

        let dateHeader = '20160913T111111Z';

        let headers = {};
        headers['authorization'] = authHeader;
        headers['x-stormpath-date'] = dateHeader;

        let method = 'get';
        let requestURL = 'http://localhost:8080/api/v1/linkedlearningobjects?all=true&from=0&size=1&name=Non%20existing%20name';
        let body = '';

        authService.authenticate(headers, method, requestURL, body).then(function(authorized) {
            assert.equal(authorized, false);
            done()
        });

    });

});

