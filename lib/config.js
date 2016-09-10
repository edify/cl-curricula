/**
 * Created by diugalde on 08/09/16.
 */


const config = {
	server: {
	    ssl: {
	        enabled: false
        },
		port: (process.env.CL_CURR_SERVER_PORT || 8081),
        apiURL: 'api/v1'
	},
    redis: {
        port: (process.env.CL_REDIS_PORT || 6379)
    },
    orient: {
        dbname: 'cl-curr-dev',
        host: (process.env.CL_ORIENTDB_HOST || 'localhost'),
        port: (process.env.CL_ORIENTDB_PORT || 2434)
    },
    auth: {
        passphrase: process.env.CL_AUTH_PASSPHRASE
    }
};


module.exports = config;