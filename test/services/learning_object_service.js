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
const learningObjectService = require('../../lib/services/learning_object_service');


describe('Synchronize all updated learning objects', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Set updated property for all learning objects with the specified id', function(done) {

        queryMethod.returns(Promise.resolve([3]));

        learningObjectService.updateSync('57e19c35185e1e8c93db6f00').then(function(res) {
            let queryParams = {params: {id: '57e19c35185e1e8c93db6f00'}};
            let queryString = `UPDATE LearningObject SET updated=true WHERE learningObjectId = :id`;

            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be an object with updatedRecords equals to 1.
            res.updatedRecords.should.be.equal(3);

            done()
        }).catch(function(err) {
            done(err)
        })
    });
});

describe('Synchronize all deleted learning objects', function() {

    let queryMethod;

    beforeEach(function() {
        queryMethod = sinon.stub(odbMock, 'query');
    });

    afterEach(function () {
        odbMock.query.restore();
    });

    it('Set deleted property for all learning objects with the specified id', function(done) {

        queryMethod.returns(Promise.resolve([3]));

        learningObjectService.removeSync('57e19c35185e1e8c93db6f00').then(function(res) {
            let queryParams = {params: {id: '57e19c35185e1e8c93db6f00'}};
            let queryString = `UPDATE LearningObject SET deleted=true WHERE learningObjectId = :id`;

            // Check methods invocation.
            queryMethod.should.have.been.calledOnce;
            queryMethod.should.have.been.calledWithExactly(queryString, queryParams);

            // The result should be an object with updatedRecords equals to 1.
            res.updatedRecords.should.be.equal(3);

            done()
        }).catch(function(err) {
            done(err)
        })
    });
});

