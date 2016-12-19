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
 * Created by diugalde on 08/09/16.
 */


const config = {
    server: {
        audit: process.env.CL_CURRICULA_AUDIT || false,
        ssl: {
            enabled: false
        },
        port: (process.env.CL_CURRICULA_PORT || 8081),
        apiURL: '/api/v1'
    },
    lo: {
        baseURL: (process.env.CL_LO_BASE_URL || 'http://localhost:8080'),
        apiURL: (process.env.CL_LO_API_URL || '/api/v1')
    },
    orientdb: {
        name: (process.env.CL_ODB_NAME || 'cl-curr-dev'),
        host: (process.env.CL_ODB_HOST || 'localhost'),
        port: (process.env.CL_ODB_PORT || 2424),
        rootusr: process.env.CL_ODB_ROOT_USR || 'root',
        rootpwd: process.env.CL_ODB_ROOT_PWD || 'root',
        usr: process.env.CL_ODB_USR || 'cl_orient_user',
        pwd: process.env.CL_ODB_PWD || 'cl_orient_pwd'
    }
};


module.exports = config;
