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

