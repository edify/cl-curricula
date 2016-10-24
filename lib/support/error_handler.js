/**
 * Created by diugalde on 09/09/16.
 */

const _ = require('lodash');
const util = require('util');

const errors = require('restify-errors');

errors.makeConstructor('DefaultInternalServerError', {
    statusCode: 500,
    restCode: 2001
});

errors.makeConstructor('CustomUnauthorizedError', {
    statusCode: 401,
    restCode: 2002
});

errors.makeConstructor('WrongParametersError', {
    statusCode: 400,
    restCode: 2003
});

errors.makeConstructor('ItemAlreadyExistsError', {
    statusCode: 409,
    restCode: 2004
});

errors.makeConstructor('InvalidEntityJSONError', {
    statusCode: 422,
    restCode: 2005
});

errors.makeConstructor('InvalidPathError', {
    statusCode: 400,
    restCode: 2006
});

const messages =  {
    DefaultInternalServerError: 'An unexpected internal server error has occurred.',
    CustomUnauthorizedError: 'The authentication has failed. Check the authorization headers.',
    WrongParametersError: 'Invalid parameters, %s',
    ItemAlreadyExistsError: `There is already an item called '%s' in the folder tree of curriculum '%s'.`,
    InvalidEntityJSONError: `The given %s JSON is not valid. %s`,
    InvalidPathError: `The specified path is not valid: '%s'`
};

var ErrorHandler = {

    /**
     * Returns the corresponding custom error instance.
     *
     * @param errorClass - string (Example: DefaultInternalServerError).
     * @param args - array (In case the string message requires additional parameters).
     * @return error
     */
    createError(errorClass, args=[]) {
        let err;
        if (messages[errorClass]) {
            err = new errors[errorClass](util.format(messages[errorClass], ...args))
        } else {
            err = new errors[errorClass]()
        }
        err.errorClass = errorClass;
        return err
    },

    getApiError(err, reqId) {
        let customErr = err;
        if (_.isUndefined(err.errorClass)) {
            customErr = new errors.DefaultInternalServerError(messages['DefaultInternalServerError']);
            customErr.errorClass = 'DefaultInternalServerError';
        }
        customErr.body.requestId = reqId;
        return customErr
    }
};

module.exports = Object.create(ErrorHandler);
