
var book = _require('services/book');
var file = _require('services/file');
var post = _require('services/post');
var note = _require('services/note');
var count = _require('services/count');
var action = _require('services/action');
var user = _require('services/user');
var tag = _require('services/tag');
var relationpost = _require('services/relationpost');
var relationtag = _require('services/relationtag');
var util = _require('util/util');

module.exports = {
    route: '/note/:nid/:pinyin.html',
    filter: ['joke'],
    get: eval(windAsync(fGetNote))
};

function fGetNote(req, res, next) {
    var that = this;
    var sUid = util.id(that.user);
    var sNid = util.id(that.params.nid);
    var nCurPage = util.id(that.query.page);
    var oNote = $await(note.findById(sNid));
    var bIsAuthor = oNote && sUid === util.id(oNote.userId);
    var bIsPublish = oNote && (oNote.isPublish || bIsAuthor);

    // 如果专题不公开，则只有专题的作者可见
    if (!oNote || !bIsPublish) {
        return that.render500('不存在的专题');
    }

    // 相关数据
    var oResult = $await(Task.whenAll({
        cover: file.findCover(oNote),
        viewCount: count.log(note.type, sNid, count.actionType.view),
        likeCount: count.val(note.type, sNid, count.actionType.like),
        collectCount: count.val(note.type, sNid, count.actionType.collect),
        isLike: action.isAction(sUid, note.type, sNid, action.actionType.like),
        isCollect: action.isAction(sUid, note.type, sNid, action.actionType.collect),
        liketor: action.user(note.type, sNid, action.actionType.like, 6, 'updatedAt desc', true)
    }));

    // 作者
    var oAuthor = bIsAuthor ? that.user : null;
    if (!bIsAuthor) {
        oAuthor = $await(user.findById(oNote.userId));
    }

    // 是否推荐
    var bIsRecommend = false;
    if (that.isAdmin) {
        var oTag = $await(tag.recommend());
        bIsRecommend = $await(relationtag.hasTag(note.type, sNid, oTag));
    }

    // 查找子元素
    var oData = $await(relationpost.pageRelations(note.type, sNid, 'sort desc, updatedAt desc', nCurPage));
    var aItems = oData.data || [];
    var aPostIds = aItems.map(function (oItem) {return oItem.postId;});
    aItems = $await(post.findById(aPostIds));
    oData.data = aItems;

    // 查找全部作者
    var aUserIds = aItems.forEach(function (oItem) {return oItem.userId;});
    var oFilter = user.filter();
    oFilter.cond('id', aUserIds);
    oFilter.attr('id, nickname');
    var aAuthors = $await(user.find(oFilter));
    var oAuthorMap = {};
    aAuthors.forEach(function (oItem) {
        oAuthorMap[oItem.id] = oItem;
    });

    // 查找全部书籍
    var aBookIds = aItems.forEach(function (oItem) {return oItem.parentId;});
    oFilter = book.filter();
    oFilter.cond('id', aBookIds);
    oFilter.attr('id, title, pinyin');
    var aBooks = $await(book.find(oFilter));
    var oBookMap = {};
    aBooks.forEach(function (oItem) {
        oBookMap[oItem.id] = oItem;
    });

    that.render('site/index/note', {
        note: oNote,
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
        bookMap: oBookMap,
        authorMap: oAuthorMap,
        liketor: oResult.liketor
    });

}