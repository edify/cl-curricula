/*
 * Copyright 2016 Edify Software Consulting.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


 /**
 * Created by diugalde on 16/05/17.
 */

const errorHandler = require('../support/error_handler');
const learningObjectService = require('../services/services').learningObjectService;

var learningObjectController = {

    /**
     * PUT -> /learningObjects/{id}
     * Updates all LO nodes with the specified id, setting the updated flag = TRUE.
     *
     * @returns JSON with the number of updated records.
     */
    updateSync(req, res, next) {
        try {
            learningObjectService.updateSync(req.params.id).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    },

    /**
     * DELETE -> /learningObjects/{learningObjectId}
     * Updates all LO nodes with the specified id, setting the deleted flag = TRUE.
     *
     * @returns JSON with the number of updated records.
     */
    removeSync(req, res, next) {
        try {
            learningObjectService.removeSync(req.params.id).then(function(result) {
                res.json(result)
            }).catch(function(err) {
                req.log.info(err);
                next(errorHandler.getApiError(err, req._id))
            });
        } catch(err) {
            req.log.info(err);
            next(errorHandler.getApiError(err, req._id))
        }
    }

};



module.exports = Object.create(learningObjectController);

