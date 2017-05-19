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
 * Created by diugalde on 12/09/16.
 */

const _ = require('lodash');
const objectReducer = require('../utils/object_reducer');
const url = require('url');

const errorHandler = require('../support/error_handler');
const folderService = require('../services/services').folderService;

var folderController = {

    /**
     * GET -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Retrieves the curriculum's item in the specified path.
     *
     * @returns JSON with LearningObject or Folder. 404 error otherwise.
     */
    findByPath(req, res, next) {
        try {
            let queryParams, expandParams;
            queryParams = url.parse(req.url, true).query;

            if (queryParams.expand) {
                expandParams = queryParams.expand.split(',');
            }

            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);

            folderService.findByPath(currId, itemPath, expandParams).then(function(result) {
                objectReducer.reduce(result);
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            })
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * POST -> Currently does not have a route.
     * Inserts a new item (folder or learning object) in the curriculum's path. If the itemPath is empty, the new
     * item will be placed in the curriculum's root folder.
     * If the path is not valid, an error will be returned.
     * req.body contains the item JSON. The application will know if its a folder or a learning object.
     *
     * @returns JSON with the inserted item. Custom error otherwise.
     */
    insert(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.insert(currId, itemPath, req.body).then(function(result) {
                if (_.isUndefined(result.errorClass)) {
                    objectReducer.reduce(result);
                    res.json(result)
                } else {
                    let customErr = errorHandler.createError(result.errorClass, result.msgArgs);
                    next(errorHandler.getApiError(customErr, req._id))
                }
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            })
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * POST -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Inserts a new item (folder or learning object) in the curriculum's path. If the itemPath is empty, the new
     * item will be placed in the curriculum's root folder.
     * If the path is not valid, all the missing folders will be created.
     * req.body contains the item JSON. The application will know if its a folder or a learning object.
     *
     * @returns JSON with the inserted item. Custom error otherwise.
     */
    insertForce(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.insertForce(currId, itemPath, req.body).then(function(result) {
                if (_.isUndefined(result.errorClass)) {
                    objectReducer.reduce(result);
                    res.json(result)
                } else {
                    let customErr = errorHandler.createError(result.errorClass, result.msgArgs);
                    next(errorHandler.getApiError(customErr, req._id))
                }
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            })
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * PUT -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Updates the curriculum's item in the specified path. req.body contains the item JSON.
     *
     * @returns JSON with the number of updated records. Custom error otherwise.
     */
    update(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.update(currId, itemPath, req.body).then(function(result) {
                if (_.isUndefined(result.errorClass)) {
                    res.json(result)
                } else {
                    let customErr = errorHandler.createError(result.errorClass, result.msgArgs);
                    next(errorHandler.getApiError(customErr, req._id))
                }
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            })
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * DELETE -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Removes an existing curriculum's item from database (cascade removal). This method deletes learning objects and folders.
     *
     * @returns JSON with the number of deleted records. 404 error otherwise.
     */
    remove(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.remove(currId, itemPath).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            })
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    }


};

/**
 * Takes the request url and returns an array containing each folder of the itemPath parameter.
 *
 * @param reqURL - string (Example: /api/v1/curricula/{curriculumId/folders/path/folder1/folder2/lo1)
 * @returns Array of strings.
 * @private
 */
function _getItemPathArray(reqURL) {
    let curriculaPath = reqURL.split('?')[0].substring(reqURL.indexOf('/curricula')+1);
    let splitPath = curriculaPath.split('/');
    if (splitPath.length <= 3) {
        return []
    } else {
        let pathArray = _.slice(splitPath, 4);
        return _.map(pathArray, decodeURIComponent)
    }
}

module.exports = Object.create(folderController);

