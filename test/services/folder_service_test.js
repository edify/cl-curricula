/**
 * Created by diugalde on 19/09/16.
 */

const _ = require('lodash');
const assert = require('assert');
const chai = require('chai');
const mockRequire = require('mock-require');
const sinon = require('sinon');
const sinonChai = require("sinon-chai");

// Configure chai
chai.should();
chai.use(sinonChai);

// Mock required dependencies.
var odbMock = {
    query: function() {},
    let: function() {}
};

var sdkClientMock = { get: function(){}};

mockRequire('../../lib/utils/log', {info(str) {}});
mockRequire('../../lib/db/odb', odbMock);
mockRequire('../../lib/cl_client/learning_object_client', {client: sdkClientMock});

// Require module that will be tested.
const folderService = require('../../lib/services/folder_service');

// Shared variables.
var folders, folder, learningObject, learningObjects, loMetadata, loContents;

before(function() {
    folder = {
        id: '47c98e93-1709-4455-8303-096098513c1d',
        name: 'testFolderName1',
        '@class': 'Folder'
    };

    folders = [
        {
            name: 'testFolderName1',
            id: '47c98e93-1709-4455-8303-096098513c1d'
        },
        {
            name: 'testFolderName2',
            id: '4455-8303-096098513c1d-47c98e93-1709'
        }
    ];

    learningObject = {
        id: '1709-47c98e93-4455-8303-096098513c1d',
        "name": "testLOName1",
        "title": "testLOTitle1",
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "learningObjectives": [],
        '@class': 'LearningObject'
    };

    learningObjects = [
        {
            id: '1709-47c98e93-4455-8303-096098513c1d',
            "name": "testLOName1",
            "title": "testLOTitle1",
            "url": "/learningObjects/57e19c35185e1e8c93db6f61",
            "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
            "learningObjectives": []
        },
        {
            id: '47c98e93-4455-1709-8303-096098513c1d',
            "name": "testLOName2",
            "title": "testLOTitle2",
            "url": "/learningObjects/57e19c35185e1e8c93db6f61",
            "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
            "learningObjectives": []
        }
    ];

    loMetadata = {
        "context": "ANY",
        "difficulty": "ANY",
        "endUser": "ANY",
        "interactivityDegree": "ANY",
        "language": "English",
        "status": "ANY",
        "extraMetadata": []
    };

    loContents = {
        "mimeType": "text/html",
        "md5": 'md5String'
    }
});


