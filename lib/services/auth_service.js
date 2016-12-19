/*
 * Copyright 2016 Edify Software Consulting.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


 /**
 * Created by diugalde on 08/09/16.
 */


const apiKeyService = require('cl-auth-js').apiKeyService;
const config = require('../config');
const dateUtils = require('../utils/date_utils');
const log = require('../utils/log');
const sauthc1Signer = require('cl-auth-js').sauthc1;


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
            let date = dateUtils.parseDateFormat(timestamp);

            return apiKeyService.getApiSecretKey(apiKeyId).then(function(secret) {
                let credentials = {apiKeyId: apiKeyId, apiSecretKey: secret};
                let calcAuthHeader = sauthc1Signer.sign({}, method, requestURL, body, date, credentials, nonce);
                let authorized = authHeader === calcAuthHeader;
                return Promise.resolve(authorized);
            }).catch(function(err) {
                log.info('There was an error during authentication: \n', err);
                return Promise.resolve(false);
            });
        } catch(err) {
            log.info('There was an error during authentication: \n', err);
            return Promise.resolve(false);
        }
    }
};


module.exports = Object.create(authService);
