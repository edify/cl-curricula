/**
 * Created by diugalde on 08/09/16.
 */

const _ = require('lodash');

const assertionHelper = require('../utils/assertion_helper');
const curriculumService = require('../services/services').curriculumService;

var curriculumController = {

    findById(req, res, next) {
        try {
            curriculumService.findById(req.params.id).then(function(result) {
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

    findAll(req, res, next) {
        try {
            let from = Number(req.query.from);
            let size = Number(req.query.size);
            assertionHelper.findAllParams(from, size, req.query.all);
            let all = req.query.all === 'true';
            curriculumService.findAll(from, size, all).then(function(result) {
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
            assertionHelper.curriculum(req.body);
            curriculumService.insert(req.body).then(function(curriculum) {
                res.json(_filterCurriculumFields(curriculum))
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            });
        } catch(err) {
            req.log.info(err);
            next(err)
        }

    },

    update(req, res, next) {
        try {
            assertionHelper.curriculum(req.body);
            curriculumService.update(req.params.id, req.body).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            });
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    delete(req, res, next) {
        try {
            curriculumService.delete(req.params.id).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            });
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    },

    findByLearningObjective(req, res, next) {
        try {
            let from = Number(req.query.from);
            let size = Number(req.query.size);
            assertionHelper.findAllParams(from, size, req.query.all);
            let all = req.query.all === 'true';
            let loName = req.query.learningObjectiveName;
            assertionHelper.parameter(loName, 'string', 'learningObjectiveName');
            curriculumService.findByLearningObjective(from, size, all, loName).then(function(result) {
                result.content = _.map(result.content, _filterCurriculumFields);
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            });
        } catch(err) {
            req.log.info(err);
            next(err)
        }
    }
};


function _filterCurriculumFields(curriculum) {
    let filteredCurriculum = {
        id: curriculum.id,
        name: curriculum.name,
        title: curriculum.title,
        discipline: curriculum.discipline,
        description: curriculum.description,
        enabled: curriculum.enabled,
        metadata: curriculum.metadata
    };

    filteredCurriculum.metadata = curriculum.metadata;
    delete filteredCurriculum.metadata['@class'];
    delete filteredCurriculum.metadata['@type'];

    return filteredCurriculum
}


module.exports = Object.create(curriculumController);

