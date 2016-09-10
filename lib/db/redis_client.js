/**
 * Created by diugalde on 09/09/16.
 */

const bluebird = require('bluebird');
const redis = require('redis');

const config = require('../config');

// Promisify redis client.
bluebird.promisifyAll(redis.RedisClient.prototype);

var redisClient = redis.createClient(config.redis.port);

module.exports = redisClient;