
var book = _require('services/book');
var post = _require('services/post');
var uri = _require('frame/uri');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    route: '/writer/book/:bid',
    get: eval(windAsync(fGetBookItems))
};

function fGetBookItems(req, res, next) {
    var that = this;
    var sBid = util.id(that.params.bid);
    var oBook = $await(book.findById(sBid));

    if (!that.hasPermission(oBook)) {
        return that.render500('不存在的书籍');
    }

    if (book.isCollect(oBook)) {
        var oFilter = book.filter();
        oFilter.order('sort asc, createdAt desc');
        oFilter.cond('parentId', sBid);
        var aItems = $await(book.find(oFilter));
        that.render('site/writer/collect', {
            collect: oBook,
            items: aItems
        });
    } else {
        var oCollect = $await(book.findById(oBook.parentId));

        var oFilter = post.filter();
        oFilter.order('sort asc, createdAt desc');
        oFilter.cond('parentId', sBid);
        aItems = $await(post.find(oFilter));

        that.render('site/writer/book', {
            collect: oCollect,
            book: oBook,
            items: aItems
        });
    }
}