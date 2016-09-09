/**
 * Created by diugalde on 08/09/16.
 */

const bluebird = ('bluebird');
const redis = require('redis');

// Promisify redis client.
bluebird.promisifyAll(redis.RedisClient.prototype);

const config = {
	'server': {
		'port': (process.env.CL_CURR_SERVER_PORT || 8081),
        'apiURL': 'api/v1'
	},
    'redis': {
        'port': (process.env.CL_CURR_REDIS_PORT || 6379)
    }
};


module.exports = config;