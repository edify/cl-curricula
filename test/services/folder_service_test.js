/**
 * Created by diugalde on 19/09/16.
 */

const assert = require('assert');
const chai = require('chai');
const sinon = require('sinon');

const folderService = require('../../lib/services/folder_service');


describe('Find item by path', function() {

    it('Returns the desired item when the curriculum and the path are valid', function(done) {
        done()
    });

    describe('Find item with expand parameters', function() {

        it('Returns the expanded folder', function(done) {
            done()
        });

        it('Returns the expanded learning object', function(done) {
            done()
        });
    });

    it('Returns the desired item and the expand when the curriculum and the path are valid', function(done) {
        done()
    });

    it('Throws a not found error when the curriculum does not exist', function(done) {
        done()
    });

    it('Throws a not found error when the path is invalid', function(done) {
        done()
    });

});

describe('Insert new item with valid', function() {

    it('Creates the desired item successfully when the parameters are valid', function(done) {
        done()
    });

    it('Throws an error if the parent folder does not exist', function(done) {
        done()
    });

});

describe('Insert new item creating path if not exists', function() {

    it('Creates the desired item successfully when the parameters are valid', function(done) {
        done()
    });

    it('Throws an error if the path is not valid', function(done) {
        done()
    });

});

describe('Update item', function() {

    it('Updates the item when de id exists', function(done) {
        done()
    });

    it('Throws a not found error when the id does not exist', function(done) {
        done()
    });

});

describe('Delete an item', function() {

    it('Delete the item when the path is valid', function(done) {
        done()
    });

    it('Throws a not found error when the item path does not exist', function(done) {
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
