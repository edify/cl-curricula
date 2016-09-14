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
        audit: true,
        testing: false
    });

    server.listen(config.server.port, function onListening() {
        log.info('Server listening at %s', 'localhost:' + config.server.port);
    });
}


module.exports = {
    main: main
};
