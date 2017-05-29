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
 * Created by diugalde on 24/08/16.
 */

const bunyan = require('bunyan');
const jsonStableStringify = require('json-stable-stringify');
const restify = require('restify');

const authService = require('./services/services').authService;
const errorHandler = require('./support/error_handler');
const config = require('./config');
const controllers = require('./controllers/controllers');
const log = require('./utils/log');
const odb = require('./db/odb');
const urlUtils = require('./utils/url_utils');

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
        let requestURL = urlUtils.generateFullURL(headers.host, req.url);
        let method = req.method.toLowerCase();

        let jsonBody = '';
        if (method === 'post' || method === 'put' || method === 'patch') {
            jsonBody = jsonStableStringify(req.body).replace(/[ \n]/g, "");
        }
        authService.authenticate(headers, method, requestURL, jsonBody).then(function (res) {
            if (res) {
                next();
            } else {
                let customErr = errorHandler.createError('CustomUnauthorizedError');
                req.log.info('Unauthorized request.');
                next(errorHandler.getApiError(customErr, req._id))
            }
        })
    } catch (err) {
        req.log.error('There was an error during authentication: \n', err);
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
    server.use(authFilter);

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

    let apiPath = config.server.apiURL;

    let curriculaBasePath = `${apiPath}/curricula`;

    let learningObjectivesBasePath = `${apiPath}/learningObjectives`;

    let learningObjectsBasePath = `${apiPath}/learningObjects`;

    // Routes for curriculum.
    server.get(`${curriculaBasePath}/:id`, controllers.curriculumController.findById);
    server.get(`${curriculaBasePath}/:id/linkedLearningObjectives`, controllers.curriculumController.findLinkedLearningObjectives);
    server.get(curriculaBasePath, controllers.curriculumController.findAll);
    server.post(curriculaBasePath, controllers.curriculumController.insert);
    server.put(`${curriculaBasePath}/:id`, controllers.curriculumController.update);
    server.del(`${curriculaBasePath}/:id`, controllers.curriculumController.remove);
    server.get(`${learningObjectivesBasePath}/curricula`, controllers.curriculumController.findByLearningObjective);

    // Routes for curriculum's folder, subFolders and learningObjects.
    server.get(`${curriculaBasePath}/:curriculumId/folders/path`, controllers.folderController.findByPath);
    server.get(`${curriculaBasePath}/:curriculumId/folders/path/.*`, controllers.folderController.findByPath);
    server.post(`${curriculaBasePath}/:curriculumId/folders/path`, controllers.folderController.insertForce);
    server.post(`${curriculaBasePath}/:curriculumId/folders/path/.*`, controllers.folderController.insertForce);
    server.put(`${curriculaBasePath}/:curriculumId/folders/path/.*`, controllers.folderController.update);
    server.del(`${curriculaBasePath}/:curriculumId/folders/path/.*`, controllers.folderController.remove);

    // Routes for performing sync operations on learningObjects.
    server.put(`${learningObjectsBasePath}/:id`, controllers.learningObjectController.updateSync);
    server.del(`${learningObjectsBasePath}/:id`, controllers.learningObjectController.removeSync);
}


module.exports = {createServer};
