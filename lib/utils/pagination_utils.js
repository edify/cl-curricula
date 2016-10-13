/**
 * Created by diugalde on 12/10/16.
 */

var paginationUtils = {

    /**
     * Creates a response page for curricula. It calculates values like firstPage and lastPage.
     *
     * @param from - number
     * @param size - number
     * @param all  - boolean
     * @param quantity - number (Indicates how many curricula are in the database).
     * @param content - Array<curriculum> (Array with the curricula results).
     * @returns object with the following properties [content, firstPage, lastPage, totalPages, numberOfElements]
     * @private
     */
    createPage(all, from, size, quantity, content) {
        let page = {
            content: content,
            firstPage: true,
            lastPage: true,
            totalPages: 1,
            totalElements: quantity,
            numberOfElements: quantity
        };
        if (!all) {
            if (from > quantity-1) {
                return {}
            } else {
                page.firstPage = from === 0;
                page.lastPage = (from + size) >= quantity;
                page.totalPages = Math.ceil(quantity/size);
                page.numberOfElements = (from + size  > quantity) ? quantity - (from + size) : size
            }
        }
        return page
    }

};


module.exports = Object.create(paginationUtils);
