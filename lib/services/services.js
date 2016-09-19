/**
 * Created by diugalde on 08/09/16.
 */

const authService = require('./auth_service');
const curriculumService = require('./curriculum_service');
const folderService = require('./folder_service');

var services = {
    authService: authService,
    curriculumService: curriculumService,
    folderService: folderService
};

module.exports = services;
