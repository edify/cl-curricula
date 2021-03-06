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
 * Created by diugalde on 19/09/16.
 */

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

mockRequire('../../lib/utils/log', {info(str) {}});
mockRequire('../../lib/db/odb', odbMock);

// Require module that will be tested.
const curriculumService = require('../../lib/services/curriculum_service');


// Shared variables.
var curriculum, curricula, learningObjective;

before(function() {
    curriculum = {
        id: "47c98e93-1709-4455-8303-096098513c1d",
        name: "c1",
        metadata: {}
    };

    curricula = [
        {
            id: '47c98e93-1709-4455-8303-096098513c1d',
            name: 'Curriculum1'
        },
        {
            id: 'sdfds3a-1709-4455-8303-096098513c1d',
            name: 'Curriculum2'
        }
    ];

    learningObjective = {
            "name": "objective3",
            "description": "objective3 Description",
            "url": "/learningObjectives/591c877be114c66bcf67c0a1"
    };
});

describe('Find curriculum by id', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Returns the desired curriculum when the id exists', function(done) {

        queryMethod.returns(Promise.resolve([curriculum]));

        curriculumService.findById('47c98e93-1709-4455-8303-096098513c1d').then(function(res) {
            let queryParams = {params: {id: '47c98e93-1709-4455-8303-096098513c1d'}};
            let queryString = `SELECT id, name, title, discipline, description, enabled, metadata
                     FROM Curriculum
                     WHERE id = :id`;

            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be the test curriculum.
            (JSON.stringify(curriculum)).should.be.equal(JSON.stringify(res));

            done()
        }).catch(function(err) {
            done(err)
        });

    });

    it('The result is empty when the curriculum does not exist', function(done) {
        // Return empty results.
        queryMethod.returns(Promise.resolve([]));

        curriculumService.findById('UnknownId').then(function(res) {

            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;

            JSON.stringify(res).should.be.equal('{}');

            done()
        }).catch(function(err) {
            done(err)
        });

    });

});