describe('Find item by path', function() {

    let queryMethod, clientGetMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
        clientGetMethod = sinon.stub(sdkClientMock, 'get');
    });

    afterEach(function () {
        odbMock.query.restore();
        sdkClientMock.get.restore();
    });

    it('Returns the desired folder when the curriculum and the path are valid', function(done) {
        queryMethod.returns(Promise.resolve([folder]));
        let itemPath = ['subfolder1', 'subfolder2'];
        let currId = '47c98e93-1709-4455-8303-096098513c1d';

        let queryParams = {params: {curriculumId: currId}};
        let queryString = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            queryParams.params[subItem] = itemName;
            queryString = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${queryString})) WHERE name = :${subItem}`
        });

        folderService.findByPath(currId, itemPath).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be the test folder.
            (JSON.stringify(folder)).should.be.equal(JSON.stringify(res));

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Returns the desired learningObject when the curriculum and the path are valid', function(done) {
        queryMethod.returns(Promise.resolve([learningObject]));
        let itemPath = ['subfolder1', 'loName'];
        let currId = '47c98e93-1709-4455-8303-096098513c1d';

        let queryParams = {params: {curriculumId: currId}};
        let queryString = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            queryParams.params[subItem] = itemName;
            queryString = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${queryString})) WHERE name = :${subItem}`
        });

        folderService.findByPath(currId, itemPath).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be the test learningObject.
            (JSON.stringify(learningObject)).should.be.equal(JSON.stringify(res));

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    describe('Find item with expand parameters', function() {

        it('Returns the expanded folder', function(done) {
            let itemPath = ['subfolder1', 'subfolder2'];
            let currId = '47c98e93-1709-4455-8303-096098513c1d';

            let queryParams = {params: {curriculumId: currId}};
            let queryString = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
            _.forEach(itemPath, function(itemName, index) {
                let subItem = `item${index}`;
                queryParams.params[subItem] = itemName;
                queryString = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${queryString})) WHERE name = :${subItem}`
            });

            let subFoldersQueryParams = {params: {id: folder.id}};
            let subFoldersQuery = `SELECT id, name FROM 
                        (SELECT EXPAND(OUT()) FROM (SELECT FROM Folder WHERE id = :id)) 
                            WHERE @class='Folder'`;

            let loQueryParams = {params: {id: folder.id}};
            let learningObjectsQuery = `SELECT id, name, title, url, contentUrl, learningObjectives 
                        FROM (SELECT EXPAND(OUT()) FROM (SELECT FROM Folder WHERE id = :id)) 
                            WHERE @class='LearningObject'`;

            // Change method return values.
            queryMethod.withArgs(queryString, queryParams).returns(Promise.resolve([folder]));
            queryMethod.withArgs(subFoldersQuery, subFoldersQueryParams).returns(Promise.resolve(folders));
            queryMethod.withArgs(learningObjectsQuery, loQueryParams).returns(Promise.resolve(learningObjects));

            folderService.findByPath(currId, itemPath, ['folders', 'learningObjects']).then(function(res) {

                // Check methods invocation.
                queryMethod.should.have.been.calledThrice;
                queryMethod.should.have.been.calledWith(queryString, queryParams);
                queryMethod.should.have.been.calledWith(learningObjectsQuery, loQueryParams);
                queryMethod.should.have.been.calledWith(subFoldersQuery, subFoldersQueryParams);

                // The result should be the test folder.
                res.id.should.be.equal(folder.id);
                res.name.should.be.equal(folder.name);

                // The result should have the test folders and test learningObjects.
                JSON.stringify(res.folders).should.be.equal(JSON.stringify(folders));
                JSON.stringify(res.learningObjects).should.be.equal(JSON.stringify(learningObjects));

                done()
            }).catch(function(err) {
                done(err)
            });
        });

        it('Returns the expanded learning object', function(done) {
            let itemPath = [];
            let currId = '47c98e93-1709-4455-8303-096098513c1d';

            let queryParams = {params: {curriculumId: currId}};
            let queryString = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;

            let loUrl = learningObject.url;
            let loContentsUrl = `${loUrl}/contents`;
            let urlSplit = learningObject.contentUrl.split('?');
            let loBase64Url = `${urlSplit[0]}/base64?${urlSplit[1]}`;

            console.log(queryString);
            queryMethod.withArgs(queryString, queryParams).returns(Promise.resolve([learningObject]));
            clientGetMethod.withArgs(loUrl).returns(Promise.resolve({metadata: loMetadata}));
            clientGetMethod.withArgs(loContentsUrl).returns(Promise.resolve(loContents));
            clientGetMethod.withArgs(loBase64Url).returns(Promise.resolve({base64: 'BASE64String'}));

            folderService.findByPath(currId, itemPath, ['metadata', 'contents']).then(function(res) {

                // Check methods invocation.
                queryMethod.should.have.been.calledOnce;
                queryMethod.should.have.been.calledWith(queryString, queryParams);
                clientGetMethod.should.have.been.calledThrice;
                clientGetMethod.should.have.been.calledWith(loUrl);
                clientGetMethod.should.have.been.calledWith(loContentsUrl);
                clientGetMethod.should.have.been.calledWith(loBase64Url);

                // The result should be the test learningObject.
                res.id.should.be.equal(learningObject.id);
                res.name.should.be.equal(learningObject.name);

                // The result should have contents and metadata.
                loContents.base64 = "BASE64String";
                JSON.stringify(res.contents).should.be.equal(JSON.stringify(loContents));
                JSON.stringify(res.metadata).should.be.equal(JSON.stringify(loMetadata));

                done()
            }).catch(function(err) {
                done(err)
            });
        });
    });

    it('Returns an empty object when the item does not exist', function(done) {
        // The query result will be an empty array because the item was not found.
        queryMethod.returns(Promise.resolve([]));

        let currId = '47c98e93-1709-4455-8303-096098513c1d';
        let itemPath = ['unknownItem'];

        let queryParams = {params: {curriculumId: currId}};
        let queryString = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            queryParams.params[subItem] = itemName;
            queryString = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${queryString})) WHERE name = :${subItem}`
        });

        folderService.findByPath(currId, itemPath).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;

            JSON.stringify(res).should.be.equal('{}');

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});

