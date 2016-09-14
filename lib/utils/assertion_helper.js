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
            assert.bool(all, 'all');
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
            throw errorHandler.createError('WrongParametersError', [err.message])
        }
    },

    folder(jsonFolder) {
        try {
            assert.string(jsonFolder.name, 'folder name')
        } catch (err) {
            throw errorHandler.createError('WrongParametersError', [err.message])
        }
    }
};

module.exports = Object.create(assertHelper);