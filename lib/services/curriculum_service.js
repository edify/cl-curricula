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
 * Created by diugalde on 08/09/16.
 */

const _ = require('lodash');
const uuid = require('node-uuid');

const log = require('../utils/log');
const odb = require('../db/odb');
const paginationUtils = require('../utils/pagination_utils');

var curriculumService = {

    /**
     * Retrieves a curriculum from database.
     *
     * @param id
     * @returns Promise<curriculum>. 404 error otherwise.
     */
    findById(id) {
        let queryParams = {params: {id}};
        let query = `SELECT id, name, title, discipline, description, enabled, metadata
                     FROM Curriculum
                     WHERE id = :id`;
        return odb.query(query, queryParams).then(function (curriculum) {
            if (_.isEmpty(curriculum)) {
                return Promise.resolve({})
            }
            return Promise.resolve(curriculum[0])
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Retrieves all curricula from database depending on the parameters.
     *
     * @param from - number   (0-based index that defines the first curriculum to be retrieved.).
     * @param size - number   (Number of curricula to be retrieved starting from the 'from' index. Must be < 50).
     * @param all  - boolean  (If you want to retrieve all curricula in database, ignoring from and size parameters).
     * @returns {Promise<CurriculaPage>}. Custom error otherwise.
     */
    findAll(from, size, all) {
        let countQuery = 'SELECT COUNT(*) FROM Curriculum';
        let queryParams = {};
        let query = 'SELECT id, name, title, discipline, description, enabled, metadata FROM Curriculum';
        if (!all) {
            queryParams = {params: {from, size}};
            query = `${query} SKIP :from LIMIT :size`;
        }
        return odb.query(countQuery).then(function(countResult) {
            return odb.query(query, queryParams).then(function (curricula) {
                let curriculaPage = paginationUtils.createPage(all, from, size, countResult[0].COUNT, curricula);
                return Promise.resolve(curriculaPage)
            })
        }).catch(function (err) {
            return Promise.reject(err)
        })
    },

    /**
     * Saves a new curriculum in the database.
     *
     * @param curriculum - object
     * @returns {Promise<curriculum>}. Custom error otherwise.
     */
    insert(curriculum) {
        curriculum.id = uuid.v4();
        return odb.let('curriculum', function(c) {
            c.create('VERTEX', 'Curriculum').set(curriculum)
        }).let('folder', function(f) {
            f.create('VERTEX', 'Folder').set({name: 'root', id: uuid.v4()})
        }).let('link', function(l) {
            l.create('EDGE').from('$curriculum').to('$folder')
        }).commit().return('$curriculum').one().then(function(insertedCurriculum) {
            return Promise.resolve(insertedCurriculum)
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    /**
     * Updates a curriculum.
     *
     * @param id - string
     * @param curriculum - object
     * @returns {Promise<object>}. The object contains a message with the number of updated records. Custom error otherwise.
     */
    update(id, curriculum) {
        // Add metadata embedded properties.
        curriculum.metadata['@class'] = 'Metadata';
        curriculum.metadata['@type'] = 'd';

        let queryParams = {params: {content: curriculum, id}};
        let query = `UPDATE Curriculum MERGE :content WHERE id = :id`;
        return odb.query(query, queryParams).then(function(updatedRecords) {
            return Promise.resolve({updatedRecords: updatedRecords[0]})
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Deletes the curriculum with the specified id in cascade mode. All its folders and learningObjects will be removed too.
     *
     * @param id
     * @returns {Promise<object>}. The object contains a message with the number of removed records. Custom error otherwise.
     */
    remove(id) {
        let queryParams = {params: {id}};
        let query = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM Curriculum WHERE id = :id))`;
        return odb.query(query, queryParams).then(function(deletedRecords) {
            return Promise.resolve({deletedRecords: deletedRecords[0]})
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Retrieves all curricula from database that are related with a learningObjective.
     *
     * @param from - number   (0-based index that defines the first curriculum to be retrieved.).
     * @param size - number   (Number of curricula to be retrieved starting from the 'from' index. Must be < 50).
     * @param all  - boolean  (If you want to retrieve all curricula in database, ignoring from and size parameters).
     * @param loName - string (LearningObjective's name)
     * @returns {Promise<CurriculaPage>}. Custom error otherwise.
     */
    findByLearningObjective(from, size, all, loName) {
        let queryParams = {params: {loName}};
        let query = `SELECT FROM 
                            (TRAVERSE in() FROM 
                                (SELECT FROM LearningObject WHERE :loName in learningObjectives.name)) 
                     WHERE @class= 'Curriculum'`;
        return odb.query(query, queryParams).then(function (curricula) {
            let content = curricula;
            if (!all) {
                content = _.slice(curricula, from, from + size)
            }
            let curriculaPage = paginationUtils.createPage(all, from, size, curricula.length, content);
            return Promise.resolve(curriculaPage)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    }
};


module.exports = Object.create(curriculumService);