describe('Insert new item', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Creates the desired item successfully when the parameters are valid', function(done) {

        let currId = '47c98e93-1709-4455-8303-096098513c1d';
        let itemPath = ['subfolder1'];


        // Mock odb methods.
        let returnMock = {one: function(){ return Promise.resolve(learningObject)}};
        let commitMock = {return: function(){}};
        let letMock = {let: function(){}, commit: function(){}};

        // Stub mocks.
        let commitReturnMethod = sinon.stub(commitMock, 'return', function() { return returnMock });
        let letCommitMethod = sinon.stub(letMock, 'commit', function() { return commitMock });
        let letChainedLetMethod = sinon.stub(letMock, 'let', function() {return letMock;});
        let odbLet = sinon.stub(odbMock, 'let', function() {return letMock;});

        let rootQueryParams = {params: {curriculumId: currId}};
        let rootQuery = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;

        let getChildQueryParams = {params: {id: folder.id, name: 'subfolder1'}};
        let getChildQuery = `SELECT FROM (SELECT EXPAND(OUT()) 
                                FROM (SELECT FROM Folder WHERE id = :id)) WHERE name = :name`;

        let containsItemParams = {params: {id: folder.id, name: learningObject.name}};
        let containsItemQuery = `SELECT @rid FROM (SELECT EXPAND(OUT()) FROM 
                        (SELECT FROM Folder WHERE id = :id)) 
                            WHERE name = :name`;

        queryMethod.withArgs(rootQuery, rootQueryParams).returns(Promise.resolve([folder]));
        queryMethod.withArgs(getChildQuery, getChildQueryParams).returns(Promise.resolve([folder]));
        queryMethod.withArgs(containsItemQuery, containsItemParams).returns(Promise.resolve([]));


        folderService.insertForce(currId, itemPath, learningObject).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledWith(rootQuery, rootQueryParams);         // The root folder is retrieved before checking the path.
            queryMethod.should.have.been.calledWith(getChildQuery, getChildQueryParams);     // FindLastValidFolder method executes this query.
            queryMethod.should.have.been.calledWith(containsItemQuery, containsItemParams); // SaveItem method executes this query.

            odbLet.should.have.been.calledOnce;                 // Item vertex creation.
            letChainedLetMethod.should.have.been.calledOnce;    // Edge between parent folder and the new item.
            letCommitMethod.should.have.been.calledOnce;        // Commit transaction.
            commitReturnMethod.should.have.been.calledOnce;

            // The result should be the test learningObject with a uuid.
            res.id.should.be.a('string');
            res.name.should.be.equal(learningObject.name);
            res.title.should.be.equal(learningObject.title);
            res.url.should.be.equal(learningObject.url);
            res.contentUrl.should.be.equal(learningObject.contentUrl);
            res.learningObjectives.should.be.equal(learningObject.learningObjectives);
            res['@class'].should.be.equal(learningObject['@class']);

            done()
        }).catch(function(err) {
            done(err)
        });

    });

    it('Returns an empty object when the path is not valid', function(done) {
        // The query result will be an empty array because the item was not found.
        queryMethod.returns(Promise.resolve([]));

        let currId = '47c98e93-1709-4455-8303-096098513c1d';
        let itemPath = ['subfolder1', 'unknownFolder'];

        folderService.insertForce(currId, itemPath, folder).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;

            JSON.stringify(res).should.be.equal('{}');

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});

