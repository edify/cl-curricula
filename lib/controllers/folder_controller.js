/**
 * Created by diugalde on 12/09/16.
 */

const _ = require('lodash');

const assertionHelper = require('../utils/assertion_helper');

var folderController = {

    findByName(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    findSubFolders(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    findLearningObjects(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }

    },

    insert(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            assertionHelper.folder(req.body);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    update(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            assertionHelper.folder(req.body);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    delete(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    insertLearningObject(req, res, next) {
        try {
            let folderPath = _getFolderPathArray(req.url);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    }
};

function _getFolderPathArray(path) {
    let curriculaPath = path.substring(path.indexOf('/curricula')+1);
    let splitPath = curriculaPath.split('/');
    if (splitPath.length <= 3) {
        return []
    } else {
        return _.slice(splitPath, 3)
    }
}


module.exports = Object.create(folderController);

