/**
 * Created by diugalde on 08/09/16.
 */

const crypto = require('crypto');
const denodeify = require('denodeify');

const config = require('../config');
const log = require('../utils/log');
const redisClient = require('../db/redis_client');
const sauthc1Signer = require('../../../cl-auth/cl-auth-js/lib/sauthc1');
const utils = require('../utils/utils');

var authService = {

    /**
     * Compares the incoming authorization header with a new signature and returns true or false.
     *
     * @param headers - object
     * @param method - string (get, put, post, delete).
     * @param requestURL - string (Must be a full url like: http://localhost:8081/path?param1=val1)
     * @param body - object
     * @returns Promise<boolean>
     */
    authenticate(headers, method, requestURL, body) {
        try {
            let authHeader = headers['authorization'];
            let sauthId = authHeader.split(',')[0].split('=')[1];
            let nonce = sauthId.split('/')[2];
            let apiKeyId = sauthId.split('/')[0];
            let timestamp = headers['x-stormpath-date'];
            let date = utils.parseDateFormat(timestamp);

            return _getApiSecretKey(apiKeyId).then(function(secret) {
                let credentials = {apiKeyId: apiKeyId, apiSecretKey: secret};
                let calcAuthHeader = sauthc1Signer.sign({}, method, requestURL, body, date, credentials, nonce);
                let authorized = authHeader === calcAuthHeader;
                return Promise.resolve(authorized);
            }).catch(function(err) {
                log.error('There was an error during authentication: ' + err.stack);
                return Promise.resolve(false);
            });
        } catch(err) {
            log.error('There was an error during authentication: ' + err.stack);
            return Promise.resolve(false);
        }
    }
};

/**
 * Retrieves and decrypts the corresponding secret key for the given apiKeyId.
 *
 * @param apiKeyId
 * @returns promise
 * @private
 */
function _getApiSecretKey(apiKeyId) {
    return redisClient.hgetAsync(apiKeyId, 'apiSecretKey').then(function(secret) {
        return Promise.resolve(_decrypt(secret));
    }).catch(function(err) {
        return Promise.reject(err);
    });
}

/**
 * Decrypts an encrypted secret
 *
 * @param encryptedSecret the string to decrypt
 * @returns the decrypted string
 * @private
 */
function _decrypt(encryptedSecret) {
    let algorithm = 'aes-128-cbc';
    let iterations = 1024;
    let keyLength = 32;
    let passphrase = config.auth.passphrase;
    let salt = 'RwKwsDB3qUo6RD8YwHLoy+UkHTcgitWGLriAoGBXt30=';

    let pbkdf2 = denodeify(crypto.pbkdf2);
    return pbkdf2(new Buffer(passphrase), new Buffer(salt, 'base64'), iterations, keyLength, 'sha512').then(function(key) {

        var iv = key.slice(0, 16);
        var slicedKey = key.slice(16, key.length);

        var decipher = crypto.createDecipheriv(algorithm, slicedKey, iv);
        var dec = decipher.update(new Buffer(encryptedSecret, 'base64'), 'binary', 'base64');
        dec += decipher.final('base64');

        return Promise.resolve(new Buffer(dec, 'base64').toString())
    }).catch(function(err) {
        throw Promise.reject(err);
    })
}

module.exports = authService;