describe('Update item', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Updates the item when the id exists', function(done) {

        let currId = 'currId';
        let itemPath = ['subfolder1', 'folderName'];

        let findItemQueryParams = {params: {curriculumId: currId}};
        let findItemByPathQuery = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            findItemQueryParams.params[subItem] = itemName;
            findItemByPathQuery = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${findItemByPathQuery})) WHERE name = :${subItem}`
        });

        let containsItemQueryParams = {params: {id: folder.id, name: folder.name}};
        let parentContainsItemQuery = `SELECT @rid FROM (SELECT EXPAND(IN().OUT()) FROM 
                        (SELECT FROM Folder WHERE id = :id)) 
                            WHERE not(id = :id) and name = :name`;

        let queryParams = {params: {content: folder, id: '47c98e93-1709-4455-8303-096098513c1d'}};
        let queryString = `UPDATE Folder MERGE :content WHERE id = :id`;

        queryMethod.withArgs(findItemByPathQuery, findItemQueryParams).returns(Promise.resolve([folder]));
        // The query result will be an empty array because the item does not exist inside the parentsFolder.
        queryMethod.withArgs(parentContainsItemQuery, containsItemQueryParams).returns(Promise.resolve([]));
        queryMethod.withArgs(queryString, queryParams).returns(Promise.resolve([1]));

        folderService.update('currId', itemPath, folder).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledThrice;
            queryMethod.should.have.been.calledWith(findItemByPathQuery, findItemQueryParams);
            queryMethod.should.have.been.calledWith(parentContainsItemQuery, containsItemQueryParams);
            queryMethod.should.have.been.calledWith(queryString, queryParams);

            // The result should be an object with updatedRecords equals to 1.
            res.updatedRecords.should.be.equal(1);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

    it('Returns 0 updated records when the item does not exist', function(done) {
        let currId = 'currId';
        let itemPath = ['subfolder1', 'loName'];

        let findItemQueryParams = {params: {curriculumId: currId}};
        let findItemByPathQuery = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            findItemQueryParams.params[subItem] = itemName;
            findItemByPathQuery = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${findItemByPathQuery})) WHERE name = :${subItem}`
        });

        // The query result will be an empty array because the item was not found.
        queryMethod.withArgs(findItemByPathQuery, findItemQueryParams).returns(Promise.resolve([]));

        folderService.update(currId, itemPath, folder).then(function(res) {
            res.updatedRecords.should.be.equal(0);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

});

describe('Delete an item', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Delete the item when the path is valid', function(done) {

        let currId = 'currId';
        let itemPath = ['subfolder1', 'loName'];

        let findItemQueryParams = {params: {curriculumId: currId}};
        let findItemByPathQuery = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            findItemQueryParams.params[subItem] = itemName;
            findItemByPathQuery = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${findItemByPathQuery})) WHERE name = :${subItem}`
        });

        let queryParams = {params: {id: folder.id}};
        let queryString = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM V WHERE id = :id))`;

        queryMethod.withArgs(findItemByPathQuery, findItemQueryParams).returns(Promise.resolve([folder]));
        queryMethod.withArgs(queryString, queryParams).returns(Promise.resolve([1]));

        folderService.remove(currId, itemPath).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledTwice;
            queryMethod.should.have.been.calledWith(findItemByPathQuery, findItemQueryParams);
            queryMethod.should.have.been.calledWith(queryString, queryParams);

            // The result should be an object with updatedRecords equals to 1.
            res.deletedRecords.should.be.equal(1);

            done()
        }).catch(function(err) {
            done(err)
        })

    });

    it('Return 0 deleted records when the item does not exist', function(done) {
        let currId = 'currId';
        let itemPath = ['subfolder1', 'loName'];

        let findItemQueryParams = {params: {curriculumId: currId}};
        let findItemByPathQuery = `SELECT FROM(SELECT EXPAND(OUT()) FROM (SELECT FROM Curriculum WHERE id = :curriculumId)) WHERE name='root'`;
        _.forEach(itemPath, function(itemName, index) {
            let subItem = `item${index}`;
            findItemQueryParams.params[subItem] = itemName;
            findItemByPathQuery = `SELECT FROM (SELECT EXPAND(OUT()) FROM (${findItemByPathQuery})) WHERE name = :${subItem}`
        });

        // The query result will be an empty array because the item was not found.
        queryMethod.withArgs(findItemByPathQuery, findItemQueryParams).returns(Promise.resolve([]));

        folderService.remove(currId, itemPath).then(function(res) {
            res.deletedRecords.should.be.equal(0);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

});
