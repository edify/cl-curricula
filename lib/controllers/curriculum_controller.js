/**
 * Created by diugalde on 08/09/16.
 */

const assertionHelper = require('../utils/assertion_helper');

var curriculumController = {

    findById(req, res, next) {
        try {
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    findAll(req, res, next) {
        try {
            let from = Number(req.query.from);
            let size = Number(req.query.size);
            let all = Boolean(req.query.all);
            assertionHelper.findAllParams(from, size, all);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    insert(req, res, next) {
        try {
            assertionHelper.curriculum(req.body);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }

    },

    update(req, res, next) {
        try {
            assertionHelper.curriculum(req.body);
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    delete(req, res, next) {
        try {
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    findLearningObjectives(req, res, next) {
        try {
            res.json({})
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    }
};


module.exports = Object.create(curriculumController);

