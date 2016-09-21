/**
 * Created by diugalde on 19/09/16.
 */

const assert = require('assert');
const chai = require('chai');
const sinon = require('sinon');

const curriculumService = require('../../lib/services/curriculum_service');


describe('Find curriculum by id', function() {

    it('Returns the desired curriculum when the id exists', function(done) {
        done()
    });

    it('Throws a not found error when the id does not exist', function(done) {
        done()
    });

});

describe('Find all curricula', function() {

    it('Returns all the curricula in database when the parameter all is true', function(done) {
        done()
    });

    it('Returns the correct page when the parameter all is false', function(done) {
        done()
    });

});

describe('Insert a new curricula', function() {

    it('Commits successfully a transaction for the curriculum and its root folder', function(done) {
        done()
    });

});

describe('Update a curriculum', function() {

    it('Update the curriculum when de id exists', function(done) {
        done()
    });

    it('Throws a not found error when the id does not exist', function(done) {
        done()
    });

});

describe('Delete a curriculum', function() {

    it('Delete the curriculum when the id exists', function(done) {
        done()
    });

    it('Throws a not found error when the id does not exist', function(done) {
        done()
    });

});

describe('Find curriculum by learning objective name', function() {

    it('Retrieves all the matched curricula when the parameter all is true', function(done) {
        done()
    });

    it('Retrieves the correct curricula page when the parameter all is false', function(done) {
        done()
    });

});
