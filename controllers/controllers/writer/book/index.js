
var book = _require('services/book');

module.exports = {
    filter: ['login'],
    get: eval(windAsync(fGetBookIndex))
};

function fGetBookIndex(req, res, next) {
    var that = this;
    var oUser = that.user;

    var oFilter = book.filter();
    oFilter.order('sort asc, createdAt desc');
    oFilter.cond('userId', oUser.id);
    
    var aBooks = $await(book.find(oFilter));
    var oData = book.sort(aBooks);
    that.render('site/writer/books', {
        books: oData.books,
        collects: oData.collects
    });
}