
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var string = _require('util/string');
var Service = clazz.create();
var oModel = _require('models/post');

clazz.mix(Service, Base, null, {
    initialize: fPostInitialize,
    create: eval(windAsync(fPostCreate)),
    updateById: eval(windAsync(fPostUpdateById)),
    removeById: eval(windAsync(fPostRemoveById))
});
module.exports = new Service(oModel);

function fPostInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fPostCreate(oUser, oData) {
    var that = this;
    var sUid = util.id(oUser);
    if (!sUid) {
        return;
    }

    var book = _require('services/book');
    var sBookId = util.id(oData.parentId);
    var oBook = $await(book.findById(sBookId));
    if (!oBook || book.isCollect(oBook)) {
        return;
    }

    var content = _require('services/content');
    var sContent = oData.content || ''
    var oContent = $await(content.create(oUser, {
        content: sContent
    }));

    delete oData.content;

    oData.userId = sUid;
    oData.contentId = oContent.id;
    oData.title = oData.title || '无标题文章';

    // 完善简介 和 字数
    var sRawContent = string.clearHtml(sContent).replace(/　/gi, '');
    oData.description = string.left(sRawContent, 150);
    oData.words = sRawContent.replace(/[\s\r\t\n]/gi, '').length;

    var oPost = $await(Service.superClass.create.call(that, oUser, oData));
    $await(book.updateCount(oData.parentId, 'itemCount', that, 'parentId'));
    return oPost;
}

function fPostUpdateById(oUser, sPostId, oData) {
    var that = this;
    var sUid = util.id(oUser);
    var oPost = $await(that.findById(sPostId));
    var oFilter = null;

    if (!sUid || util.id(oPost.userId) !== sUid || !sPostId) {
        return;
    }

    delete oData['userId'];
    delete oData['isDel'];

    if (oData.content) {
        var content = _require('services/content');
        oFilter = content.filter();
        oFilter.data('content', oData.content);
        oFilter.cond('id', oPost.contentId);
        $await(content.update(oFilter));

        // 完善简介 和 字数
        var sRawContent = string.clearHtml(oData.content);
        oData.description = string.left(sRawContent, 150);
        oData.words = sRawContent.replace(/[\s\r\t\n]/gi, '').length;
    }

    if (oData.title === '') {
        oData.title = '无标题文章';
    }

    oFilter = that.filter();
    oFilter.data(oData);
    oFilter.cond('id', sPostId);
    $await(Service.superClass.update.call(that, oFilter));

    var sDParentId = util.id(oData.parentId);
    var sBParentId = util.id(oPost.parentId);
    if (sDParentId && sDParentId !== sBParentId) {
        var book = _require('services/book');
        $await(book.updateCount(sDParentId, 'itemCount', that, 'parentId'));
        $await(book.updateCount(sBParentId, 'itemCount', that, 'parentId'));
    }
}

function fPostRemoveById(oUser, sPostId) {
    var that = this;
    var sUid = util.id(oUser);
    var oPost = $await(that.findById(sPostId));
    var oFilter = null;

    if (!sUid || util.id(oPost.userId) !== sUid || !sPostId) {
        return;
    }

    var oFilter = that.filter();
    oFilter.cond('id', sPostId);
    oFilter.data('isDel', true);
    $await(that.update(oFilter));
    var book = _require('services/book');
    $await(book.updateCount(oPost.parentId, 'itemCount', that, 'parentId'));
}

