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
 * Created by diugalde on 10/10/16.
 */

const config = require('../config');

/**
 * Creates a full url with protocol, host and path.
 *
 * @param host - string (Example: localhost:8081).
 * @param path - string (Example: /learningObjectives?param1=val1).
 * @return string
 */
function generateFullURL(host, path) {
    let protocol = 'http';
    if (config.server.ssl.enabled === true) {
        protocol += 's';
    }
    let fullURL = `${protocol}://${host}${path}`;
    return fullURL
}

module.exports = {
    generateFullURL
};
