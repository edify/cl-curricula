/**
 * Created by diugalde on 10/10/16.
 */

const _ = require('lodash');

/**
 * This object is in charge of transform raw database objects to API objects that will be returned to the user.
 */
var objectReducer = {

    /**
     * Removes properties starting with @, in_ or out_ recursively
     *
     * @param obj - object
     */
    reduce(obj) {
        if (_.isArray(obj)) {
            _.forEach(obj, function(item) {
                objectReducer.reduce(item)
            })
        } else {
            _.forIn(obj, function(val, key) {
                if (_.startsWith(key, '@') || _.startsWith(key, 'in_') || _.startsWith(key, 'out_')) {
                    delete obj[key]
                } else if (_.isObject(obj[key]) || _.isArray(obj[key])) {
                    objectReducer.reduce(obj[key])
                }
            });
        }
    }

};

module.exports = Object.create(objectReducer);
