
var setting = _require('services/setting');
var file = _require('services/file');
var string = _require('util/string');
var uri = _require('frame/uri');

module.exports = {
    route: '/cpanel/slide/new',
    filter: ['admin'],
    get: eval(windAsync(fGetSettingEdit)),
    post: eval(windAsync(fPostSettingEdit))
};

function fGetSettingEdit(req, res, next) {
    var that = this;
    that.setUpToken();
    that.render('cpanel/slide/form', {
        slide: {
            content: {}
        },
        isEdit: false
    });
}

function fPostSettingEdit(req, res, next) {
    var that = this;

    var bRetain = !!that.body.retain;
    var bIsPublish = !!that.body.isPublish;
    var sContent = string.obj2str({
        title: that.body.title,
        url: that.body.url,
        style: that.body.style,
        imageId: that.body.imageId,
        description: that.body.description
    });
    $await(setting.create(that.user, {
        content: sContent,
        type: setting.objType.slide,
        isPublish: bIsPublish
    }));

    if (bRetain) {
        that.redirect();
    } else {
        that.redirect(uri.cpanel('slide'));
    }
}