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

const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');

const APP_NAME = 'cl-curricula';

// Init bunyan log with a nice output format.
var bunyanFormatStdOut = bunyanFormat({ outputMode: 'short' });

var log = bunyan.createLogger({
    name: APP_NAME,
    streams: [
        { level: "info", path: 'cl-curricula.log'},
        { level: "info", stream: bunyanFormatStdOut }
    ]
});

module.exports = log;
