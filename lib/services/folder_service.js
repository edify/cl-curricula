/**
 * Created by diugalde on 16/09/16.
 */


const _ = require('lodash');
const uuid = require('node-uuid');

const config = require('../config');
const errorHandler = require('../support/error_handler');
const LearningObject = require('../cl_client/learning_object_client');
const log = require('../utils/log');
const odb = require('../db/odb');
const validatorService = require('../services/validator_service');


var folderService = {

    /**
     * Retrieves a curriculum's item from the database.
     *
     * @param curriculumId - string
     * @param itemPath - Array<string>
     * @param expandParams - Object containing optional expand parameters. Currently the supported parameters
     *                       are [contents, metadata] for LearningObject and [folders, learningObjects] for Folder.
     * @returns Promise<object> - The item or 404 error.
     */
    findByPath(curriculumId, itemPath, expandParams) {
        let fs = this;
        // Query to get the root folder.
        let queryParams = {params: {curriculumId}};
        let query = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        // If the itemPath array contains items, the path traversal continues.
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            queryParams.params[subItem] = itemName;
            query = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${query})) WHERE name = :${subItem}`
        });

        return odb.query(query, queryParams).then(function (item) {
            if (_.isEmpty(item)) {
                throw errorHandler.createError('ItemNotFoundError', ['item', _.join(itemPath, '/'), curriculumId])
            }

            let itemResult = item[0];       // This variable will hold the result and the expand properties.
            let expandProperties = [];      // This array will save the names of the expand properties.
            let expandPromises = [];        // Stores promises for each expand function.

            if (itemResult['@class'] === 'Folder') {
                if (_.includes(expandParams, 'folders')) {
                    expandPromises.push(fs._findSubFolders(itemResult.id));
                    expandProperties.push('folders')
                }

                if (_.includes(expandParams, 'learningObjects')) {
                    expandPromises.push(fs._findLearningObjects(itemResult.id));
                    expandProperties.push('learningObjects')
                }
            } else if (itemResult['@class'] === 'LearningObject') {
                if (_.includes(expandParams, 'metadata')) {
                    expandPromises.push(fs._getLearningObjectMetadata(itemResult.id, itemResult.url));
                    expandProperties.push('metadata')
                }

                if (_.includes(expandParams, 'contents')) {
                    expandPromises.push(fs._getLearningObjectContents(itemResult.id, itemResult.url, itemResult.contentUrl));
                    expandProperties.push('contents')
                }
            }

            return Promise.all(expandPromises).then(function(expQueryresults) {
                _.each(expQueryresults, function(expQueryResult, i) {
                    itemResult[expandProperties[i]] = expQueryResult
                });
                return Promise.resolve(itemResult)
            });
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Inserts a new item in the database. If the specified itemPath is not valid, an error is thrown.
     *
     * @param curriculumId - string
     * @param itemPath - Array<string>
     * @param newItem - object (Folder or LearningObject)
     * @returns Promise<object> - The inserted object.
     */
    insert(curriculumId, itemPath, newItem) {
        let fs = this;
        return this.findByPath(curriculumId, itemPath).then(function(parentFolder) {
            if (parentFolder['@class'] !== 'Folder') {
                return Promise.reject(errorHandler.createError('ItemNotFoundError', ['folder', itemPath, curriculumId]))
            }

            return fs._saveItem(curriculumId, parentFolder, newItem)
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    /**
     * Inserts a new item in the database. If the specified itemPath is not valid, it will try to create the missing folders.
     *
     * @param curriculumId - string
     * @param itemPath - Array<string>
     * @param newItem - object (Folder or LearningObject)
     * @returns Promise<object> - The inserted object.
     */
    insertForce(curriculumId, itemPath, newItem) {
        let fs = this;
        return this.findByPath(curriculumId, []).then(function(root) {
            if (_.isEmpty(root)) {
                return Promise.reject(errorHandler.createError('InvalidPathError', _.join(itemPath, '/')))
            }

            return fs._findLastValidFolder(root, 0, itemPath)
        }).then(function(lastValidFolder) {
            // If the lastValidFolder index is equals to the itemPath length, is because the entire path was valid.
            if (lastValidFolder.index === itemPath.length) {
                return Promise.resolve(lastValidFolder.lastFolder);
            }

            return fs._saveFolderPath(lastValidFolder.lastFolder, _.slice(itemPath, lastValidFolder.index))
        }).then(function(newItemParent) {
            return fs._saveItem(curriculumId, newItemParent, newItem)
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    /**
     * Updates an existing curriculum's item.
     *
     * @param curriculumId - string
     * @param itemPath - Array<string>
     * @param updatedItem - object (Folder or LearningObject)
     * @returns Promise<object> - The object contains the number of updated records
     */
    update(curriculumId, itemPath, updatedItem) {
        let fs = this;
        return this.findByPath(curriculumId, itemPath).then(function(item) {
            return fs._parentContainsItem(item.id, updatedItem.name).then(function(exists) {
                if (exists) {
                    return Promise.reject(errorHandler.createError('ItemAlreadyExistsError', [updatedItem.name, curriculumId]))
                }
                _addEmbeddedProperties(updatedItem, _getEntityClass(updatedItem));
                let queryParams = {params: {itemClass: item['@class'], content: updatedItem, id: item.id}};
                let query = `UPDATE :itemClass MERGE :content WHERE id = :id`;

                return odb.query(query, queryParams)
            }).then(function(updatedRecords) {
                if (updatedRecords[0] == 0) {
                    throw errorHandler.createError('ItemNotFoundError', ['item', itemPath, curriculumId])
                }
                log.info(`${item['@class']} ${_.join(itemPath, '/')} was successfully updated.`);
                return Promise.resolve({updatedRecords: updatedRecords[0]})
            })
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    /**
     * Delete the specified curriculum's item (Folder or LearningObject). If it is a folder, it will remove all its children in cascade.
     *
     * @param curriculumId - string
     * @param itemPath - Array<string>
     * @returns Promise<object> - The object contains the number of deleted records.
     */
    delete(curriculumId, itemPath) {
        return this.findByPath(curriculumId, itemPath).then(function(item) {
            let queryParams = {params: {id: item.id}};
            let query = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM V WHERE id = :id))`;
            return odb.query(query, queryParams).then(function(deletedRecords) {
                if (deletedRecords[0] == 0) {
                    throw errorHandler.createError('ItemNotFoundError', ['item', itemPath, curriculumId])
                }
                log.info(`Item with id: ${item.id} and its connections were successfully removed.`);
                return Promise.resolve({deletedRecords: deletedRecords[0]})
            })
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    /**
     * Retrieves all the subfolders inside the specified folder (Only direct children)
     *
     * @param folderId - string
     * @returns Promise<Array> - The array contains folders.
     * @private
     */
    _findSubFolders(folderId) {
        let queryParams = {params: {id: folderId}};
        let query = `SELECT id, name FROM 
                        (SELECT EXPAND(OUT()) FROM (SELECT FROM Folder WHERE id = :id)) 
                            WHERE @class='Folder'`;
        return odb.query(query, queryParams).then(function (folders) {
            return Promise.resolve(folders)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Retrieves all the learningObjects inside the specified folder (Only direct children)
     *
     * @param folderId - string
     * @returns Promise<Array> - The array contains learningObjects
     * @private
     */
    _findLearningObjects(folderId) {
        let queryParams = {params: {id: folderId}};
        let query = `SELECT id, name, title, url, contentUrl, learningObjectives 
                        FROM (SELECT EXPAND(OUT()) FROM (SELECT FROM Folder WHERE id = :id)) 
                            WHERE @class='LearningObject'`;
        return odb.query(query, queryParams).then(function (learningObjects) {
            return Promise.resolve(learningObjects)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Makes a GET request to cl-lo to obtain the metadata of a specific learningObject.
     *
     * @param loId - string
     * @param loURL - string (url referencing the learningObject in cl-lo)
     * @returns Promise<object> - object with the metadata of the learningObject.
     * @private
     */
    _getLearningObjectMetadata(loId, loURL) {
        return LearningObject.client.get(loURL).then(function(res) {
            return Promise.resolve(res.metadata)
        }).catch(function(err) {
            log.info(err);
            let customErr = errorHandler.createError('LODataNotFoundError', ['metadata', loId]);
            return Promise.resolve(customErr.body.message)
        })
    },

    /**
     * Makes a GET request to cl-lo to obtain the contents (with the file in base64) of a specific learningObject.
     *
     * @param loId - string
     * @param loURL - string (url referencing the learningObject in cl-lo)
     * @param loContentUrl - string (url referencing the learning object's file in cl-lo)
     * @returns Promise<object> - object with the contents info and the base64.
     * @private
     */
    _getLearningObjectContents(loId, loURL, loContentUrl) {
        let loContents = {};
        return LearningObject.client.get(`${loURL}/contents`).then(function(contentResponse) {
            loContents.mimeType = contentResponse.mimeType;
            loContents.md5 = contentResponse.md5;
            let urlSplit = loContentUrl.split('?');
            let base64Url = `${urlSplit[0]}/base64?${urlSplit[1]}`;
            return LearningObject.client.get(base64Url)
        }).then(function(base64Response) {
            loContents.base64 = base64Response.base64;
            return Promise.resolve(loContents)
        }).catch(function(err) {
            log.info(err);
            let customErr = errorHandler.createError('LODataNotFoundError', ['contents', loId]);
            return Promise.resolve(customErr.body.message)
        })
    },

    /**
     * Tries to traverse the entire itemPath and returns the last valid folder.
     *
     * @param parentFolder - object (Folder).
     * @param index - number (The index of the current folder to check in the itemPath array)
     * @param itemPath - Array of strings (The folders to check)
     * @returns Promise<object> - The object contains the lastValidFolder and its index.
     * @private
     */
    _findLastValidFolder(parentFolder, index, itemPath) {
        let fs = this;
        if (index === itemPath.length) {
            return Promise.resolve({ index: index, lastFolder: parentFolder })
        }

        let queryParams = {params: {id: parentFolder.id, name: itemPath[index]}};
        let getChildQuery = `SELECT FROM (SELECT EXPAND(OUT()) 
                                FROM (SELECT FROM Folder WHERE id = :id)) WHERE name = :name`;

        return odb.query(getChildQuery, queryParams).then(function (child) {
            if (_.isEmpty(child)) {
                return Promise.resolve({ index: index, lastFolder: parentFolder })
            }

            child = child[0];

            if (child['@class'] !== 'Folder') {
                return Promise.reject(errorHandler.createError('InvalidPathError', [_.join(itemPath, '/')]))
            }

            index++;
            return fs._findLastValidFolder(child, index, itemPath)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Create all the required folders for the given itemPath starting from the parentFolder.
     *
     * @param parentFolder - object (Folder).
     * @param itemPath - Array of strings. (each string is a folder name).
     * @returns Promise<object> - The object is the last created folder.
     * @private
     */
    _saveFolderPath(parentFolder, itemPath) {
        try {
            let folderName = itemPath[0];
            let op = odb.let('f0', function(f) {
                f.create('VERTEX', 'Folder').set({name: folderName, id: uuid.v4()})
            }).let('e0', function(e) {
                e.create('EDGE').from(parentFolder['@rid']).to('$f0')
            });

            itemPath = _.slice(itemPath, 1);

            _.each(itemPath, function(folderName, i) {
                i++;
                op = op.let(`f${i}`, function(f) {
                    f.create('VERTEX', 'Folder').set({name: folderName, id: uuid.v4()})
                }).let(`e${i}`, function(e) {
                    e.create('EDGE').from(`$f${i-1}`).to(`$f${i}`)
                });
            });

            return op.commit().return(`$f${itemPath.length}`).one().then(function(newItemParent) {
                return Promise.resolve(newItemParent)
            }).catch(function(err) {
                return Promise.resolve(err)
            });
        } catch(err) {
            return Promise.resolve(err)
        }
    },

    /**
     * Saves the item in the database and creates an edge from the parentFolder.
     *
     * @param curriculumId - string
     * @param parentFolder - object (Folder)
     * @param newItem - object (Folder or LearningObject)
     * @returns Promise<object> - The object is the inserted item.
     * @private
     */
    _saveItem(curriculumId, parentFolder, newItem) {

        let itemClass = _getEntityClass(newItem);

        return this._containsItem(parentFolder.id, newItem.name).then(function(exists) {
            if (exists) {
                return Promise.reject(errorHandler.createError('ItemAlreadyExistsError', [newItem.name, curriculumId]))
            }
            newItem.id = uuid.v4();
            return odb.let('item', function(c) {
                c.create('VERTEX', itemClass).set(newItem);
            }).let('link', function(l) {
                l.create('EDGE').from(parentFolder['@rid']).to('$item')
            }).commit().return('$item').one().then(function(insertedItem) {
                log.info(`Folder with id: ${newItem.id} was successfully created.`);
                return Promise.resolve(insertedItem)
            });
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    /**
     * Check if the parent of the given folder contains a child item with that name (different than folderId).
     *
     * @param folderId - string
     * @param itemName - string
     * @returns Promise<boolean>
     * @private
     */
    _parentContainsItem(folderId, itemName) {
        let queryParams = {params: {id: folderId, name: itemName}};
        let query = `SELECT @rid FROM (SELECT EXPAND(IN().OUT()) FROM 
                        (SELECT FROM Folder WHERE id = :id)) 
                            WHERE not(id = :id) and name = :name`;
        return odb.query(query, queryParams).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    },

    /**
     * Check if the given folder contains a child item with that name.
     *
     * @param folderId - string
     * @param itemName - string
     * @returns Promise<boolean>
     * @private
     */
    _containsItem(folderId, itemName) {
        let queryParams = {params: {id: folderId, name: itemName}};
        let query = `SELECT @rid FROM (SELECT EXPAND(OUT()) FROM 
                        (SELECT FROM Folder WHERE id = :id)) 
                            WHERE name = :name`;
        return odb.query(query, queryParams).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    }

};

/**
 * Determines if the object is a folder or a learningObject.
 *
 * @param entityJSON
 * @returns string (Folder or LearningObject)
 * @private
 */
function _getEntityClass(entityJSON) {
    if (entityJSON.url || entityJSON.learningObjectives || entityJSON.title) {
        validatorService.validateLearningObject(entityJSON);
        return 'LearningObject'
    } else {
        validatorService.validateFolder(entityJSON);
        return 'Folder'
    }
}

/**
 * Private method that add required metadata properties for embedded objects, in this case LearningObjectives.
 *
 * @param item - object
 * @param itemClass - string
 * @private
 */
function _addEmbeddedProperties(item, itemClass) {
    if (itemClass === 'LearningObject' && item.learningObjectives) {
        item.learningObjectives = _.map(item.learningObjectives, function(loi) {
            loi['@class'] = 'LearningObjective';
            loi['@type'] = 'd';
            return loi
        })
    }
}


module.exports = Object.create(folderService);
