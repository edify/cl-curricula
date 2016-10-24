/**
 * Created by diugalde on 08/09/16.
 */

const authService = require('./auth_service');
const curriculumService = require('./curriculum_service');
const folderService = require('./folder_service');
const validatorService = require('./validator_service');


var services = {
    authService: authService,
    curriculumService: curriculumService,
    folderService: folderService,
    validatorService: validatorService
};

module.exports = services;
