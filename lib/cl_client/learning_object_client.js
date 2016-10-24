/**
 * Created by diugalde on 19/09/16.
 */

const config = require('../config');
const LearningObject = require('../../../cl-sdk-js/cl-sdk-js-lo/lib/learning_object');

LearningObject.client.init(config.lo.baseURL, config.lo.apiURL);

module.exports = LearningObject;
