
var setting = _require('services/setting');
var file = _require('services/file');
var post = _require('services/post');
var book = _require('services/book');
var note = _require('services/note');
var user = _require('services/user');
var relationtag = _require('services/relationtag');
var tag = _require('services/tag');
var count = _require('services/count');
var action = _require('services/action');

module.exports = {
    ignore: true,
    filter: ['joke'],
    get: eval(windAsync(fGetIndex))
};

function fGetIndex(req, res, next) {
    var that = this;

    // 获取首页切换
    var oFilter = setting.filter();
    oFilter.cond('type', setting.objType.slide);
    oFilter.cond('isPublish', true);
    oFilter.order('sort asc, createdAt desc');
    var aSetting = $await(setting.find(oFilter));
    setting.loadContent(aSetting);
    var aContent = aSetting.map(function (oItem) {return oItem.content; });
    var aCovers = $await(file.findCover(aContent, 'imageId'));
    var aResult = [];
    var oCover;
    for (var i = 0, l = aSetting.length; i < l; i++) {
        oCover = aCovers[i];
        aContent[i].image = {
            id: oCover.id,
            bucket: oCover.bucket,
            qnKey: oCover.qnKey
        };
        aResult.push({
            content: aContent[i]
        });
    }

    // 获取推荐的书籍 和 文章
    var oRecommend = $await(tag.recommend());
    var aBook = $await(relationtag.findObj(oRecommend, book.type, 'updatedAt desc', 4));
    var aPost = $await(relationtag.findObj(oRecommend, post.type, 'updatedAt desc', 5));
    var aBookCover = $await(file.findCover(aBook));

    // 查找全部文章的用户
    var aPostIds = aPost.map(function (oItem) {return oItem.id;});
    var aPostUserIds = aPost.map(function (oItem) {return oItem.userId;});
    var aBookIds = aPost.map(function (oItem) {return oItem.parentId;});
    oFilter = user.filter();
    oFilter.cond('id', aPostUserIds);
    oFilter.attr('id, nickname,avatar');
    var aAuthors = $await(user.find(oFilter));
    var oAuthorMap = {};
    aAuthors.forEach(function (oItem) {
        oAuthorMap[oItem.id] = oItem;
    });

    // 查找全部文章的书籍
    oFilter = book.filter();
    oFilter.cond('id', aBookIds);
    oFilter.attr('id, title, pinyin');
    var aBooks = $await(book.find(oFilter));
    var oBookMap = {};
    aBooks.forEach(function (oItem) {
        oBookMap[oItem.id] = oItem;
    });

    var oResult = $await(Task.whenAll({
        viewCounts: count.val(post.type, aPostIds, count.actionType.view),
        likeCounts: count.val(post.type, aPostIds, count.actionType.like),
        isLikes: action.isAction(that.user, post.type, aPostIds, count.actionType.like)
    }));

    // 获取最新的注册用户
    oFilter = user.filter();
    oFilter.cond('isEmailVerify', true);
    oFilter.order('createdAt desc');
    oFilter.limit(6);
    var aNewUser = $await(user.find(oFilter));
    aNewUser = aNewUser || [];
    var aNewUserTime = aNewUser.map(function (oItem) {return oItem.createdAt;});

    res.render('site/index/index', {
        slide: JSON.stringify(aResult),

        books: aBook,
        bookCovers: aBookCover,

        posts: aPost,
        postAuthorMap: oAuthorMap,
        postBookMap: oBookMap,
        postViewCounts: oResult.viewCounts,
        postLikeCounts: oResult.likeCounts,
        postIsLikes: oResult.isLikes,

        newUsers: aNewUser,
        newUserTimes: aNewUserTime
    });
}