/**
 * Created by diugalde on 10/10/16.
 */

/**
 * Creates a new date object from a timestamp string (it must have this format: yyyyMMddTHHmmssZ
 * The date will be in UTC.
 *
 * @param timestamp - string.
 * @return date
 */
function parseDateFormat(timestamp) {
    if (timestamp.length !== 16) {
        return ''
    }
    let year = timestamp.substr(0, 4);
    let month = parseInt(timestamp.substr(4, 2))-1;
    let day = timestamp.substr(6, 2);
    let hours = timestamp.substr(9, 2);
    let minutes = timestamp.substr(11, 2);
    let seconds = timestamp.substr(13, 2);

    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

module.exports = {
    parseDateFormat
};
