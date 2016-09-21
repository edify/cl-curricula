/**
 * Created by diugalde on 12/09/16.
 */

const _ = require('lodash');
const url = require('url');

const folderService = require('../services/services').folderService;

var folderController = {

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
    },

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
    }
};

function _getItemPathArray(reqURL) {
    let curriculaPath = reqURL.split('?')[0].substring(reqURL.indexOf('/curricula')+1);
    let splitPath = curriculaPath.split('/');
    if (splitPath.length <= 3) {
        return []
    } else {
        return _.slice(splitPath, 4)
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
        filteredFolder.learningObjects = _.map(folder.learningObjects, _filterLearningObjectFields);
    }
    return filteredFolder
}

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

function _filterLearningObjectiveFields(learningObjective) {
    return {
        name: learningObjective.name,
        url: learningObjective.url
    }
}

module.exports = Object.create(folderController);

