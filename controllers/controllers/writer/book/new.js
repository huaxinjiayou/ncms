
var book = _require('services/book');
var uri = _require('frame/uri');
var util = _require('util/util');

module.exports = {
    filter: ['login'],
    get: eval(windAsync(fGetBookNew)),
    post: eval(windAsync(fPostBookNew))
};

function fGetBookNew(req, res, next) {
    var that = this;
    that.setUpToken();

    var sBookId = util.id(that.query.bid);
    var sBookType = that.query.type;
    var oCollect = $await(book.findById(sBookId));

    if (oCollect && !that.hasPermission(oCollect)) {
        oCollect = null;
    }

    var bIsCollect = sBookType == 'collect';
    var sTypeName = bIsCollect ? '合集' : '书籍';
    that.render('site/writer/bookform', {
        collect: oCollect,
        book: {},
        cover: null,
        isEdit: false,
        isCollect: bIsCollect,
        typeName: sTypeName
    });
}

function fPostBookNew(req, res, next) {
    var that = this;
    var oUser = that.user;

    var sBookId = util.id(that.query.bid);
    var sTitle = that.body.title;
    var sAuthor = that.body.author;
    var sSource = that.body.source;
    var sUrl = that.body.url;
    var sCover = that.body.cover;
    var sDescription = that.body.description;
    var bIsOriginal = !!that.body.isOriginal;
    var bIsPublish = !!that.body.isPublish;
    var bIsEnd = !that.body.isCollect;
    var bRetain = !!that.body.retain;

    var oBook = $await(book.create(oUser, {
        parentId: sBookId,
        title: sTitle,
        author: sAuthor,
        source: sSource,
        url: sUrl,
        cover: sCover,
        description: sDescription,
        isOriginal: bIsOriginal,
        isPublish: bIsPublish,
        isEnd: bIsEnd
    }));
    that.alert('操作成功');

    var oCollect = $await(book.findById(sBookId));
    if (bRetain) {
        that.redirect();
    } else {
        that.redirect(uri.writerBook('index', oCollect));
    }
}