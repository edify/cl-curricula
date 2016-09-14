/**
 * Created by diugalde on 08/09/16.
 */

const curriculumController = require('./curriculum_controller');
const folderController = require('./folder_controller');

var controllers = {
    curriculumController: curriculumController,
    folderController: folderController
};

module.exports = controllers;