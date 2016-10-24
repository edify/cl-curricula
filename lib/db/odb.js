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


module.exports = db;
