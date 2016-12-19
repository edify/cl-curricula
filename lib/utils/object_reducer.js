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
 * Created by diugalde on 10/10/16.
 */

const _ = require('lodash');

/**
 * This object is in charge of transform raw database objects to API objects that will be returned to the user.
 */
var objectReducer = {

    /**
     * Removes properties starting with @, in_ or out_ recursively
     *
     * @param obj - object
     */
    reduce(obj) {
        if (_.isArray(obj)) {
            _.forEach(obj, function(item) {
                objectReducer.reduce(item)
            })
        } else {
            _.forIn(obj, function(val, key) {
                if (_.startsWith(key, '@') || _.startsWith(key, 'in_') || _.startsWith(key, 'out_')) {
                    delete obj[key]
                } else if (_.isObject(obj[key]) || _.isArray(obj[key])) {
                    objectReducer.reduce(obj[key])
                }
            });
        }
    }

};

module.exports = Object.create(objectReducer);
