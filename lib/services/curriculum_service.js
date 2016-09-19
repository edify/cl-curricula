/**
 * Created by diugalde on 08/09/16.
 */

const _ = require('lodash');
const uuid = require('node-uuid');

const errorHandler = require('../support/error_handler');
const log = require('../utils/log');
const odb = require('../db/odb');

var curriculumService = {

    findById(id) {
        let query = `SELECT id, name, title, discipline, description, enabled, metadata
                     FROM Curriculum 
                     WHERE id = '${id}'`;
        return odb.query(query).then(function (curriculum) {
            if (_.isEmpty(curriculum)) {
                throw errorHandler.createError('CurriculumNotFoundError', [id])
            }
            return Promise.resolve(curriculum)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    findAll(from, size, all) {
        let countQuery = 'SELECT COUNT(*) FROM Curriculum';
        let query = 'SELECT id, name, title, discipline, description, enabled, metadata FROM Curriculum';
        if (!all) {
            query = `${query} SKIP ${from} LIMIT ${size}`;
        }
        return odb.query(countQuery).then(function(countResult) {
            return odb.query(query).then(function (curricula) {
                let curriculaPage = _createPage(all, from, size, countResult[0].COUNT, curricula);
                return Promise.resolve(curriculaPage)
            })
        }).catch(function (err) {
            return Promise.reject(err)
        })
    },

    insert(curriculum) {
        curriculum.id = uuid.v4();
        return odb.let('curriculum', function(c) {
            c.create('VERTEX', 'Curriculum').set(curriculum)
        }).let('folder', function(f) {
            f.create('VERTEX', 'Folder').set({name: 'root', id: uuid.v4()})
        }).let('link', function(l) {
            l.create('EDGE').from('$curriculum').to('$folder')
        }).commit().return('$curriculum').one().then(function(insertedCurriculum) {
            log.info(`Curriculum with id: ${id} was successfully created.`);
            return Promise.resolve(insertedCurriculum)
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    update(id, curriculum) {
        let query = `UPDATE Curriculum MERGE ${curriculum} WHERE id='${id}'`;
        return odb.query(query).then(function(updatedRecords) {
            if (updatedRecords[0] == 0) {
                throw errorHandler.createError('CurriculumNotFoundError', [id])
            }
            log.info(`Curriculum with id: ${id} was succesfully updated.`);
            return Promise.resolve({updatedRecords: updatedRecords[0]})
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    delete(id) {
        let query = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM Curriculum WHERE id='${id}'))`;
        return odb.query(query).then(function(deletedRecords) {
            if (deletedRecords[0] == 0) {
                throw errorHandler.createError('CurriculumNotFoundError', [id])
            }
            log.info(`Curriculum with id: ${id} and its connections were succesfully removed.`);
            return Promise.resolve({deletedRecords: deletedRecords[0]})
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    findByLearningObjective(from, size, all, loName) {
        let query = `SELECT FROM 
                            (TRAVERSE in() FROM 
                                (SELECT FROM LearningObject WHERE '${loName}' in learningObjectives.name)) 
                     WHERE @class= 'Curriculum'`;
        return odb.query(query).then(function (curricula) {
            let content = curricula;
            if (!all) {
                content = _.slice(curricula, from, from + size)
            }
            let curriculaPage = _createPage(all, from, size, curricula.length, content);
            return Promise.resolve(curriculaPage)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    }
};

function _createPage(all, from, size, quantity, content) {
    let page = {
        content: content,
        firstPage: true,
        lastPage: true,
        totalPages: 1,
        totalElements: quantity,
        numberOfElements: quantity
    };
    if (!all) {
        if (from > quantity-1) {
            return errorHandler.createError('WrongParametersError',
                [`The from parameter is ${from} but there are only ${quantity} records in the db. Index starts at 0.`])
        }
        page.firstPage = from === 0;
        page.lastPage = (from + size) >= quantity;
        page.totalPages = Math.ceil(quantity/size);
        page.numberOfElements = (from + size  > quantity) ? quantity - (from + size) : size
    }
    return page
}

module.exports = Object.create(curriculumService);
