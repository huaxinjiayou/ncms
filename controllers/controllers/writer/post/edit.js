
var post = _require('services/post');
var book = _require('services/book');
var content = _require('services/content');
var util = _require('util/util');
var uri = _require('frame/uri');

module.exports = {
    route: '/writer/post/:pid/edit',
    filter: ['login'],
    get: eval(windAsync(fGetPostEdit)),
    post: eval(windAsync(fPostPostEdit))
};

function fGetPostEdit(req, res, next) {
    var that = this;
    that.setUpToken();

    var sPid = util.id(that.params.pid);
    var oPost = $await(post.findById(sPid));
    if (!that.hasPermission(oPost)) {
        that.render500('不存在的文章');
        return;
    }

    var oBook = $await(book.findById(oPost.parentId));
    var oCollect = $await(book.findById(oBook.parentId));
    var oContent = $await(content.findById(oPost.contentId));

    that.render('site/writer/postform', {
        collect: oCollect,
        content: oContent,
        book: oBook,
        post: oPost,
        isEdit: true
    });
}

function fPostPostEdit(req, res, next) {
    var that = this;
    var sPid = util.id(that.params.pid);
    var oPost = $await(post.findById(sPid));

    if (!that.hasPermission(oPost)) {
        that.render500('不存在的文章');
        return;
    }

    var sTitle = that.body.title;
    var sAuthor = that.body.author;
    var sSource = that.body.source;
    var sUrl = that.body.url;
    var sContent = that.body.content;
    var bIsOriginal = !!that.body.isOriginal;
    var bIsPublish = !!that.body.isPublish;

    var oData = {
        title: sTitle,
        author: sAuthor,
        source: sSource,
        url: sUrl,
        content: sContent,
        isOriginal: bIsOriginal,
        isPublish: bIsPublish,
        content: sContent
    };
    $await(post.updateById(that.user, sPid, oData));

    that.alert('操作成功');
    that.redirect(uri.writerBook('index', {id: oPost.parentId}));
}