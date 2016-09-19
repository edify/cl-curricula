/**
 * Created by diugalde on 16/09/16.
 */


const _ = require('lodash');
const uuid = require('node-uuid');

const errorHandler = require('../support/error_handler');
const log = require('../utils/log');
const odb = require('../db/odb');

var folderService = {

    findByPath(curriculumId, folderPath, expandFolders=false, expandLearningObjects=false) {
        let fs = this;
        // Query to get the root folder.
        let query = `SELECT FROM (TRAVERSE OUT() FROM (SELECT FROM Curriculum WHERE id='${curriculumId}') MAXDEPTH 1)
                        WHERE @class='Folder' and name='root'`;
        // If the folderPath array contains items, the path traversal continues.
        _.forEach(folderPath, function(folderName) {
            query = `SELECT FROM (TRAVERSE OUT() FROM (${query}) MAXDEPTH 1) 
                        WHERE @class='Folder' and name='${folderName}'`
        });
        return odb.query(query).then(function (folder) {
            if (_.isEmpty(folder)) {
                throw errorHandler.createError('FolderNotFoundError', [_.join(folderPath, '/'), curriculumId])
            }

            let folderResult = folder[0];

            let additionalInfo = []; // This array will save the additional property that will be retrieved (folders - learningObjects).
            let promises = [];       // Stores promises for the expand parameters functions.

            if (expandFolders === true) {
                promises.push(fs.findSubFolders(folderResult.id));
                additionalInfo.push('folders')
            }

            if(expandLearningObjects === true) {
                promises.push(fs.findLearningObjects(folderResult.id));
                additionalInfo.push('learningObjects')
            }

            return Promise.all(promises).then(function(expQueryresults) {
                _.each(expQueryresults, function(expQueryResult, i) {
                     folderResult[additionalInfo[i]] = expQueryResult
                });
                return Promise.resolve(folderResult)
            });

        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    insert(curriculumId, folderPath, newFolder) {
        let fs = this;
        return this.findByPath(curriculumId, folderPath).then(function(parentFolder) {
            return fs.containsFolder(parentFolder.id, newFolder.name).then(function(exists) {
                if (exists) {
                    return Promise.reject(errorHandler.createError('FolderAlreadyExistsError', [newFolder.name, curriculumId]))
                }
                newFolder.id = uuid.v4();
                return odb.let('folder', function(c) {
                    c.create('VERTEX', 'Folder').set(newFolder)
                }).let('link', function(l) {
                    l.create('EDGE').from(parentFolder['@rid']).to('$folder')
                }).commit().return('$folder').one().then(function(insertedFolder) {
                    log.info(`Folder with id: ${newFolder.id} was successfully created.`);
                    return Promise.resolve(insertedFolder)
                });
            })
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    update(curriculumId, folderPath, newFolder) {
        let fs = this;
        return this.findByPath(curriculumId, folderPath).then(function(folder) {
            return fs.parentContainsFolder(folder.id, newFolder.name).then(function(exists) {
                if (exists) {
                    return Promise.reject(errorHandler.createError('FolderAlreadyExistsError', [newFolder.name, curriculumId]))
                }
                let query = `UPDATE Folder MERGE ${JSON.stringify(newFolder)} WHERE id='${folder.id}'`;
                return odb.query(query)
            }).then(function(updatedRecords) {
                if (updatedRecords[0] == 0) {
                    throw errorHandler.createError('FolderNotFoundError', [id])
                }
                log.info(`Folder ${_.join(folderPath, '/')} was successfully updated.`);
                return Promise.resolve({updatedRecords: updatedRecords[0]})
            })
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    delete(curriculumId, folderPath) {
        return this.findByPath(curriculumId, folderPath).then(function(folder) {
            let query = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM Folder WHERE id='${folder.id}'))`;
            return odb.query(query).then(function(deletedRecords) {
                if (deletedRecords[0] == 0) {
                    throw errorHandler.createError('FolderNotFoundError', [folder.id, curriculumId])
                }
                log.info(`Folder with id: ${folder.id} and its connections were successfully removed.`);
                return Promise.resolve({deletedRecords: deletedRecords[0]})
            })
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    findSubFolders(folderId) {
        let query = `SELECT id, name 
                        FROM (TRAVERSE OUT() FROM 
                            (SELECT FROM Folder WHERE id='${folderId}') MAXDEPTH 1) 
                                WHERE @class='Folder' and not(id='${folderId}')`;
        return odb.query(query).then(function (folders) {
            return Promise.resolve(folders)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    insertLearningObject(curriculumId, folderPath, newLO) {

    },

    findLearningObjects(folderId) {
        let query = `SELECT id, name, title, url, contentUrl, learningObjectives 
                        FROM (TRAVERSE OUT() FROM 
                            (SELECT FROM Folder WHERE id='${folderId}') MAXDEPTH 1) WHERE @class='LearningObject'`;
        return odb.query(query).then(function (learningObjects) {
            return Promise.resolve(learningObjects)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    // Check if there is a folder with 'folderName' inside the directory where folderId is placed.
    parentContainsFolder(folderId, folderName) {
        let query = `SELECT @rid FROM (SELECT expand(IN().OUT()) FROM 
                        (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE @class='Folder' and not(id='${folderId}') and name='${folderName}'`;
        return odb.query(query).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    },

    containsFolder(folderId, folderName) {
        let query = `SELECT @rid FROM (SELECT expand(OUT()) FROM 
                        (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE @class='Folder' and name='${folderName}'`;
        return odb.query(query).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    },

    containsLearningObject(folderId, loName) {
        let query = `SELECT @rid FROM (SELECT expand(OUT()) FROM 
                        (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE @class='LearningObject' and name='${loName}'`;
        return odb.query(query).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    }


};



module.exports = Object.create(folderService);
