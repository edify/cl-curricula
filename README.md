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
$ export CL_CURR_SERVER_PORT=8081
$ export CL_CURR_REDIS_PORT=6379
$ export CL_LO_API_ID=apiKeyId
$ export CL_LO_API_SECRET=apiSecretKey
```
  - You can get CL_LO_API_ID and CL_LO_API_SECRET using the cl-auth/bootstrap script.

4.  Before executing the main file, you need to make sure that your redis and orientdb instances are running (check docker-compose file in the cl-core project).

5.  Execute the main file to start the server:
```bash
$ nodejs main.js
```
