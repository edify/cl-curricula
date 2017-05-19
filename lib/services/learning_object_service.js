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
 * Created by diugalde on 16/09/16.
 */


const _ = require('lodash');

const config = require('../config');
const odb = require('../db/odb');

var learningObjectService = {

    /**
     * Set the property 'updated' = true for all learningObjects with the specified id.
     *
     * @param id - string
     * @returns {Promise<object>}. The object contains the number of updated records.
     */
    updateSync(id) {
        let queryParams = {params: {id}};
        let query = `UPDATE LearningObject SET updated=true WHERE learningObjectId = :id`;

        return odb.query(query, queryParams).then(function(updatedRecords) {
            return Promise.resolve({updatedRecords: updatedRecords[0]})
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Set the property 'deleted' = true for all learningObjects with the specified id.
     *
     * @param id - string
     * @returns Promise<object> - The object contains the number of updated records.
     */
    removeSync(id) {
        let queryParams = {params: {id}};
        let query = `UPDATE LearningObject SET deleted=true WHERE learningObjectId = :id`;

        return odb.query(query, queryParams).then(function(updatedRecords) {
            return Promise.resolve({updatedRecords: updatedRecords[0]})
        }).catch(function(err) {
            return Promise.reject(err)
        })
    }
};


module.exports = Object.create(learningObjectService);
