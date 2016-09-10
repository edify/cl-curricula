/**
 * Created by diugalde on 08/09/16.
 */

const app = require('./lib/app');
const config = require('./lib/config');
const log = require('./lib/utils/log');


(function main() {
    log.info('Starting cl-curricula micro service...');

    var server = app.createServer({
        log: log,
        apiURL: config.server.apiURL,
        audit: true,
        testing: false
    });

    server.listen(config.server.port, function onListening() {
        log.info('Server listening at %s', 'localhost:' + config.server.port);
    });
})();
