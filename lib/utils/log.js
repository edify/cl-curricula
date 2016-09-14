/**
 * Created by diugalde on 08/09/16.
 */

const bunyan = require('bunyan');
const bunyanFormat = require('bunyan-format');

const APP_NAME = 'cl-curricula';

// Init bunyan log with a nice output format.
var bunyanFormatStdOut = bunyanFormat({ outputMode: 'short' });

var log = bunyan.createLogger({
    name: APP_NAME,
    streams: [
        { level: "info", stream: bunyanFormatStdOut },
        { level: "error", stream: bunyanFormatStdOut }
    ]
});

module.exports = log;