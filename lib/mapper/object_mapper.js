/**
 * Created by diugalde on 10/10/16.
 */

const _ = require('lodash');

/**
 * This object is in charge of transform raw database objects to API objects that will be returned to the user.
 */
var objectMapper = {
    /**
     * Method for filtering a curriculum retrieved from database. It removes fields like @rid, @class and @type.
     *
     * @param dbCurriculum - object
     * @returns object with the following fields: [id, name, title, discipline, description, enabled, metadata]
     */
    mapCurriculum(dbCurriculum) {
        let filteredCurriculum = {
            id: dbCurriculum.id,
            name: dbCurriculum.name,
            title: dbCurriculum.title,
            discipline: dbCurriculum.discipline,
            description: dbCurriculum.description,
            enabled: dbCurriculum.enabled,
            metadata: dbCurriculum.metadata
        };

        filteredCurriculum.metadata = dbCurriculum.metadata;
        delete filteredCurriculum.metadata['@class'];
        delete filteredCurriculum.metadata['@type'];

        return filteredCurriculum
    },


    /**
     * Method for filtering a folder retrieved from database. It removes fields like @rid, @class and @type.
     *
     * @param dbFolder - object
     * @returns object with the following fields: [id, name, folders, learningObjects]
     */
    mapFolder(dbFolder) {
        let filteredFolder = {
            id: dbFolder.id,
            name: dbFolder.name
        };
        if (dbFolder.folders) {
            filteredFolder.folders = _.map(dbFolder.folders, this.folder);
        }
        if (dbFolder.learningObjects) {
            filteredFolder.learningObjects = _.map(dbFolder.learningObjects, this.mapLearningObject);
        }
        return filteredFolder
    },

    /**
     * Method for filtering a learning object retrieved from database. It removes fields like @rid, @class and @type.
     *
     * @param dbLearningObject - object
     * @returns object with the following fields: [id, name, title, url, contentUrl, learningObjectives, metadata, contents]
     */
    mapLearningObject(dbLearningObject) {
        let filteredLO = {
            id: dbLearningObject.id,
            name: dbLearningObject.name,
            title: dbLearningObject.title,
            url: dbLearningObject.url,
            contentUrl: dbLearningObject.contentUrl,
            learningObjectives: _.map(dbLearningObject.learningObjectives, this.mapLearningObjective)
        };

        if (dbLearningObject.metadata) {
            filteredLO.metadata = dbLearningObject.metadata;
        }

        if (dbLearningObject.contents) {
            filteredLO.contents = dbLearningObject.contents;
        }

        return filteredLO
    },

    /**
     * Method for filtering a learning objective retrieved from database. It removes fields like @rid, @class and @type.
     *
     * @param dbLearningObjective - object
     * @returns object with the following fields: [name, url]
     */
    mapLearningObjective(dbLearningObjective) {
        return {
            name: dbLearningObjective.name,
            url: dbLearningObjective.url
        }
    }
};

module.exports = Object.create(objectMapper);
