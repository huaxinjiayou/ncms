
var book = _require('services/book');
var post = _require('services/post');
var uri = _require('frame/uri');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    get: eval(windAsync(fGetPostNew)),
    post: eval(windAsync(fPostPostNew))
};

function fGetPostNew(req, res, next) {
    var that = this;
    that.setUpToken();

    var sBid = util.id(that.query.bid);
    var oBook = $await(book.findById(sBid));

    if (!that.hasPermission(oBook)) {
        oBook = null;
    }

    var oCollect = null;
    if (oBook && oBook.parentId) {
        oCollect = $await(book.findById(oBook.parentId));
    }

    that.render('site/writer/postform', {
        collect: oCollect,
        book: oBook,
        post: {},
        content: {},
        isEdit: false
    });
}

function fPostPostNew(req, res, next) {
    var that = this;

    // 查找书籍，没有就新建一个临时的
    var sBid = util.id(that.query.bid);
    var oBook = $await(book.findById(sBid));
    if (!oBook) {
        oBook = $await(book.findSysTmp(that.user));
    }

    var sTitle = that.body.title;
    var sAuthor = that.body.author;
    var sSource = that.body.source;
    var sUrl = that.body.url;
    var sContent = that.body.content;
    var bIsOriginal = !!that.body.isOriginal;
    var bIsPublish = !!that.body.isPublish;
    var bRetain = !!that.body.retain;

    $await(post.create(that.user, {
        parentId: oBook.id,
        title: sTitle,
        author: sAuthor,
        source: sSource,
        url: sUrl,
        content: sContent,
        isOriginal: bIsOriginal,
        isPublish: bIsPublish
    }));

    that.alert('操作成功');

    if (bRetain) {
        that.redirect();
    } else {
        that.redirect(uri.writerBook('index', oBook));
    }
}