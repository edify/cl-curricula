/**
 * Created by diugalde on 12/09/16.
 */

const _ = require('lodash');
const url = require('url');

const assertionHelper = require('../utils/assertion_helper');
const folderService = require('../services/services').folderService;

var folderController = {

    findByPath(req, res, next) {
        try {
            let queryParams, expandParam, expandFolders, expandLearningObjects;
            queryParams = url.parse(req.url, true).query;

            if (queryParams.expand) {
                expandParam = queryParams.expand.split(',');
                expandFolders = _.includes(expandParam, 'folders');
                expandLearningObjects = _.includes(expandParam, 'learningObjects');
            }

            let currId = req.params.curriculumId;
            let folderPath = _getFolderPathArray(req.url);

            folderService.findByPath(currId, folderPath, expandFolders, expandLearningObjects).then(function(result) {
                res.json(_filterFolderFields(result))
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            })
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    update(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let folderPath = _getFolderPathArray(req.url);
            assertionHelper.folder(req.body);
            folderService.update(currId, folderPath, req.body).then(function(result) {
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

    delete(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let folderPath = _getFolderPathArray(req.url);
            folderService.delete(currId, folderPath).then(function(result) {
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

    insert(req, res, next) {
        try {
            let currId = req.params.curriculumId;
            let folderPath = _getFolderPathArray(req.url);
            assertionHelper.folder(req.body);
            folderService.insert(currId, folderPath, req.body).then(function(result) {
                res.json(_filterFolderFields(result))
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

function _getFolderPathArray(reqURL) {
    let curriculaPath = reqURL.split('?')[0].substring(reqURL.indexOf('/curricula')+1);
    let splitPath = curriculaPath.split('/');
    if (splitPath.length <= 3) {
        return []
    } else {
        return _.slice(splitPath, 3)
    }
}

function _filterFolderFields(folder) {
    let filteredFolder = {
        id: folder.id,
        name: folder.name
    };
    if (folder.folders) {
        filteredFolder.folders = _.map(folder.folders, _filterFolderFields);
    }
    if (folder.learningObjects) {
        filteredFolder.learningObjects = _.map(folder.learningObjects, _filterLOFields);
    }
    return filteredFolder
}

function _filterLOFields(learningObject) {
    return {
        id: learningObject.id,
        name: learningObject.name,
        title: learningObject.title,
        url: learningObject.url,
        contentUrl: learningObject.contentUrl,
        learningObjectives: learningObject.learningObjectives
    }
}

module.exports = Object.create(folderController);

