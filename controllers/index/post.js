
var file = _require('services/file');
var book = _require('services/book');
var post = _require('services/post');
var content = _require('services/content');
var count = _require('services/count');
var action = _require('services/action');
var user = _require('services/user');
var tag = _require('services/tag');
var relationtag = _require('services/relationtag');
var util = _require('util/util');

module.exports = {
    route: '/post/:pid/:pinyin.html',
    filter: ['joke'],
    get: eval(windAsync(fGetPost))
};

function fGetPost(req, res, next) {
    var that = this;
    var sUid = util.id(that.user);
    var sPid = util.id(that.params.pid);
    var nCurPage = util.id(that.query.page);
    var oPost = $await(post.findById(sPid));
    var oBook = $await(book.findById(oPost.parentId));
    var bIsAuthor = oPost && sUid === util.id(oPost.userId);

    // 合集可见、书籍可见以及文章可见才能
    var bIsPublish = bIsAuthor || oPost && oPost.isPublish && oBook.isPublish;
    if (!bIsAuthor && bIsPublish) {
        var oCollect = $await(book.findById(oBook.parentId));
        bIsPublish = !oCollect || oCollect.isPublish;
    }

    // 如果书籍不公开，则只有书籍的作者可见
    if (!oPost || !bIsPublish) {
        return that.render500('不存在的文章');
    }

    // 相关数据
    var oResult = $await(Task.whenAll({
        content: content.findById(oPost.contentId),
        viewCount: count.log(post.type, sPid, count.actionType.view),
        likeCount: count.val(post.type, sPid, count.actionType.like),
        collectCount: count.val(post.type, sPid, count.actionType.collect),
        isLike: action.isAction(sUid, post.type, sPid, action.actionType.like),
        isCollect: action.isAction(sUid, post.type, sPid, action.actionType.collect),
        liketor: action.user(post.type, sPid, action.actionType.like, 6, 'updatedAt desc', true)
    }));

    // 作者
    var oAuthor = bIsAuthor ? that.user : null;
    if (!bIsAuthor) {
        oAuthor = $await(user.findById(oPost.userId));
    }

    // 是否推荐
    var bIsRecommend = false;
    if (that.isAdmin) {
        var oTag = $await(tag.recommend());
        bIsRecommend = $await(relationtag.hasTag(post.type, sPid, oTag));
    }

    // 目录以及上下篇
    var oFilter = post.filter();
    oFilter.cond('parentId', oPost.parentId);
    oFilter.attr('id, pinyin, title, words');
    oFilter.order('sort ASC, createdAt DESC, id DESC');
    var aPosts = $await(post.find(oFilter));
    var oPre, oNext;
    aPosts.every(function (oItem, nIndex) {
        if (oItem.id === oPost.id) {
            oNext = aPosts[nIndex + 1] || null;
            oPre = nIndex > 0 ? aPosts[nIndex - 1] : null;
            return false;
        }
        return true;
    });

    that.render('site/index/post', {
        post: oPost,
        content: oResult.content,
        book: oBook,
        posts: aPosts,
        next: oNext,
        pre: oPre,
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
