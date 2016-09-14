/**
 * Created by diugalde on 08/09/16.
 */


const config = {
	server: {
	    ssl: {
	        enabled: false
        },
		port: (process.env.CL_CURRICULA_PORT || 8081),
        apiURL: 'api/v1'
	},
    orient: {
        dbname: 'cl-curr-dev',
        host: (process.env.CL_ORIENTDB_HOST || 'localhost'),
        port: (process.env.CL_ORIENTDB_PORT || 2434)
    }
};


module.exports = config;