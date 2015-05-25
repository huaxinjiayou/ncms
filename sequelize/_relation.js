/* global _require */

var action = _require('sequelize/action');
var book = _require('sequelize/book');
var content = _require('sequelize/content');
var count = _require('sequelize/count');
var file = _require('sequelize/file');
var joke = _require('sequelize/joke');
var mail = _require('sequelize/mail');
var note = _require('sequelize/note');
var post = _require('sequelize/post');
var relationpost = _require('sequelize/relationpost');
var relationtag = _require('sequelize/relationtag');
var setting = _require('sequelize/setting');
var tag = _require('sequelize/tag');
var user = _require('sequelize/user');

// 微信抓取相关
var wxpost = _require('sequelize/wxpost');
var wxpublic = _require('sequelize/wxpublic');

var bFirst = true;

module.exports = function () {
    // 只能执行一次
    if (!bFirst) {
        return;
    }
    bFirst = false;

    // 书籍
    book.belongsTo(book, { foreignKey: 'parentId' });
    book.hasMany(book, { foreignKey: 'parentId' });

    // 书籍、文章
    post.belongsTo(book, { foreignKey: 'parentId' });
    book.hasMany(post, { foreignKey: 'parentId' });

    // 文章 & 内容
    post.belongsTo(content, { foreignKey: 'contentId' });
    content.hasOne(post, { foreignKey: 'contentId' });

    // 文章所属关系
    relationpost.belongsTo(post, { foreignKey: 'postId' });
    post.hasMany(relationpost, { foreignKey: 'postId' });

    // 标签
    tag.belongsTo(tag, { foreignKey: 'parentId' });
    tag.hasMany(tag, { foreignKey: 'parentId' });
    relationtag.belongsTo(tag, { foreignKey: 'tagId' });
    tag.hasMany(relationtag, { foreignKey: 'tagId' });
    
    // 用户发布的内容
    [action, book, file, joke, note, post, setting, tag].forEach(function (oItem) {
        oItem.belongsTo(user, { foreignKey: 'userId' });
        user.hasMany(oItem, { foreignKey: 'userId' });
    });

    // 微信
    wxpost.belongsTo(wxpublic, {foreignKey: 'parentId'});
    wxpublic.hasMany(wxpost, {foreignKey: 'parentId'});
};