/**
 * Created by diugalde on 12/09/16.
 */

const errorHandler = require('../support/error_handler');

const assert = require('assert-plus');


var assertHelper = {

    findAllParams(from, size, all) {
        try {
            assert.number(from, 'from');
            assert.number(size, 'size');
            let isBoolean = all === 'true' || all === 'false';
            assert.ok(isBoolean, 'The parameter "all" must be boolean (true or false)');
            // If the 'all' parameter is false, the other parameters must be valid.
            if (all === 'false') {
                let allowedSize = size >= 0 && size <= 50;
                let allowedFrom = from >= 0;
                assert.ok(allowedSize, 'The size parameter must be between 0 and 50');
                assert.ok(allowedFrom, 'The from index must be >= 0')
            }
        } catch(err) {
            throw errorHandler.createError('WrongParametersError', [err.message])
        }
    },

    curriculum(jsonCurriculum) {
        try {
            assert.string(jsonCurriculum.name, 'curriculum name');
            assert.string(jsonCurriculum.title, 'curriculum title');
            assert.string(jsonCurriculum.description, 'curriculum description');
        } catch(err) {
            throw errorHandler.createError('InvalidEntityJSONError', ['curriculum', err.message])
        }
    },

    folder(jsonFolder) {
        try {
            assert.string(jsonFolder.name, 'folder name')
        } catch (err) {
            throw errorHandler.createError('InvalidEntityJSONError', ['folder', err.message])
        }
    },

    parameter(param, type, paramName) {
        try {
            assert[type](param, paramName)
        } catch (err) {
            throw errorHandler.createError('WrongParametersError', [err.message])
        }
    }
};

module.exports = Object.create(assertHelper);
