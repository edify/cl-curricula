/**
 * Created by diugalde on 08/09/16.
 */

const bunyan = require('bunyan');

const config = require('../config');

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
    parseDateFormat: parseDateFormat,
    generateFullURL: generateFullURL
};