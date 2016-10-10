/**
 * Created by diugalde on 08/09/16.
 */

const _ = require('lodash');

const curriculumService = require('../services/curriculum_service');
const objectMapper = require('../mapper/object_mapper');
const validatorService = require('../services/validator_service');

var curriculumController = {

    /**
     * GET -> /curricula/{id}
     * Find a specific curriculum by its id.
     *
     * @returns JSON with the curricula. 404 error otherwise.
     */
    findById(req, res, next) {
        try {
            curriculumService.findById(req.params.id).then(function(result) {
                res.json(objectMapper.mapCurriculum(result))
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
     * GET -> /curricula
     * Retrieve a page with curricula depending on the query params.
     *
     * @queryParam from - number   (0-based index that defines the first curriculum to be retrieved.).
     * @queryParam size - number   (Number of curricula to be retrieved starting from the 'from' index. Must be < 50).
     * @queryParam all  - boolean  (If you want to retrieve all curricula in database, ignoring from and size parameters).
     * @returns JSON with a curricula page.
     */
    findAll(req, res, next) {
        try {
            let from = Number(req.query.from);
            let size = Number(req.query.size);
            validatorService.validatePaginationParams(from, size, req.query.all);
            let all = req.query.all === 'true';
            curriculumService.findAll(from, size, all).then(function(result) {
                result.content = _.map(result.content, objectMapper.mapCurriculum);
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
     * POST -> /curricula
     * Inserts a curriculum in the database. req.body contains the curriculum as a JSON.
     *
     * @returns JSON with the inserted curriculum. Custom error otherwise.
     */
    insert(req, res, next) {
        try {
            validatorService.validateCurriculum(req.body);
            curriculumService.insert(req.body).then(function(curriculum) {
                res.json(objectMapper.mapCurriculum(curriculum))
            }).catch(function(err) {
                req.log.info(err);
                next(err)
            });
        } catch(err) {
            req.log.info(err);
            next(err)
        }

    },

    /**
     * PUT -> /curricula/{id}
     * Updates an existing curriculum. req.body contains the updated curriculum as a JSON.
     *
     * @returns JSON with the number of updated records. Custom error otherwise.
     */
    update(req, res, next) {
        try {
            validatorService.validateCurriculum(req.body);
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

    /**
     * DELETE -> /curricula/{id}
     * Removes an existing curriculum from database (cascade removal).
     *
     * @returns JSON with the number of deleted records. 404 error otherwise.
     */
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

    /**
     * GET -> /learningObjects/curricula
     * Retrieves a page of curricula that are related with the specified learningObjective.
     *
     * @queryParam from - number   (0-based index that defines the first curriculum to be retrieved.).
     * @queryParam size - number   (Number of curricula to be retrieved starting from the 'from' index. Must be < 50).
     * @queryParam all  - boolean  (If you want to retrieve all curricula in database, ignoring from and size parameters).
     * @queryParam learningObjectiveName - string (The learning objective's name that will filter the curricula)
     * @returns JSON with the curricula page.
     */
    findByLearningObjective(req, res, next) {
        try {
            let from = Number(req.query.from);
            let size = Number(req.query.size);
            validatorService.validatePaginationParams(from, size, req.query.all);
            let all = req.query.all === 'true';
            let loName = req.query.learningObjectiveName;
            validatorService.validateParameter(loName, 'string', 'learningObjectiveName');
            curriculumService.findByLearningObjective(from, size, all, loName).then(function(result) {
                result.content = _.map(result.content, objectMapper.mapCurriculum);
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


module.exports = Object.create(curriculumController);

