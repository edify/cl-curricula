# cl-curricula

Common Library Curricula Micro service

---

## Build and Run

1.  First, you need to install nodejs v6.4.0. You can follow the instructions here [NodeJS](https://nodejs.org).

2.  Install all the dependencies:
```bash
$ npm install
```

3.  You must set some environment variables before running the application. The following are the default values:
```bash
$ export CL_CURRICULA_PORT=8081
$ export CL_ODB_NAME=cl-curr-dev
$ export CL_ODB_HOST=localhost
$ export CL_ODB_PORT=2434
$ export CL_ODB_ROOT_USR=root
$ export CL_ODB_ROOT_PWD=root
$ export CL_ODB_USR=cl_orient_user
$ export CL_ODB_PWD=cl_orient_pwd
$ export CL_LO_API_ID=apiKeyId
$ export CL_LO_API_SECRET=apiSecretKey
$ export CL_REDIS_HOST=localhost
$ export CL_REDIS_PORT=6379
$ export CL_AUTH_PASSPHRASE=stringUsedInTheBootstrapper
```
  - You can get CL_LO_API_ID and CL_LO_API_SECRET using the cl-auth/bootstrap script.

4.  Before executing the main file, you need to make sure that your redis and orientdb instances are running (check docker-compose file in the cl-core project).

5.  Execute the main file to start the server:
```bash
$ chmod +x bin/curricula
$ ./bin/curricula
```
