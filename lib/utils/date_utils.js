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

/**
 * Creates a new date object from a timestamp string (it must have this format: yyyyMMddTHHmmssZ
 * The date will be in UTC.
 *
 * @param timestamp - string.
 * @return date
 */
function parseDateFormat(timestamp) {
    if (timestamp.length !== 16) {
        return ''
    }
    let year = timestamp.substr(0, 4);
    let month = parseInt(timestamp.substr(4, 2))-1;
    let day = timestamp.substr(6, 2);
    let hours = timestamp.substr(9, 2);
    let minutes = timestamp.substr(11, 2);
    let seconds = timestamp.substr(13, 2);

    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

module.exports = {
    parseDateFormat
};
