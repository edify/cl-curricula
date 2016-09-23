/**
 * Created by diugalde on 12/09/16.
 */

const _ = require('lodash');
const url = require('url');

const folderService = require('../services/services').folderService;

var folderController = {

    /**
     * GET -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Retrieves the curriculum's item in the specified path.
     *
     * @param req
     * @param res
     * @param next
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
                let filteredResult = result['@class'] == 'Folder' ? _filterFolderFields(result) : _filterLearningObjectFields(result);
                res.json(filteredResult)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            })
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    /**
     * POST -> Currently does not have a route.
     * Inserts a new item (folder or learning object) in the curriculum's path. If the itemPath is empty, the new
     * item will be placed in the curriculum's root folder.
     * If the path is not valid, an error will be returned.
     * req.body contains the item JSON. The application will know if its a folder or a learning object.
     *
     * @param req
     * @param res
     * @param next
     * @returns JSON with the inserted item. Custom error otherwise.
     */
    insert(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.insert(currId, itemPath, req.body).then(function(result) {
                let filteredResult = result['@class'] == 'Folder' ? _filterFolderFields(result) : _filterLearningObjectFields(result);
                res.json(filteredResult)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            })
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    /**
     * POST -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Inserts a new item (folder or learning object) in the curriculum's path. If the itemPath is empty, the new
     * item will be placed in the curriculum's root folder.
     * If the path is not valid, all the missing folders will be created.
     * req.body contains the item JSON. The application will know if its a folder or a learning object.
     *
     * @param req
     * @param res
     * @param next
     * @returns JSON with the inserted item. Custom error otherwise.
     */
    insertForce(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.insertForce(currId, itemPath, req.body).then(function(result) {
                let filteredResult = result['@class'] == 'Folder' ? _filterFolderFields(result) : _filterLearningObjectFields(result);
                res.json(filteredResult)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            })
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    /**
     * PUT -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Updates the curriculum's item in the specified path. req.body contains the item JSON.
     *
     * @param req
     * @param res
     * @param next
     * @returns JSON with the number of updated records. Custom error otherwise.
     */
    update(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.update(currId, itemPath, req.body).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            })
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    /**
     * DELETE -> /curricula/{curriculaId}/folders/path/{itemPath}
     * Removes an existing curriculum's item from database (cascade removal). This method deletes learning objects and folders.
     *
     * @param req
     * @param res
     * @param next
     * @returns JSON with the number of deleted records. 404 error otherwise.
     */
    delete(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let itemPath = _getItemPathArray(req.url);
            folderService.delete(currId, itemPath).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            })
        } catch(err) {
            req.log.info(err);
            next(err)
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
        return _.slice(splitPath, 4)
    }
}

/**
 * Private method for filtering a folder. It removes fields like @rid, @class and @type.
 *
 * @param folder
 * @returns object with the following fields: [id, name, folders, learningObjects]
 * @private
 */
function _filterFolderFields(folder) {
    let filteredFolder = {
        id: folder.id,
        name: folder.name
    };
    if (folder.folders) {
        filteredFolder.folders = _.map(folder.folders, _filterFolderFields);
    }
    if (folder.learningObjects) {
        filteredFolder.learningObjects = _.map(folder.learningObjects, _filterLearningObjectFields);
    }
    return filteredFolder
}

/**
 * Private method for filtering a learning object. It removes fields like @rid, @class and @type.
 *
 * @param learningObject
 * @returns object with the following fields: [id, name, title, url, contentUrl, learningObjectives, metadata, contents]
 * @private
 */
function _filterLearningObjectFields(learningObject) {
    let filteredLO = {
        id: learningObject.id,
        name: learningObject.name,
        title: learningObject.title,
        url: learningObject.url,
        contentUrl: learningObject.contentUrl,
        learningObjectives: _.map(learningObject.learningObjectives, _filterLearningObjectiveFields)
    };

    if (learningObject.metadata) {
        filteredLO.metadata = learningObject.metadata;
    }

    if (learningObject.contents) {
        filteredLO.contents = learningObject.contents;
    }

    return filteredLO
}

/**
 * Private method for filtering a learning objective. It removes fields like @rid, @class and @type.
 *
 * @param learningObjective
 * @returns object with the following fields: [name, url]
 * @private
 */
function _filterLearningObjectiveFields(learningObjective) {
    return {
        name: learningObjective.name,
        url: learningObjective.url
    }
}

module.exports = Object.create(folderController);

