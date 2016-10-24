/**
 * Created by diugalde on 19/09/16.
 */

"use strict";

const _ = require('lodash');

const log = require('../../utils/log');

exports.name = "initial indexes";

exports.up = function(db) {
    log.info('Applying m20160918_220349_initial_indexes migration');

    let indexes = [
        {
            name: 'Curriculum.id',
            type: 'UNIQUE'
        },

        {
            name: 'Folder.id',
            type: 'UNIQUE'
        },

        {
            name: 'LearningObject.id',
            type: 'UNIQUE'
        },

        {
            name: 'Folder.name',
            type: 'NOTUNIQUE'
        }
    ];

    return Promise.all(
        _.map(indexes, function(newIndex) {
            return db.index.create(newIndex).catch(function(err) {
                throw err
            })
        })
    );

};

exports.down = function(db) {
    let indexes = ['Curriculum.id', 'Folder.id', 'LearningObject.id', 'Folder.name'];

    return Promise.all(_.map(indexes, function(index) {
        return db.index.drop(index);
    }));
};

