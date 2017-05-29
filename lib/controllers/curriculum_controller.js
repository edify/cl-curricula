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
 * Created by diugalde on 08/09/16.
 */

const _ = require('lodash');

const curriculumService = require('../services/curriculum_service');
const errorHandler = require('../support/error_handler');
const objectReducer = require('../utils/object_reducer');
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
     * POST -> /curricula
     * Inserts a curriculum in the database. req.body contains the curriculum as a JSON.
     *
     * @returns JSON with the inserted curriculum. Custom error otherwise.
     */
    insert(req, res, next) {
        try {
            validatorService.validateCurriculum(req.body);
            curriculumService.insert(req.body).then(function(curriculum) {
                objectReducer.reduce(curriculum);
                res.json(curriculum)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
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
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * DELETE -> /curricula/{id}
     * Removes an existing curriculum from database (cascade removal).
     *
     * @returns JSON with the number of deleted records. 404 error otherwise.
     */
    remove(req, res, next) {
        try {
            curriculumService.remove(req.params.id).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
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
                objectReducer.reduce(result);
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * GET -> /curricula/:id/linkedLearningObjectives
     * Returns all the implicit learning objectives associated to the curriculum's learning objects.
     *
     * @returns JSON with a list of unique learning objectives.
     */
    findLinkedLearningObjectives(req, res, next) {
        try {
            curriculumService.getLinkedLearningObjectives(req.params.id).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    }
};


module.exports = Object.create(curriculumController);

