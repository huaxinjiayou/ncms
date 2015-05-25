
var book = _require('services/book');
var file = _require('services/file');
var tag = _require('services/tag');
var relationtag = _require('services/relationtag');

module.exports = {
    route: '/books.html',
    filter: ['joke'],
    get: eval(windAsync(fGetBooks))
};

var fNewBooks = eval(windAsync(fGetNewBooks));

function fGetBooks(req, res, next) {
    var that = this;

    // 最新的文章
    if (that.query.tag === 'new') {
        return $await(fNewBooks.apply(that, arguments));
    }

    var oUser = that.user;
    var nCurPage = that.query.page;
    var oRecommend = $await(tag.recommend());
    var oData = $await(relationtag.pageObj(oRecommend, {
        objType: book.type,
        '#{isEnd}': true,
        '#{parentId}': null
    }, 'updatedAt desc', nCurPage));

    var aCovers = $await(file.findCover(oData.data));
    that.render('site/index/books.html', {
        items: oData.data,
        covers: aCovers,
        data: oData,
        type: 'book',
        listType: 'recommend'
    });
}

function fGetNewBooks(req, res, next) {
    var that = this;
    var nCurPage = that.query.page;

    var oFilter = book.filter();
    oFilter.order('createdAt desc');
    oFilter.cond('isEnd', true);
    oFilter.cond('parentId', null);
    oFilter.cond('isPublish', true);
    oFilter.page(nCurPage);
    var oData = $await(book.page(oFilter));

    var aCovers = $await(file.findCover(oData.data));
    that.render('site/index/books.html', {
        items: oData.data,
        covers: aCovers,
        data: oData,
        type: 'book',
        listType: 'new'
    });
}