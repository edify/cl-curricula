/**
 * Created by diugalde on 08/09/16.
 */

const bunyan = require('bunyan');
const bunyanPrettyStream = require('bunyan-prettystream');
const restify = require('restify');

const APP_NAME = 'cl-curricula';

// Init bunyan log with a nice output format.
var prettyStdOut = new bunyanPrettyStream();
prettyStdOut.pipe(process.stdout);

var log = bunyan.createLogger({
    name: APP_NAME,
    streams: [
        { level: "debug", type: "raw", stream: prettyStdOut },
        { level: "info", type: "raw", stream: prettyStdOut },
        { level: "warn", type: "raw", stream: prettyStdOut },
        { level: "error", type: "raw", stream: prettyStdOut },
        { level: "fatal", type: "raw", stream: prettyStdOut },
    ],
    serializers: restify.bunyan.serializers
});

module.exports = log;