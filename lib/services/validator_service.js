/**
 * Created by diugalde on 07/10/16.
 */

const _ = require('lodash');
const assert = require('assert-plus');

const errorHandler = require('../support/error_handler');


var validatorService = {
    /**
     * Check if the findAll parameters are valid.
     *
     * @param from - number
     * @param size - number
     * @param all - boolean
     */
    validatePaginationParams(from, size, all) {
        try {
            assert.number(from, 'from');
            assert.number(size, 'size');
            let isBoolean = all === 'true' || all === 'false';
            assert.ok(isBoolean, 'The parameter "all" must be boolean (true or false)');
            // If the 'all' parameter is false, the other parameters must be valid.
            if (all === 'false') {
                let allowedSize = size >= 0;
                let allowedFrom = from >= 0;
                assert.ok(allowedSize, 'The size parameter must be >= 0');
                assert.ok(allowedFrom, 'The from index must be >= 0')
            }
        } catch(err) {
            throw errorHandler.createError('WrongParametersError', [err.message])
        }
    },

    /**
     * Check if the parameter is a well formed Curriculum.
     *
     * @param curriculum - object
     */
    validateCurriculum(curriculum) {
        try {
            assert.string(curriculum.name, 'curriculum name');
            assert.string(curriculum.title, 'curriculum title');
            assert.string(curriculum.description, 'curriculum description');
        } catch(err) {
            throw errorHandler.createError('InvalidEntityJSONError', ['curriculum', err.message])
        }
    },

    /**
     * Check if the parameter is a well formed Folder.
     *
     * @param folder - object
     */
    validateFolder(folder) {
        try {
            assert.string(folder.name, 'folder name')
        } catch (err) {
            throw errorHandler.createError('InvalidEntityJSONError', ['folder', err.message])
        }
    },

    /**
     * Check if the parameter is a well formed LearningObject.
     *
     * @param learningObject - object
     */
    validateLearningObject(learningObject) {
        try {
            assert.string(learningObject.name, 'learning object name');
            assert.string(learningObject.url, 'learning object url');
            assert.string(learningObject.title, 'learning object title');
            assert.string(learningObject.contentUrl, 'learning object content url');
            assert.array(learningObject.learningObjectives, 'learning object\'s objectives');
            _.map(learningObject.learningObjectives, function(learningObjective) {
                assert.string(learningObjective.name, 'learning objective name');
                assert.string(learningObjective.url, 'learning objective url')
            })
        } catch (err) {
            throw errorHandler.createError('InvalidEntityJSONError', ['learning object', err.message])
        }
    },

    /**
     * Check the given parameter's type.
     *
     * @param param - string
     * @param type - string
     * @param paramName - string
     */
    validateParameter(param, type, paramName) {
        try {
            assert[type](param, paramName)
        } catch (err) {
            throw errorHandler.createError('WrongParametersError', [err.message])
        }
    }

};


module.exports = Object.create(validatorService);
