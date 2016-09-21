/**
 * Created by diugalde on 09/09/16.
 */

const util = require('util');

const errors = require('restify-errors');

errors.makeConstructor('CurriculumNotFoundError', {
    statusCode: 404,
    restCode: 2001
});

errors.makeConstructor('DefaultInternalServerError', {
    statusCode: 500,
    restCode: 2002
});

errors.makeConstructor('ItemNotFoundError', {
    statusCode: 404,
    restCode: 2003
});

errors.makeConstructor('CustomUnauthorizedError', {
    statusCode: 401,
    restCode: 2004
});

errors.makeConstructor('WrongParametersError', {
    statusCode: 400,
    restCode: 2005
});

errors.makeConstructor('ItemAlreadyExistsError', {
    statusCode: 409,
    restCode: 2006
});

errors.makeConstructor('InvalidEntityJSONError', {
    statusCode: 422,
    restCode: 2007
});

errors.makeConstructor('LODataNotFoundError', {
    statusCode: 404,
    restCode: 2008
});

errors.makeConstructor('InvalidPathError', {
    statusCode: 422,
    restCode: 2009
});

const messages =  {
    DefaultInternalServerError: 'An unexpected internal server error has occurred.',
    CurriculumNotFoundError: 'The curriculum with id %s was not found.',
    ItemNotFoundError: 'The %s %s does not exist in the folder tree of curriculum %s.',
    CustomUnauthorizedError: 'The authentication has failed. Check the authorization headers.',
    WrongParametersError: 'Invalid parameters, %s',
    ItemAlreadyExistsError: 'There is already an item called %s in the folder tree of curriculum %s.',
    InvalidEntityJSONError: 'The given %s JSON is not valid. %s',
    LODataNotFoundError: 'Could not get %s for the learning object with id %s',
    InvalidPathError: 'The specified path is not valid: %s'
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
        if (errors[errorClass]) {
            if (messages[errorClass]) {
                err = new errors[errorClass](util.format(messages[errorClass], ...args))
            } else {
                err = new errors[errorClass]()
            }
        } else {
            err = new errors.DefaultInternalServerError(messages['DefaultInternalServerError'])
        }
        return err
    }
};

module.exports = Object.create(ErrorHandler);
