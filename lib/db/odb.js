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

const _ = require('lodash');
const deasync = require('deasync');
const orientjs = require('orientjs');

const config = require('../config');
const log = require('../utils/log');

// Orientdb connection object.
var odbsrv = orientjs({
    host: config.orientdb.host,
    port: config.orientdb.port,
    username: config.orientdb.rootusr,
    password: config.orientdb.rootpwd
});

var db = (function () {
    let done = false;
    let odb;

    odbsrv.list().then(function (dbList) {
        // If the database does not exist, it will be created with a new user.
        if (_.isEmpty(_.find(dbList, function(db) { return db.name === config.orientdb.name}))) {
            log.info('[odb.js] setting up new database');
            return odbsrv.create({
                name: config.orientdb.name,
                type: 'graph',
                storage: 'plocal'
            }).then(function (db) {
                odb = db;
                log.info('[odb.js] setting up new db user');
                return odb.query('SELECT FROM ORole WHERE name IN ["admin","reader","writer"]')
            }).then(function(roles) {
                return odb.insert().into('OUser').set({
                    name: config.orientdb.usr,
                    password: config.orientdb.pwd,
                    status: 'ACTIVE',
                    roles: _.map(roles, function(role) { return role['@rid'] })
                }).one();
            }).catch(function(err) {
                throw err
            })
        } else {
            return Promise.resolve({})
        }
    }).then(function () {
        done = true
    }).catch(function(err) {
        throw err
    });

    deasync.loopWhile(function(){return !done});

    return odbsrv.use({
        name: config.orientdb.name,
        username: config.orientdb.usr,
        password: config.orientdb.pwd
    });
})();


// Run migrations.
let manager = new orientjs.Migration.Manager({
    db: db,
    dir: `${__dirname}/migrations`
});

manager.up().then(function(appliedMigrations) {
    if (!appliedMigrations.length) {
        log.info('[odb.js] All migrations were already applied.');
    } else {
        log.info(`[odb.js] Successfully applied ${appliedMigrations.length} migrations.`);
    }

});

module.exports = db;
