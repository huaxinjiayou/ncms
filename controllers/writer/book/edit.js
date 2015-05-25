
var book = _require('services/book');
var file = _require('services/file');
var uri = _require('frame/uri');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    route: '/writer/book/:bid/edit',
    get: eval(windAsync(fGetBookEdit)),
    post: eval(windAsync(fPostBookEdit))
};

function fGetBookEdit(req, res, next) {
    var that = this;
    that.setUpToken();

    var sBid = util.id(that.params.bid);
    var oBook = $await(book.findById(sBid));

    if (!that.hasPermission(oBook)) {
        return that.render500('不存在的书籍');
    }

    var oParent = $await(book.findById(oBook.parentId));
    var bIsCollect = book.isCollect(oBook);
    var sTypeName = bIsCollect ? '合集' : '书籍';
    var oCover = $await(file.findCover(oBook));
    that.render('site/writer/bookform', {
        collect: oParent,
        book: oBook,
        cover: oCover,
        isEdit: true,
        isCollect: bIsCollect,
        typeName: sTypeName
    });
}

function fPostBookEdit(req, res, next) {
    var that = this;
    var sBid = util.id(that.params.bid);
    var oBook = $await(book.findById(sBid));

    if (!that.hasPermission(oBook)) {
        return that.render500('不存在的书籍');
    }

    var sTitle = that.body.title;
    var sAuthor = that.body.author;
    var sSource = that.body.source;
    var sUrl = that.body.url;
    var sCover = that.body.cover;
    var sDescription = that.body.description;
    var bIsOriginal = !!that.body.isOriginal;
    var bIsPublish = !!that.body.isPublish;
    var bRetain = !!that.body.retain;

    $await(book.updateById(that.user, sBid, {
        title: sTitle,
        author: sAuthor,
        source: sSource,
        url: sUrl,
        cover: sCover,
        description: sDescription,
        isOriginal: bIsOriginal,
        isPublish: bIsPublish
    }));

    that.alert('操作成功');
    that.redirect(uri.writerBook('index', oBook));
}