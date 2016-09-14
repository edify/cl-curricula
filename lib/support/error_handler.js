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

errors.makeConstructor('PageOutOfRangeError', {
    statusCode: 422,
    restCode: 2003
});

errors.makeConstructor('CurriculumWithoutRootError', {
    statusCode: 404,
    restCode: 2004
});

errors.makeConstructor('RootNotFoundError', {
    statusCode: 404,
    restCode: 2005
});

errors.makeConstructor('FolderNotFoundError', {
    statusCode: 404,
    restCode: 2006
});

errors.makeConstructor('CycleReferenceError', {
    statusCode: 409,
    restCode: 2007
});

errors.makeConstructor('CustomUnauthorizedError', {
    statusCode: 401,
    restCode: 2008
});

errors.makeConstructor('WrongParametersError', {
    statusCode: 400,
    restCode: 2009
});

const messages =  {
    DefaultInternalServerError: 'An unexpected internal server error has occurred.',
    CurriculumNotFoundError: 'The curriculum with id %s was not found.',
    CurriculumWithoutRootError: 'The curriculum with id %s does not have root folder.',
    PageOutOfRangeError: 'The requested page is out of range.',
    RootNotFoundError: 'The curriculum with id %s does not have a root folder with id %s.',
    FolderNotFoundError: 'The folder with id %s does not exist in the folder tree of curriculum %s.',
    CycleReferenceError: 'There is a cyclic reference in the curriculum\'s root.',
    CustomUnauthorizedError: 'The authentication has failed. Check the authorization headers.',
    WrongParametersError: 'Invalid parameters, %s'
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