
var util = _require('util/util');
var user = _require('services/user');
var count = _require('services/count');
var action = _require('services/action');
var book = _require('services/book');
var post = _require('services/post');
var note = _require('services/note');

module.exports = eval(windAsync(fUserData));

function fUserData(req, res, next) {
    var that = this;
    that.profileUser = that.profileUser || that.user;

    // 是否是本人
    var oProfileUser = that.profileUser;
    var bIsSelf = util.id(oProfileUser) === util.id(that.user);

    // 添加来访统计
    if (!bIsSelf) {
        $await(action.log(that.user, user.type, util.id(oProfileUser), action.actionType.view));
    }

    // 获得的赞
    var oResult = $await(Task.whenAll({
        viewCount: count.log(user.type, util.id(oProfileUser), count.actionType.view),
        likeCount: count.val(user.type, util.id(oProfileUser), count.actionType.like),
        isLike: action.isAction(that.user, user.type, util.id(oProfileUser), count.actionType.like),
        visitor: action.user(user.type, util.id(oProfileUser), action.actionType.view, 6, 'updatedAt desc', true),
        liketor: action.user(user.type, util.id(oProfileUser), action.actionType.like, 6, 'updatedAt desc', true)
    }));

    // 书籍数量
    var oBookCond = {
        isEnd: true,
        parentId: null,
        userId: oProfileUser.id,
        isPublish: bIsSelf ? undefined : true
    };

    // 合集数量
    var oCollectCond = {
        isEnd: false,
        parentId: null,
        userId: oProfileUser.id,
        isPublish: bIsSelf ? undefined : true
    };

    // 文章数量
    var oPostCond = {
        userId: oProfileUser.id,
        isPublish: bIsSelf ? undefined : true
    };

    // 专题数量
    var oNoteCond = {
        userId: oProfileUser.id,
        isPublish: bIsSelf ? undefined : true
    };

    var oCount = $await(Task.whenAll({
        bookCount: book.count(oBookCond),
        collectCount: book.count(oCollectCond),
        postCount: post.count(oPostCond),
        noteCount: note.count(oNoteCond)
    }));
    
    that.profileData = {
        user: oProfileUser,
        isSelf: bIsSelf,
        viewCount: oResult.viewCount.val || 0,
        likeCount: oResult.likeCount,
        isLike: oResult.isLike,
        visitor: oResult.visitor,
        liketor: oResult.liketor,
        bookCount: oCount.bookCount,
        collectCount: oCount.collectCount,
        postCount: oCount.postCount,
        noteCount: oCount.noteCount
    };
    
    next();
}