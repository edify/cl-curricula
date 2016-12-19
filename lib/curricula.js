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
 * Created by diugalde on 14/09/16.
 */


const app = require('./app');
const config = require('./config');
const log = require('./utils/log');


function main() {
    log.info('Starting cl-curricula micro service...');

    var server = app.createServer({
        log: log,
        audit: config.server.audit
    });

    server.listen(config.server.port, function onListening() {
        log.info('Server listening at %s', 'localhost:' + config.server.port);
    });
}


module.exports = {
    main: main
};
