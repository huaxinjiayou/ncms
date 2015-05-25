
var book = _require('services/book');
var file = _require('services/file');
var book = _require('services/book');
var post = _require('services/post');
var count = _require('services/count');
var action = _require('services/action');
var user = _require('services/user');
var tag = _require('services/tag');
var relationtag = _require('services/relationtag');
var util = _require('util/util');

module.exports = {
    route: '/book/:bid/:pinyin.html',
    filter: ['joke'],
    get: eval(windAsync(fGetBook))
};

function fGetBook(req, res, next) {
    var that = this;
    var sUid = util.id(that.user);
    var sBid = util.id(that.params.bid);
    var nCurPage = util.id(that.query.page);
    var oBook = $await(book.findById(sBid));
    var bIsAuthor = oBook && sUid === util.id(oBook.userId);
    var bIsPublish = oBook && (oBook.isPublish || bIsAuthor);

    // 如果书籍不公开，则只有书籍的作者可见
    if (!oBook || !bIsPublish) {
        return that.render500('不存在的书籍');
    }

    // 相关数据
    var oResult = $await(Task.whenAll({
        cover: file.findCover(oBook),
        viewCount: count.log(book.type, sBid, count.actionType.view),
        likeCount: count.val(book.type, sBid, count.actionType.like),
        collectCount: count.val(book.type, sBid, count.actionType.collect),
        isLike: action.isAction(sUid, book.type, sBid, action.actionType.like),
        isCollect: action.isAction(sUid, book.type, sBid, action.actionType.collect),
        liketor: action.user(book.type, sBid, action.actionType.like, 6, 'updatedAt desc', true)
    }));

    // 作者
    var oAuthor = bIsAuthor ? that.user : null;
    if (!bIsAuthor) {
        oAuthor = $await(user.findById(oBook.userId));
    }

    // 是否推荐
    var bIsRecommend = false;
    if (that.isAdmin) {
        var oTag = $await(tag.recommend());
        bIsRecommend = $await(relationtag.hasTag(book.type, sBid, oTag));
    }

    // 查找子元素
    var bCollect = book.isCollect(oBook);
    var obj = bCollect ? book : post;
    var oFilter = obj.filter();
    oFilter.cond('parentId', sBid);
    if (!bIsAuthor) {
        oFilter.cond('isPublish', true);
    }
    oFilter.page(nCurPage);
    oFilter.order('sort asc, createdAt desc');
    var oData = $await(obj.page(oFilter));

    // 合集
    var oCollect = null;
    if (!bCollect && oBook.parentId) {
        oCollect = $await(book.findById(oBook.parentId));
    }

    that.render(bCollect ? 'site/index/collect' : 'site/index/book', {
        collect: bCollect ? oBook : oCollect,
        book: bCollect ? null : oBook,
        data: oData,
        cover: oResult.cover,
        author: oAuthor,
        isAuthor: bIsAuthor,
        viewCount: oResult.viewCount ? oResult.viewCount.val : 0,
        likeCount: oResult.likeCount,
        collectCount: oResult.collectCount,
        isLike: oResult.isLike,
        isCollect: oResult.isCollect,
        isRecommend: bIsRecommend,
        isPublish: bIsPublish,
        liketor: oResult.liketor
    });

}