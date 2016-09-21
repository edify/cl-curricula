/**
 * Created by diugalde on 16/09/16.
 */


const _ = require('lodash');
const uuid = require('node-uuid');

const assertionHelper = require('../utils/assertion_helper');
const config = require('../config');
const errorHandler = require('../support/error_handler');
const LearningObject = require('../cl_client/learning_object_client');
const log = require('../utils/log');
const odb = require('../db/odb');

var folderService = {

    findByPath(curriculumId, itemPath, expandParams) {
        let fs = this;
        // Query to get the root folder.
        let query = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id='${curriculumId}')) WHERE name='root'`;
        // If the itemPath array contains items, the path traversal continues.
        _.forEach(itemPath, function(itemName) {
            query = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${query})) WHERE name='${itemName}'`
        });
        return odb.query(query).then(function (item) {
            if (_.isEmpty(item)) {
                throw errorHandler.createError('ItemNotFoundError', ['item', _.join(itemPath, '/'), curriculumId])
            }

            let itemResult = item[0];       // This variable will hold the result and the expand properties.
            let expandProperties = [];      // This array will save the names of the expand properties.
            let expandPromises = [];        // Stores promises for each expand function.

            if (itemResult['@class'] === 'Folder') {
                if (_.includes(expandParams, 'folders')) {
                    expandPromises.push(fs.findSubFolders(itemResult.id));
                    expandProperties.push('folders')
                }

                if (_.includes(expandParams, 'learningObjects')) {
                    expandPromises.push(fs.findLearningObjects(itemResult.id));
                    expandProperties.push('learningObjects')
                }
            } else if (itemResult['@class'] === 'LearningObject') {
                if (_.includes(expandParams, 'metadata')) {
                    expandPromises.push(fs.getLearningObjectMetadata(itemResult.id, itemResult.url));
                    expandProperties.push('metadata')
                }

                if (_.includes(expandParams, 'contents')) {
                    expandPromises.push(fs.getLearningObjectContents(itemResult.id, itemResult.url, itemResult.contentUrl));
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

    insert(curriculumId, itemPath, newItem) {
        let fs = this;
        return this.findByPath(curriculumId, itemPath).then(function(parentFolder) {
            if (parentFolder['@class'] !== 'Folder') {
                return Promise.reject(errorHandler.createError('ItemNotFoundError', ['folder', itemPath, curriculumId]))
            }

            return fs.saveItem(curriculumId, parentFolder, newItem)
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    insertForce(curriculumId, itemPath, newItem) {
        let fs = this;
        return this.findByPath(curriculumId, []).then(function(root) {
            if (_.isEmpty(root)) {
                return Promise.reject(errorHandler.createError('InvalidPathError', _.join(itemPath, '/')))
            }

            return fs.findLastValidFolder(root, 0, itemPath)
        }).then(function(lastValidFolder) {
            // If the lastValidFolder index is equals to the itemPath length, is because the entire path was valid.
            if (lastValidFolder.index === itemPath.length) {
                return Promise.resolve(lastValidFolder.lastFolder);
            }

            return fs.saveFolderPath(lastValidFolder.lastFolder, _.slice(itemPath, lastValidFolder.index))
        }).then(function(newItemParent) {
            return fs.saveItem(curriculumId, newItemParent, newItem)
        }).catch(function(err) {
            return Promise.reject(err)
        });
    },

    update(curriculumId, itemPath, updatedItem) {
        let fs = this;
        return this.findByPath(curriculumId, itemPath).then(function(item) {
            return fs.parentContainsItem(item.id, updatedItem.name).then(function(exists) {
                if (exists) {
                    return Promise.reject(errorHandler.createError('ItemAlreadyExistsError', [updatedItem.name, curriculumId]))
                }
                _addEmbeddedProperties(updatedItem, _getEntityClass(updatedItem));
                let query = `UPDATE ${item['@class']} MERGE ${JSON.stringify(updatedItem)} WHERE id='${item.id}'`;
                return odb.query(query)
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

    delete(curriculumId, itemPath) {
        return this.findByPath(curriculumId, itemPath).then(function(item) {
            let query = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM V WHERE id='${item.id}'))`;
            return odb.query(query).then(function(deletedRecords) {
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

    findSubFolders(folderId) {
        let query = `SELECT id, name FROM 
                        (SELECT EXPAND(OUT()) FROM (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE @class='Folder'`;
        return odb.query(query).then(function (folders) {
            return Promise.resolve(folders)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    findLearningObjects(folderId) {
        let query = `SELECT id, name, title, url, contentUrl, learningObjectives 
                        FROM (SELECT EXPAND(OUT()) FROM (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE @class='LearningObject'`;
        return odb.query(query).then(function (learningObjects) {
            return Promise.resolve(learningObjects)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    getLearningObjectMetadata(loId, loURL) {
        return LearningObject.client.get(loURL).then(function(res) {
            return Promise.resolve(res.metadata)
        }).catch(function(err) {
            log.info(err);
            let customErr = errorHandler.createError('LODataNotFoundError', ['metadata', loId]);
            return Promise.resolve(customErr.body.message)
        })
    },

    getLearningObjectContents(loId, loUrl, loContentUrl) {
        let loContents = {};
        return LearningObject.client.get(`${loUrl}/contents`).then(function(contentResponse) {
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

    findLastValidFolder(parentFolder, index, itemPath) {
        let fs = this;
        if (index === itemPath.length) {
            return Promise.resolve({ index: index, lastFolder: parentFolder })
        }

        let getChildQuery = `SELECT FROM (SELECT EXPAND(OUT()) 
                                FROM (SELECT FROM Folder WHERE id='${parentFolder.id}')) WHERE name='${itemPath[index]}'`;

        return odb.query(getChildQuery).then(function (child) {
            if (_.isEmpty(child)) {
                return Promise.resolve({ index: index, lastFolder: parentFolder })
            }

            child = child[0];

            if (child['@class'] !== 'Folder') {
                return Promise.reject(errorHandler.createError('InvalidPathError', [_.join(itemPath, '/')]))
            }

            index++;
            return fs.findLastValidFolder(child, index, itemPath)
        }).catch(function(err) {
            return Promise.reject(err)
        })
    },

    saveFolderPath(parentFolder, itemPath) {
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

    saveItem(curriculumId, parentFolder, newItem) {

        let itemClass = _getEntityClass(newItem);

        return this.containsItem(parentFolder.id, newItem.name).then(function(exists) {
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

    // Check if there is a folder with 'folderName' inside the directory where folderId is placed.
    parentContainsItem(folderId, itemName) {
        let query = `SELECT @rid FROM (SELECT EXPAND(IN().OUT()) FROM 
                        (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE not(id='${folderId}') and name='${itemName}'`;
        return odb.query(query).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    },

    containsItem(folderId, itemName) {
        let query = `SELECT @rid FROM (SELECT EXPAND(OUT()) FROM 
                        (SELECT FROM Folder WHERE id='${folderId}')) 
                            WHERE name='${itemName}'`;
        return odb.query(query).then(function (result) {
            return Promise.resolve(result.length > 0)
        }).catch(function(err) {
            return Promise.reject(errorHandler.createError('DefaultInternalServerError', [err.getMessage()]))
        })
    }

};

function _getEntityClass(entityJSON) {
    if (entityJSON.url || entityJSON.learningObjectives || entityJSON.title) {
        assertionHelper.learningObject(entityJSON);
        return 'LearningObject'
    } else {
        assertionHelper.folder(entityJSON);
        return 'Folder'
    }
}

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
