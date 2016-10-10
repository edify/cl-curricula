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
