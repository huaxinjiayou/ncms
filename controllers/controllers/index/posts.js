
var post = _require('services/post');
var tag = _require('services/tag');
var book = _require('services/book');
var file = _require('services/file');
var relationtag = _require('services/relationtag');
var count = _require('services/count');
var action = _require('services/action');
var user = _require('services/user');

module.exports = {
    route: '/posts.html',
    filter: ['joke'],
    get: eval(windAsync(fGetPosts))
};

var fNewPosts = eval(windAsync(fGetNewPosts));

function fGetPosts(req, res, next) {
    var that = this;

    // 最新的文章
    if (that.query.tag === 'new' || that.query.tag === 'origianl') {
        return $await(fNewPosts.apply(that, arguments));
    }

    var oUser = that.user;
    var nCurPage = that.query.page;

    var oRecommend = $await(tag.recommend());
    var oData = $await(relationtag.pageObj(oRecommend, post.type, 'updatedAt desc', nCurPage));
    oData = oData;
    var aItems = oData.data || [];

    var aIds = aItems.map(function (oItem) {return oItem.id;});
    var aUserIds = aItems.map(function (oItem) {return oItem.userId;});
    var aBookIds = aItems.map(function (oItem) {return oItem.parentId;});

    var oResult = $await(Task.whenAll({
        viewCounts: count.val(post.type, aIds, count.actionType.view),
        likeCounts: count.val(post.type, aIds, count.actionType.like),
        isLikes: action.isAction(that.user, post.type, aIds, count.actionType.like)
    }));

    // 查找全部用户
    var oFilter = user.filter();
    oFilter.cond('id', aUserIds);
    oFilter.attr('id, nickname,avatar');
    var aAuthors = $await(user.find(oFilter));
    var oAuthorMap = {};
    aAuthors.forEach(function (oItem) {
        oAuthorMap[oItem.id] = oItem;
    });

    // 查找全部书籍
    oFilter = book.filter();
    oFilter.cond('id', aBookIds);
    oFilter.attr('id, title, pinyin');
    var aBooks = $await(book.find(oFilter));
    var oBookMap = {};
    aBooks.forEach(function (oItem) {
        oBookMap[oItem.id] = oItem;
    });

    that.render('site/index/posts', {
        data: oData,
        viewCounts: oResult.viewCounts,
        likeCounts: oResult.likeCounts,
        isLikes: oResult.isLikes,
        authorMap: oAuthorMap,
        bookMap: oBookMap,
        listType: 'recommend'
    });
}

function fGetNewPosts(req, res, next) {
    var that = this;
    var oUser = that.user;
    var nCurPage = that.query.page;
    var bNew = that.query.tag === 'new';

    var oFilter = post.filter();
    oFilter.cond('isPublish', true);

    if (!bNew) {
        oFilter.cond('isOriginal', true);
    }

    oFilter.order('createdAt desc, id desc');
    oFilter.include({book: 1, user: 1});
    oFilter.page(nCurPage);
    var oData = $await(post.page(oFilter));

    var aIds = (oData.data || []).map(function (oItem) {return oItem.id;});
    var oResult = $await(Task.whenAll({
        viewCounts: count.val(post.type, aIds, count.actionType.view),
        likeCounts: count.val(post.type, aIds, count.actionType.like),
        isLikes: action.isAction(that.user, post.type, aIds, count.actionType.like)
    }));

    that.render('site/index/postsNew', {
        data: oData,
        viewCounts: oResult.viewCounts,
        likeCounts: oResult.likeCounts,
        isLikes: oResult.isLikes,
        listType: bNew ? 'new' : 'origianl'
    });
}