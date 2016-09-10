/**
 * Created by diugalde on 24/08/16.
 */

const bunyan = require('bunyan');
const restify = require('restify');

const authService = require('./services/services').authService;
const errorHandler = require('./support/error_handler');
const config = require('./config');
const controllers = require('./controllers/controllers');
const log = require('./utils/log');
const utils = require('./utils/utils');

/**
 * Check if the incoming request has a correct authorization header.
 * If the signatures are not the same, a 401 error is returned.
 *
 * @param req
 * @param res
 * @param next
 */
function authFilter(req, res, next) {
    try {
        req.log.info('Authenticating request...');
        let headers = req.headers;
        let requestURL = utils.generateFullURL(headers.host, req.url);
        let method = req.method.toLowerCase();

        let jsonBody = '';
        if (method === 'post' || method === 'put' || method === 'patch') {
            jsonBody = JSON.stringify(req.body);
        }
        throw 'jajaja';
        console.log(222);
        authService.authenticate(headers, method, requestURL, jsonBody).then(function (res) {
            if (res === true) {
                next();
            } else {
                next(errorHandler.createError('CustomUnauthorizedError'));
            }
        });
    } catch (err) {
        log.error('There was an error during authentication: ', err);
        next(errorHandler.createError('DefaultInternalServerError'));
    }
}

/**
 * Creates and configures a restify server.
 *
 * @param options - object.
 * @returns server
 */
function createServer(options) {

    log.info('Initializing cl-curricula server...');

    let server = restify.createServer({
        log: options.log,
        name: 'cl-curricula',
        version: '0.0.1'
    });

    // Ensure data is not dropped on uploads.
    server.pre(restify.pre.pause());

    // Clean up wrong paths.
    server.pre(restify.pre.sanitizePath());

    // Handles user agents.
    server.pre(restify.pre.userAgentConnection());

    // Set a per request bunyan logger (with requestid filled in)
    server.use(restify.requestLogger());

    // General configuration.
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser());

    // If you want to use the throttle feature. You can restrict the number of requests per second and ip.
    if (options.throttle) {
        server.use(restify.throttle({
            burst: 10,
            rate: 5,
            ip: true
        }));
    }

    // Setup an audit logger.
    if (options.audit) {
        server.on('after', restify.auditLogger({body: false, log: log}));
    }

    // Custom authentication using sauthc1.
    if (options.testing !== true) {
        server.use(authFilter);
    }

    _initRoutes(server);

    return server;
}

/**
 * Add all routes and controller handlers to the server.
 *
 * @param server - Restify server object.
 * @private
 */
function _initRoutes(server) {
    // Register a default '/' handler.
    server.get('/', function root(req, res, next) {
        var routes = ['POST /tokens', 'POST /verify'];
        var jsonResponse = {'AvailableRoutes': routes};
        res.json(jsonResponse);
        next();
    });

    // Register a default '/' handler.
    server.post('/', function root(req, res, next) {
        var routes = ['POST /tokens', 'POST /verify'];
        var jsonResponse = {'AvailableRoutes': routes};
        res.json(jsonResponse);
        next();
    });
}


module.exports = {
    createServer: createServer
};
