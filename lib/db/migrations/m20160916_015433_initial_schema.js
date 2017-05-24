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
 * Created by diugalde on 13/09/16.
 */

"use strict";

const _ = require('lodash');

const log = require('../../utils/log');

exports.name = "initial_schema";

exports.up = function(db) {
    log.info('Applying m20160916_015433_initial_schema.js migration');

    let initialClasses = [

        // Embedded classes.
        {
            name: 'LearningObjective',
            props: [
                {name: 'name', type: 'String', notNull: true},
                {name: 'description', type: 'String'},
                {name: 'url', type: 'String'}
            ]
        },

        {
            name: 'Metadata',
            props: [
                {name: 'keywords', type: 'String'},
                {name: 'coverage', type: 'String'},
                {name: 'context', type: 'String'},
                {name: 'difficulty', type: 'String'},
                {name: 'endUser', type: 'String'},
                {name: 'interactivityDegree', type: 'String'},
                {name: 'language', type: 'String'},
                {name: 'status', type: 'String'},
                {name: 'author', type: 'String'},
                {name: 'topic', type: 'String'},
                {name: 'isbn', type: 'String'},
                {name: 'price', type: 'Double'},
                {name: 'extraMetadata', type: 'EMBEDDEDLIST', linkedType: 'String'},
            ]
        },

        // Vertex classes.
        {
            name: 'LearningObject',
            superClass: 'V',
            props: [
                {name: 'id', type: 'String', notNull: true, readonly: true},
                {name: 'learningObjectId', type: 'String', notNull: true, readonly: true},
                {name: 'deleted', type: 'Boolean'},
                {name: 'updated', type: 'Boolean'},
                {name: 'name', type: 'String', notNull: true},
                {name: 'title', type: 'String'},
                {name: 'url', type: 'String', notNull: true},
                {name: 'contentUrl', type: 'String'},
                {name: 'learningObjectives', type: 'EMBEDDEDLIST', linkedClass: 'LearningObjective'}
            ]
        },

        {
            name: 'Folder',
            superClass: 'V',
            props: [
                {name: 'id', type: 'String', notNull: true, readonly: true},
                {name: 'name', type: 'String', notNull: true}
            ]
        },

        {
            name: 'Curriculum',
            superClass: 'V',
            props: [
                {name: 'id', type: 'String', notNull: true, readonly: true},
                {name: 'name', type: 'String', notNull: true},
                {name: 'title', type: 'String'},
                {name: 'discipline', type: 'String'},
                {name: 'description', type: 'String'},
                {name: 'enabled', type: 'Boolean'},
                {name: 'metadata', type: 'EMBEDDED', linkedClass: 'Metadata'},
                {name: 'learningObjectives', type: 'EMBEDDEDLIST', linkedClass: 'LearningObjective'}
            ]
        }
    ];

    return Promise.all(
        _.map(initialClasses, function(newClass) {
            return db.class.create(newClass.name, newClass.superClass)
                .then(function (myClass) {
                    if (newClass.props) {
                        return myClass.property.create(newClass.props);
                    }
                }).catch(function(err) {
                    throw err
                });
        })
    );
};

exports.down = function(db) {
    let classes = ['LearningObjective', 'Metadata', 'LearningObject', 'Folder', 'Curriculum'];

    return Promise.all(_.map(classes, function(cls) {
        return db.class.drop(cls);
    }));
};


