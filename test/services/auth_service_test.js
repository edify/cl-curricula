/**
 * Created by diugalde on 19/09/16.
 */

const assert = require('assert');
const mockRequire = require('mock-require');
const sinon = require('sinon');

// Mocking dependencies.
const apiKeyServiceMock = {getApiSecretKey: function(){}};

sinon.stub(apiKeyServiceMock, 'getApiSecretKey', function() {
    return Promise.resolve('6de725ae0e53bbfc102acdc16efd366d21f76b7d')
});

mockRequire('../../../cl-auth/cl-auth-js/lib/services/api_key_service', apiKeyServiceMock);
mockRequire('../../lib/utils/log', {info(str) {}});

// Require service that will be tested.
const authService = require('../../lib/services/auth_service');

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
        }).catch(function(err) {
            done(err)
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
        }).catch(function(err) {
            done(err)
        });
    });

});