describe('Find all curricula', function() {

    let queryMethod, countQuery;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
        countQuery = 'SELECT COUNT(*) FROM Curriculum';
        queryMethod.withArgs(countQuery).returns(Promise.resolve([{COUNT: 2}]));
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Returns all the curricula in database when the parameter all is true', function(done) {
        let queryParams = {};
        let queryStr = 'SELECT id, name, title, discipline, description, enabled, metadata FROM Curriculum';

        queryMethod.withArgs(queryStr, queryParams).returns(Promise.resolve(curricula));

        curriculumService.findAll(0, 0, true).then(function(res) {

            // Check methods invocation.
            queryMethod.should.have.been.calledTwice;
            queryMethod.should.have.been.calledWith(countQuery);
            queryMethod.should.have.been.calledWith(queryStr, queryParams);

            // The result should be the test curricula.
            JSON.stringify(res.content).should.be.equal(JSON.stringify(curricula));

            // Check page properties.
            res.firstPage.should.be.ok;
            res.lastPage.should.be.ok;
            res.totalPages.should.be.equal(1);
            res.totalElements.should.be.equal(2);
            res.numberOfElements.should.be.equal(2);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

    it('Returns the correct page when the parameter all is false', function(done) {
        let queryParams = {params: {from: 0, size: 1}};
        let queryStr = 'SELECT id, name, title, discipline, description, enabled, metadata FROM Curriculum SKIP :from LIMIT :size';

        queryMethod.withArgs(queryStr, queryParams).returns(Promise.resolve([curricula[0]]));

        curriculumService.findAll(0, 1, false).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledTwice;
            queryMethod.should.have.been.calledWith(countQuery);
            queryMethod.should.have.been.calledWith(queryStr, queryParams);

            // The result should be the first test curricula item.
            JSON.stringify(res.content).should.be.equal(JSON.stringify([curricula[0]]));

            // Check page properties.
            res.firstPage.should.be.ok;
            res.lastPage.should.be.not.ok;
            res.totalPages.should.be.equal(2);
            res.totalElements.should.be.equal(2);
            res.numberOfElements.should.be.equal(1);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});

describe('Insert a new curricula', function() {

    it('Commits successfully a transaction for the curriculum and its root folder', function(done) {
        // Mock odb methods.
        let returnMock = {one: function(){ return Promise.resolve(curriculum)}};
        let commitMock = {return: function(){}};
        let letMock = {let: function(){}, commit: function(){}};

        // Stub mocks.
        let commitReturnMethod = sinon.stub(commitMock, 'return', function() { return returnMock });
        let letCommitMethod = sinon.stub(letMock, 'commit', function() { return commitMock });
        let letChainedLetMethod = sinon.stub(letMock, 'let', function() {return letMock;});
        let odbLet = sinon.stub(odbMock, 'let', function() {return letMock;});

        curriculumService.insert(curriculum).then(function(res) {
            // Check methods invocation.
            odbLet.should.have.been.calledOnce;                 // Curriculum vertex creation.
            letChainedLetMethod.should.have.been.calledTwice;   // Root folder and the respective edge.
            letCommitMethod.should.have.been.calledOnce;        // Commit transaction.
            commitReturnMethod.should.have.been.calledOnce;

            // The result should be the inserted curriculum with a generated id.
            res.id.should.be.a('string');
            res.name.should.be.equal(curriculum.name);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});

describe('Update a curriculum', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Update the curriculum when de id exists', function(done) {

        queryMethod.returns(Promise.resolve([1]));

        curriculumService.update('47c98e93-1709-4455-8303-096098513c1d', curriculum).then(function(res) {
            let queryParams = {params: {content: curriculum, id: '47c98e93-1709-4455-8303-096098513c1d'}};
            let queryString = `UPDATE Curriculum MERGE :content WHERE id = :id`;

            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be an object with updatedRecords equals to 1.
            res.updatedRecords.should.be.equal(1);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

    it('Returns 0 records updated when the curriculum does not exist', function(done) {
        queryMethod.returns(Promise.resolve([0]));

        curriculumService.update('UnknownId', curriculum).then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;

            res.updatedRecords.should.be.equal(0);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

});

describe('Delete a curriculum', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Delete the curriculum when the id exists', function(done) {
        queryMethod.returns(Promise.resolve([1]));

        curriculumService.remove('47c98e93-1709-4455-8303-096098513c1d').then(function(res) {
            let queryParams = {params: {id: '47c98e93-1709-4455-8303-096098513c1d'}};
            let queryString = `DELETE VERTEX FROM (TRAVERSE OUT() FROM (SELECT FROM Curriculum WHERE id = :id))`;

            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be an object with deletedRecords equals to 1.
            res.deletedRecords.should.be.equal(1);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

    it('Returns 0 removed records when the curriculum does not exist', function(done) {
        queryMethod.returns(Promise.resolve([0]));

        curriculumService.remove('UnknownId').then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;

            res.deletedRecords.should.be.equal(0);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

});

describe('Find curriculum by learning objective name', function() {

    let queryMethod, queryString;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
        queryString = `SELECT FROM 
                            (TRAVERSE in() FROM 
                                (SELECT FROM LearningObject WHERE :loName in learningObjectives.name)) 
                     WHERE @class= 'Curriculum'`;
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Retrieves all the matched curricula when the parameter all is true', function(done) {
        queryMethod.returns(Promise.resolve(curricula));
        let queryParams = {params: {loName: 'loName'}};

        curriculumService.findByLearningObjective(0, 1, true, 'loName').then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be the test curricula.
            JSON.stringify(res.content).should.be.equal(JSON.stringify(curricula));

            // Check page properties.
            res.firstPage.should.be.ok;
            res.lastPage.should.be.ok;
            res.totalPages.should.be.equal(1);
            res.totalElements.should.be.equal(2);
            res.numberOfElements.should.be.equal(2);

            done()
        }).catch(function(err) {
            done(err)
        })
    });

    it('Retrieves the correct curricula page when the parameter all is false', function(done) {
        queryMethod.returns(Promise.resolve(curricula));
        let queryParams = {params: {loName: 'loName'}};

        curriculumService.findByLearningObjective(0, 1, false, 'loName').then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be the test curricula.
            JSON.stringify(res.content).should.be.equal(JSON.stringify([curricula[0]]));

            // Check page properties.
            res.firstPage.should.be.ok;
            res.lastPage.should.be.not.ok;
            res.totalPages.should.be.equal(2);
            res.totalElements.should.be.equal(2);
            res.numberOfElements.should.be.equal(1);

            done()
        }).catch(function(err) {
            done(err)
        });
    });

});


describe('Find the linked learningObjectives for a specific curriculum', function() {

    let queryMethod, queryString, queryResult;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
        queryString = `SELECT learningObjectives FROM 
                            (TRAVERSE OUT() FROM 
                                (SELECT FROM Curriculum WHERE id = :id)) 
                     WHERE @class= 'LearningObject'`;
        queryResult = [{learningObjectives: [ learningObjective ]}]
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Retrieves all the learningObjectives implicitly associated to a curriculum', function(done) {
        queryMethod.returns(Promise.resolve(queryResult));
        let queryParams = {params: {id: 'curriculumId'}};

        curriculumService.getLinkedLearningObjectives('curriculumId').then(function(res) {
            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be an array with 1 element, the test learningObjective.
            JSON.stringify(res).should.be.equal(JSON.stringify([learningObjective]));

            done()
        }).catch(function(err) {
            done(err)
        })
    });

});
