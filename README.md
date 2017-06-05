# cl-curricula

Common Library Curricula Micro service

---

## Build and Run

1.  First, you need to install nodejs v6.4.0. You can follow the instructions here [NodeJS](https://nodejs.org).

2.  Install all the dependencies:
```bash
$ npm install
```

3.  You must set some environment variables before running the application:
```bash
export CL_CURRICULA_PORT=8081
export CL_CURRICULA_AUDIT=true
export CL_ODB_NAME=cl-curr-dev
export CL_ODB_HOST=localhost
export CL_ODB_PORT=2424
export CL_ODB_ROOT_USR=root
export CL_ODB_ROOT_PWD=root
export CL_ODB_USR=cl_orient_user
export CL_ODB_PWD=cl_orient_pwd
export CL_AUTH_PASSPHRASE=passphrase
export CL_LO_API_ID=
export CL_LO_API_SECRET=
export CL_REDIS_PORT=6379
export CL_REDIS_HOST=localhost
export CL_REDIS_PW=root
export CL_LO_BASE_URL=http://localhost:8080
export CL_LO_API_URL=/api/v1
```
  - You can get CL_LO_API_ID and CL_LO_API_SECRET using the cl-auth-js/bootstrap script.

4.  Before executing the main file, you need to make sure that your redis and orientdb instances are running.

5.  Execute the main file to start the server:
```bash
$ chmod +x bin/curricula
$ ./bin/curricula
```

Note: If it was the first time executing the cl-curricula application. The orient database will be created and all the migrations will be applied.

# **Build and deploy docker image**

```bash
$ curl -u<USERNAME>:<PASSWORD> https://edify.jfrog.io/edify/api/npm/auth > ~/.npmrc
$ rm -rf node_modules/
$ npm install
$ docker build -t cl-curricula .
$ docker tag cl-curricula edify-dkr.jfrog.io/cl-curricula:SEMANTIC_VERSION
$ docker login edify-dkr.jfrog.io
$ docker push edify-dkr.jfrog.io/cl-curricula
```


# **Curriculum REST API Reference**

This section covers the main concepts of the Common Library's Curriculum REST API. It will explain how the authentication works, as well as the available resources and their format. The allowed operations on the resorces are going to be detailed with command line examples using [cUrl](https://curl.haxx.se/docs/manpage.html).

# Base URL

For development purposes, the base URL will be pointing by default to the server that is running the cl-curricula application with the port 8081. This could be customized by editing the lib/config.js file. Besides that, the URL contains /api/v1 after the host name. Example:

        http://localhost:8081/api/v1

# Resource Format

This API uses only [JSON](http://www.w3schools.com/json/) to represent the resources.

# Authentication

This project uses the [Stormpath signature algorithm](https://github.com/stormpath/stormpath-sdk-spec/blob/master/specifications/algorithms/sauthc1.md) to authenticate requests.

An example of the required headers is shown below:
```
Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160904/0tjqOB9pVP/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=9207def3db7c144f03fb148e35ab461a0be308bd518f51c15112ab1067d4fa5b
X-Stormpath-Date: 20160904T051810Z
content-type: application/json
```

All the cUrl examples that will be shown need those headers in order to perform the requests successfully. Inside the cl-auth/cl-auth-js project there is a command line interface script that can generate the required headers so you can use them in cUrl.

Sauthc1_cli example:

1.  First you need to set environment variables. These values can be obtained by running the cl-auth bootstrap script.

  - CL_API_CLIENT_ID
  - CL_API_CLIENT_SECRET

2. Make sure you already installed all the NodeJS dependencies inside the cl-auth-js project:

```bash
$ cd ../cl-auth/cl-auth-js
$ npm install
$ chmod +x bin/sauthc1_cli
```

3. Use the script by passing the required arguments:

```bash
$ ./bin/sauthc1_cli --url http://localhost:8081/api/v1/curricula \
--method POST \
--body '{
            "name": "curriculumName",
            "title": "title",
            "discipline": "discipline",
            "description": "description",
            "enabled": true,
            "metadata": {}
        }' \
--id ${CL_API_CLIENT_ID} \
--secret ${CL_API_CLIENT_SECRET}
```

The previous command will output a string:

```JSON
{ 
    "Host": "localhost:8081",
    "X-Stormpath-Date": "20160905T154832Z",
    "Authorization": "SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/uYHxdluS6Q/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=9111371712bdf41917303d638ac39c4d4b8099017a32704e9fc36911c4915f13" 
}
```

Then, you can use those values to build a cUrl request:

```bash
curl -k --request POST \
--header "Authorization: SAuthc1 sauthc1Id=c4f58114f033bcc79b2759805a6c5961/20161219/07T0r01B9t/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=98125c3cf81675c09ca9a4901c929c5a3a34df162aa8987b9b38c910a2b22c8a" \
--header "X-Stormpath-Date: 20161219T193349Z" \
--header "Host: localhost:8081" \
--header "content-type: application/json" \
--url "http://localhost:8081/api/v1/curricula" \
--data '{
        "name": "curriculumName",
        "title": "title",
        "discipline": "discipline",
        "description": "description",
        "enabled": true,
        "metadata": {}
        }'
```

# CRUD on resources

The next section gives the user a complete guide about how to create, retrieve, update and delete resources.

---

## Response Status Codes

It's important that you know all the response status codes and their meaning:  


| **Response code** | **Description**                                                                                               |
| -------           | -------                                                                                                       |
| 200               | The request was successful and the response body contains the expected data.                                  |
| 400               | The submitted data failed validation.                                                                         |
| 401               | Authentication credentials are required to access the resource.                                               |
| 404               | The requested resource was not found.                                                                         |
| 409               | There was a conflict while processing your request. For example: The entity already exists in the database.   |
| 422               | The data that you provided is not valid. Unprocessable request.                                               |
| 500               | The server encountered an unexpected condition which prevented it from fulfilling the request.                |                                                                                       |

---

## REST Error Response

When the response status code is not 200, you will get a different response body:  

| **Attribute**     | **Description**                                                                                                       |
| -------           | -------                                                                                                               |
| code              | A Common Library-specific error code that can be used to obtain detailed information.                                 |
| message           | An understandable user friendly message explaining what happened with the request.                                    |
| statusCode        | The HTTP status code                                                                                                  |
| requestId         | Unique identifier that will be helpful for searching in the log files.                                                |

JSON Example:

```JSON
{ 
    statusCode: 404,
    body: { 
        code: 2003,
        message: "The item  does not exist in the folder tree of curriculum fcb71328-6ff3-42e4-b6a9-55666edds4a0." 
    } 
}
```  


## Available Resources

Before going trough all the Curriculum related resources, you should know that all entities have a universal unique identifier [uuid](https://en.wikipedia.org/wiki/Universally_unique_identifier)

---

## **1. Curriculum**

A Curriculum is a hierarchical structure that contains learning objects and folders. The main goal of curricula is to generate relations between learning objects and be able to treat them as files in a file system.

You can generate a curriculum for a course for example, by grouping units in folders, and at the same time, those folders can have topics with educational material (learning objects). A curriculum could be a career plan too, as you see the main idea is to associate and organize learning objects depending on the desired learning objectives. 


## Resource URL

```
http://localhost:8081/curricula/{id}
```

## Resource Attributes

- **name**: Curriculum's name.                                                  (String)
- **title**: Curriculum's title.                                                (String)
- **description**: Chunk of text describing the curriculum.                     (String)
- **discipline**: Discipline (Optional).                                        (String)
- **enabled**: If the curriculum is currently enabled                           (Boolean)
- **metadata**: Curriculum's metadata.                                          (Object with properties)
- **learningObjectives**: Curriculum's objectives.                              (List of LearningObjectives)


Resource JSON example

```json
{
    "name": "CurriculumName",
    "title": "CurriculumTitle",
    "discipline": "CurriculumDiscipline",
    "description": "CurriculumDescription",
    "enabled": true,
    "metadata": {
        "keywords": "anyKeyWord",
        "coverage": "anyCoverage",
        "context": "ANY",
        "difficulty": "ANY",
        "endUser": "ANY",
        "interactivityDegree": "ANY",
        "language": "ENGLISH",
        "status": "ANY",
        "author": "anyAuthor",
        "topic": "anyTopic",
        "isbn": "anyISBN",
        "price": 2000,
        "extraMetadata": ["extraMetadata1", "extraMetadata2"]
    },
    "learningObjectives": []
}
```

## Curriculum Operations

Next, you will see all the supported operations with working examples.

### Create a curriculum

- **HTTP_METHOD**: POST

- **URL**: /curricula

- **Request data:**

  - Curriculum JSON.

- **Example Query:**

```bash
curl -k --request POST \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula" \
--data '{
        "name": "c1",
        "title": "title",
        "discipline": "discipline",
        "description": "description",
        "enabled": true,
        "metadata": {
            "keywords": "anyKeyWordUpdated",
            "coverage": "anyCoverage",
            "context": "ANY",
            "difficulty": "ANY",
            "endUser": "ANY",
            "interactivityDegree": "ANY",
            "language": "ENGLISH",
            "status": "ANY",
            "author": "anyAuthor",
            "topic": "anyTopic",
            "isbn": "anyISBN",
            "price": 2000,
            "extraMetadata": ["extraMetadata1", "extraMetadata2"]
        },
        "learningObjectives": []
        }'
```

- **Example Response:**

```json
{
    "id": "47c98e93-1709-4455-8303-096098513c1d",
    "name": "c1",
    "title": "title",
    "discipline": "discipline",
    "description": "description",
    "enabled": true,
    "metadata": {
        "topic": "anyTopic",
        "author": "anyAuthor",
        "endUser": "ANY",
        "price": 2000,
        "keywords": "anyKeyWordUpdated",
        "status": "ANY",
        "coverage": "anyCoverage",
        "isbn": "anyISBN",
        "context": "ANY",
        "extraMetadata": ["extraMetadata1", "extraMetadata2"],
        "difficulty": "ANY",
        "language": "ENGLISH",
        "interactivityDegree": "ANY"
    },
    "learningObjectives": []
}
```

---

### Retrieve a curriculum by id

- **HTTP_METHOD**: GET

- **URL**: /curricula/{id}

- **Request data:** None.

- **Note:** If the resource does not exist, an empty json will be returned.

- **Example Query:**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/47c98e93-1709-4455-8303-096098513c1d"
```

- **Example Response:**

```json
{
    "id": "47c98e93-1709-4455-8303-096098513c1d",
    "name": "c1",
    "title": "title",
    "discipline": "discipline",
    "description": "description",
    "enabled": true,
    "metadata": {
        "topic": "anyTopic",
        "author": "anyAuthor",
        "endUser": "ANY",
        "price": 2000,
        "keywords": "anyKeyWordUpdated",
        "status": "ANY",
        "coverage": "anyCoverage",
        "isbn": "anyISBN",
        "context": "ANY",
        "extraMetadata": ["extraMetadata1", "extraMetadata2"],
        "difficulty": "ANY",
        "language": "ENGLISH",
        "interactivityDegree": "ANY"
    },
    "learningObjectives": []
}
```

---

### Retrieve the LearningObjectives associated with a curriculum

- **HTTP_METHOD**: GET

- **URL**: /curricula/{id}/linkedLearningObjectives

- **Request data:** None.

- **Note:** If the resource does not exist, an empty list will be returned.

- **Example Query:**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/47c98e93-1709-4455-8303-096098513c1d/linkedLearningObjectives"
```

- **Example Response:**

```json
[
    {
        "name": "loi1",
        "description": "desc",
        "url": "/learningObjectives/32454hjh5454"
    },
    {
        "name": "loi2",
        "description": "desc",
        "url": "/learningObjectives/32454hjh5454"
    },
    {
        "name": "loi3",
        "description": "desc",
        "url": "/learningObjectives/32454hjh5454"
    },
]
```

---

### Retrieve multiple curricula

- **HTTP_METHOD**: GET

- **URL**: /curricula

- **Query Params:**

  - **from:** Initial index for the results. (Positive integer, 0-index)
  - **size:** How many curricula you wanna get from the starting index. (Positive integer)
  - **all:** If this option is set to true, from and size attributes are ignored and the response will contain all curricula in the database. (true/false)

- **Example Query:**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula?from=0&size=2&all=false"
```

- **Example Response:**

```json
{
    "content": [{
        "id": "fcb71328-6ff3-42e4-b6a9-55666edd14a0",
        "name": "c1",
        "title": "title",
        "discipline": "CurriculumDisciplineUpdated2",
        "description": "CurriculumDescriptionUpdated2",
        "enabled": true,
        "metadata": {
            "keywords": "anyKeyWordUpdated",
            "coverage": "anyCoverage",
            "context": "ANY",
            "difficulty": "ANY",
            "endUser": "ANY",
            "interactivityDegree": "ANY",
            "language": "ENGLISH",
            "status": "ANY",
            "author": "anyAuthor",
            "topic": "anyTopic",
            "isbn": "anyISBN",
            "price": 2000,
            "extraMetadata": ["extraMetadata1", "extraMetadata2"]
        },
    }, {
        "id": "1fe8b1b7-4f7e-4928-a0b2-571ad88652b8",
        "name": "c1",
        "title": "title",
        "discipline": "CurriculumDisciplineUpdated2",
        "description": "CurriculumDescriptionUpdated2",
        "enabled": true,
        "metadata": {
            "topic": "anyTopic",
            "author": "anyAuthor",
            "endUser": "ANY",
            "price": 2000,
            "keywords": "anyKeyWordUpdated",
            "status": "ANY",
            "coverage": "anyCoverage",
            "isbn": "anyISBN",
            "context": "ANY",
            "extraMetadata": ["extraMetadata1", "extraMetadata2"],
            "difficulty": "ANY",
            "language": "ENGLISH",
            "interactivityDegree": "ANY"
        },
        "learningObjectives": []
    }],
    "firstPage": true,
    "lastPage": false,
    "totalPages": 3,
    "totalElements": 6,
    "numberOfElements": 2
}
```

---

### Retrieve all curricula related to a learning objective

- **HTTP_METHOD**: GET

- **URL**: /learningObjectives/curricula

- **Query Params:**

  - **from:** Initial index for the results. (Positive integer, 0-index)
  - **size:** How many curricula you wanna get from the starting index. (Positive integer)
  - **all:** If this option is set to true, from and size attributes are ignored and the response will contain all curricula in the database. (true/false)

- **Example Query:**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/learningObjectives/curricula?all=true&from=0&size=10&learningObjectiveName=LearningObjective1"
```

- **Example Response:**

```json
{
    "content": [{
        "id": "fcb71328-6ff3-42e4-b6a9-55666edd14a0",
        "name": "c1",
        "title": "title",
        "discipline": "CurriculumDisciplineUpdated2",
        "description": "CurriculumDescriptionUpdated2",
        "enabled": true,
        "metadata": {
            "keywords": "anyKeyWordUpdated",
            "coverage": "anyCoverage",
            "context": "ANY",
            "difficulty": "ANY",
            "endUser": "ANY",
            "interactivityDegree": "ANY",
            "language": "ENGLISH",
            "status": "ANY",
            "author": "anyAuthor",
            "topic": "anyTopic",
            "isbn": "anyISBN",
            "price": 2000,
            "extraMetadata": ["extraMetadata1", "extraMetadata2"]
        },
        "learningObjectives": []
    }],
    "firstPage": true,
    "lastPage": true,
    "totalPages": 1,
    "totalElements": 1,
    "numberOfElements": 1
}
```

---

### Update a curriculum

- **HTTP_METHOD**: PUT

- **URL**: /curricula/{id}

- **Request data:**

  - Curriculum JSON.

- **Example Query:**

```bash
curl -k --request PUT \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fec66594-4469-4674-82e7-2f37a3e3fd2c" \
--data '{
        "name": "updatedName",
        "title": "updatedTitle",
        "discipline": "updatedDiscipline",
        "description": "updatedDescription",
        "enabled": true,
        "metadata": {
            "keywords": "anyKeyWordUpdated",
            "coverage": "anyCoverage",
            "context": "ANY",
            "difficulty": "ANY",
            "endUser": "ANY",
            "interactivityDegree": "ANY",
            "language": "ENGLISH",
            "status": "ANY",
            "author": "anyAuthor",
            "topic": "anyTopic",
            "isbn": "anyISBN",
            "price": 2000,
            "extraMetadata": ["extraMetadata1", "extraMetadata2"]
        },
        "learningObjectives": [
            {
                "name": "loi1",
                "description": "desc"
            }
        ]
        }'
```


- **Example Response:**

```json
{
    "updatedRecords":"1"
}
```

---

### Delete a curriculum

This operation will remove the curriculum and all its folders and learning objects. (Similar to a cascade delete).

- **HTTP_METHOD**: DELETE

- **URL**: /curricula/{id}

- **Request data:** None.

- **Example Query:**

```bash
curl -k --request DELETE \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fec66594-4469-4674-82e7-2f37a3e3fd2c"
```

- **Example Response:**

```json
{
    "deletedRecords":"2"
}
```

---


## **1. Item**

Like we said before, a curriculum is similar to a file system, which stores items (folders and files), in this case the files are learning objects.

Every operation on the curriculum's items is made using a path notation instead of ids. The same routes work for both folder and learning objects.


## Resource URL

```
http://localhost:8081/curricula/{id}/folders/path/{path/to/desired/item}
```

Note: When the {path/to/desired/item} is not present, the root folder will be returned.

## Resource Attributes

-  LearningObject

      - **name**: LearningObject's name.                                              (String) Must be a valid filename.
      - **title**: LearningObject's title.                                            (String)
      - **learningObjectId**: LearningObject's id in cl-lo                            (String)
      - **deleted**: If this flag is true, the lo was deleted in cl-lo                (Boolean)
      - **updated**: If this flag is true, the lo was updated in cl-lo                (Boolean)
      - **url**: CL-LO MicroService reference.                                        (String)
      - **contentUrl**: CL-LO MicroService reference to the file.                     (String)
      - **learningObjectives**: List of learning Objectives.                          (Array of Objects)


      - Resource JSON example
      
        ```json
        {
            "name": "LOName",
            "title": "LearningObjectTitle",
            "learningObjectId": "57e19c35185e1e8c93db6f61",
            "updated": false,
            "deleted": false,
            "url": "/learningObjects/57e19c35185e1e8c93db6f61",
            "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
            "learningObjectives": [
                {
                    "name": "LearningObjective1",
                    "description": "desc",
                    "url": "/learningObjectives/id1"
                },
                {
                    "name": "LearningObjective2",
                    "description": "desc",
                    "url": "/learningObjectives/id2"
                }
            ]
        }
        ```

-  Folder

      - **name**: Folder's name.                                              (String)


      - Resource JSON example
      
        ```json
        {
            "name": "Unit1",
        }
        ```

## Item Operations

### Create an item

This operation will create the item in the specified path (if there is no path, the item will be created in the root folder). If the given path is valid but does not exist, the application will create all the folder structure and then the item. Similar to the `mkdir -p ` command.

Like every file system, you can't have more than one item with the same name in the same tree level.

- **HTTP_METHOD**: POST

- **URL**: /curricula/{id}/folders/path/{pathWhereTheItemWillBePlaced}

- **Request data:**

  - Item JSON.

- **Example Query (create folder in the root):**

```bash
curl -k --request POST \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path" \
--data '{
        "name": "newFolder"
        }'
```

- **Example Response:**

```json
{
    "id": "80bf13e7-0723-42fa-aac8-ed66e1f7132a",
    "name": "newFolder"
}
```

- **Example Query (create learning object in subfolder200/materials):**

```bash
curl -k --request POST \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path/subfolder200/materials" \
--data '{
        "name": "LOName",
        "title": "LearningObjectTitle",
        "learningObjectId":, "57e19c35185e1e8c93db6f61",
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "learningObjectives": [
            {
                "name": "LearningObjective1",
                "description": "desc",
                "url": "/learningObjectives/id1"
            },
            {
                "name": "LearningObjective2",
                "description": "desc",
                "url": "/learningObjectives/id2"
            }
        ]
        }'
```

- **Example Response:**

```json
{
    "id": "3c3fb308-00e5-4d28-8e54-536b59dd66f2",
    "name": "LOName",
    "title": "LearningObjectTitle",
    "learningObjectId":, "57e19c35185e1e8c93db6f61",
    "deleted": false,
    "updated": false,
    "url": "/learningObjects/57e19c35185e1e8c93db6f61",
    "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
    "learningObjectives": [{
       "name": "LearningObjective1",
       "description": "desc",
       "url": "/learningObjectives/id1"
   },
   {
       "name": "LearningObjective2",
       "description": "desc",
       "url": "/learningObjectives/id2"
   }]
}
```

---

### Retrieve learning object by path

- **HTTP_METHOD**: GET

- **URL**: /curricula/{id}/folders/path/{learningObjectPath}

- **Request data:** None.

- **Note:** If the resource does not exist, an empty json will be returned.

- **Example Query (Getting the learning object subfolder200/materials/loName):**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path/subfolder200/materials/LOName"
```

- **Example Response:**

```json
{
    "id": "3c3fb308-00e5-4d28-8e54-536b59dd66f2",
    "name": "LOName",
    "title": "LearningObjectTitle",
    "updated": false,
    "deleted": false,
    "learningObjectId": "57e19c35185e1e8c93db6f61",
    "url": "/learningObjects/57e19c35185e1e8c93db6f61",
    "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
    "learningObjectives": [{
        "name": "LearningObjective1",
        "description": "desc",
        "url": "/learningObjectives/id1"
    }, {
        "name": "LearningObjective2",
        "description": "desc",
        "url": "/learningObjectives/id2"
    }]
}
```

#### Expand parameters

If you want to retrieve more information about the learning object in the same request, you can add the expand query parameter with a comma separated list of additional properties to retrieve. The supported properties are metadata and contents.

- **Example Query (Getting the learning object subfolder200/materials/loName and its metadata-contents):**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path/subfolder200/materials/LOName?expand=contents,metadata"
```

- **Example Response:**

```json
{
    "id": "3c3fb308-00e5-4d28-8e54-536b59dd66f2",
    "name": "LOName",
    "title": "LearningObjectTitle",
    "learningObjectId": "57e19c35185e1e8c93db6f61",
    "updated": false,
    "deleted": false,
    "url": "/learningObjects/57e19c35185e1e8c93db6f61",
    "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
    "learningObjectives": [{
        "name": "LearningObjective1",
        "description": "desc",
        "url": "/learningObjectives/id1"
    }, {
        "name": "LearningObjective2",
        "description": "desc",
        "url": "/learningObjectives/id2"
    }],
    "metadata": {
        "keywords": null,
        "coverage": null,
        "context": "ANY",
        "difficulty": "ANY",
        "endUser": "ANY",
        "interactivityDegree": "ANY",
        "language": "English",
        "status": "ANY",
        "author": null,
        "topic": null,
        "isbn": null,
        "price": 0,
        "extraMetadata": []
    },
    "contents": {
        "mimeType": "text/html",
        "md5": null,
        "base64": "PGh0bWw+CiAgPGhlYWQ+CiAgICA8dGl0bGU+VGV4dHMgYW5kIE1hdGVyaWFsczwvdGl0bGU+CiAgPC9oZWFkPgogIDxib2R5PgogICAgPGRpdiBjbGFzcz0nVGV4dHNIZWFkZXInPlRleHRzIGFuZCBNYXRlcmlhbHM8L2Rpdj4KICAgIDxkaXYgY2xhc3M9J1RleHRzQm9keSc+CiAgICAgIDxkaXYgY2xhc3M9J1RleHQnPgogICAgICAgIDxzcGFuIGNsYXNzPSdUZXh0VGl0bGUnPlRpdGxlOgogICAgICAgICAgPHN0cm9uZz5BbGdlYnJhOiBJbnRyb2R1Y3RvcnkgJmFtcDsgSW50ZXJtZWRpYXRlOiBBcHBsaWVkIEFwcHJvYWNoPC9zdHJvbmc+CiAgICAgICAgPC9zcGFuPgogICAgICAgIDxzcGFuIGNsYXNzPSdUZXh0SVNCTic+SVNCTjoKICAgICAgICAgIDxzdHJvbmc+OTc4MTQzOTA0Njk1MTwvc3Ryb25nPgogICAgICAgIDwvc3Bhbj4KICAgICAgICA8c3BhbiBjbGFzcz0nVGV4dEF1dGhvcic+QXV0aG9yOgogICAgICAgICAgPHN0cm9uZz5BdWZtYW5uICZhbXA7IExvY2t3b29kPC9zdHJvbmc+CiAgICAgICAgPC9zcGFuPgogICAgICAgIDxzcGFuIGNsYXNzPSdUZXh0UHVibGlzaGVyJz5QdWJsaXNoZXI6CiAgICAgICAgICA8c3Ryb25nPkJyb29rcy1Db2xlL0NlbmdhZ2UgTGVhcm48L3N0cm9uZz4KICAgICAgICA8L3NwYW4+CiAgICAgICAgPHNwYW4gY2xhc3M9J1RleHRFZGl0aW9uJz5FZGl0aW9uOgogICAgICAgICAgPHN0cm9uZz4yMDExOyA1dGggRWQuPC9zdHJvbmc+CiAgICAgICAgPC9zcGFuPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIDwvYm9keT4KPC9odG1sPg=="
    }
}
```

---

### Retrieve folder by path

- **HTTP_METHOD**: GET

- **URL**: /curricula/{id}/folders/path/{folderPath}

- **Request data:** None.

- **Note:** If the resource does not exist, an empty json will be returned.

- **Example Query (Getting the folder root of the curriculum):**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path"
```

- **Example Response:**

```json
{
    "id": "b95e33bb-5916-464c-a4d3-2f8a4db78ae0",
    "name": "root"
}
```

#### Expand parameters

If you want to retrieve more information about the folder in the same request, you can add the expand query parameter with a comma separated list of additional properties to retrieve. The supported properties are learningObjects and folders, those properties will search in the direct children.

- **Example Query (Getting the curriculum root folder and all the subfolders and learningObjects):**

```bash
curl -k --request GET \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path?expand=learningObjects,folders"
```

- **Example Response:**

```json
{
    "id": "b95e33bb-5916-464c-a4d3-2f8a4db78ae0",
    "name": "root",
    "folders": [{
        "id": "e5d60c42-e990-4b4a-826e-90b76af51de4",
        "name": "CAMBIO2"
    }, {
        "id": "f8b0a645-cb8b-4cc8-a462-3ea82bc68ae8",
        "name": "1"
    }, {
        "id": "80bf13e7-0723-42fa-aac8-ed66e1f7132a",
        "name": "newFolder"
    }, {
        "id": "60b716aa-fc47-4aa4-9f80-60e72e7e20bd",
        "name": "subfolder200"
    }],
    "learningObjects": [{
        "id": "673dce16-0bf2-4b24-943e-57771dfc2d8c",
        "name": "lo1",
        "title": "LearningObjectTitle",
        "learningObjectId": "57e19c35185e1e8c93db6f61",
        "updated": false,
        "deleted": false,
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "learningObjectives": [{
            "name": "LearningObjective1",
            "description": "desc",
            "url": "/learningObjectives/id1"
        }, {
            "name": "LearningObjective2",
            "description": "desc",
            "url": "/learningObjectives/id2"
        }]
    }, {
        "id": "09f54e4a-716c-4786-b298-535df1fa7051",
        "name": "lo2",
        "title": "LearningObjectTitle",
        "learningObjectId": "57e19c35185e1e8c93db6f61",
        "updated": false,
        "deleted": false,
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "learningObjectives": [{
            "name": "LearningObjective1",
            "description": "desc",
            "url": "/learningObjectives/id1"
        }, {
            "name": "LearningObjective2",
            "description": "desc",
            "url": "/learningObjectives/id2"
        }]
    }, {
        "id": "a561e9bb-b159-46ed-b202-ba3ec9829ab3",
        "name": "lo3",
        "title": "LearningObjectTitle",
        "learningObjectId": "57e19c35185e1e8c93db6f61",
        "updated": false,
        "deleted": false,
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "learningObjectives": [{
            "name": "LearningObjective1",
            "description": "desc",
            "url": "/learningObjectives/id1"
        }, {
            "name": "LearningObjective2",
            "description": "desc",
            "url": "/learningObjectives/id2"
        }]
    }]
}
```


---

### Update an item

- **HTTP_METHOD**: PUT

- **URL**: /curricula/{id}/folders/path/{itemPath}

- **Request data:**

  - Item JSON.

- **Example Query (Update folder /newFolder):**

```bash
curl -k --request PUT \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path/newFolder" \
--data '{
        "name": "updatedName"
        }'
```


- **Example Response:**

```json
{
    "updatedRecords":"1"
}
```

- **Example Query (Update learning object /subfolder200/materials/LOName):**

```bash
curl -k --request PUT \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path/subfolder200/materials/LOName" \
--data '{
        "name": "UpdatedLO",
        "title": "UpdatedLearningObjectTitle",
        "url": "/learningObjects/57e19c35185e1e8c93db6f61",
        "contentUrl": "/learningObjects/57e19c35185e1e8c93db6f61/contents/57e19c35185e1e8c93db6f62/file/textandmaterials.html?refPath=57e19c35185e1e8c93db6f61/",
        "learningObjectives": []
       }'
```


- **Example Response:**

```json
{
    "updatedRecords": "1"
}
```

---

### Delete an item

This operation will remove the item and all its children (in case the item is a folder).

- **HTTP_METHOD**: DELETE

- **URL**: /curricula/{id}/folders/path/{itemPath}

- **Request data:** None.

- **Example Query:**

```bash
curl -k --request DELETE \
--header "Authorization: SAuthc1 sauthc1Id=5c4d6a3bdc68ffb02e3ce309964ac558/20160905/8hcW7pqAMx/sauthc1_request, sauthc1SignedHeaders=host;x-stormpath-date, sauthc1Signature=1e84666356c28a6b029f899ef3969876292672f44abeee6f068d978420497b1e" \
--header "content-type: application/json" \
--header "X-Stormpath-Date: 20160905T153936Z" \
--url "http://localhost:8081/api/v1/curricula/fcb71328-6ff3-42e4-b6a9-55666edd14a0/folders/path/subfolder200/materials/LOName"
```

- **Example Response:**

```json
{
    "deletedRecords": "1"
}
```
