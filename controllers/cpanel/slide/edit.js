
var setting = _require('services/setting');
var file = _require('services/file');
var string = _require('util/string');
var uri = _require('frame/uri');

module.exports = {
    route: '/cpanel/slide/edit/:sid',
    filter: ['admin'],
    get: eval(windAsync(fGetSettingEdit)),
    post: eval(windAsync(fPostSettingEdit))
};

function fGetSettingEdit(req, res, next) {
    var that = this;
    that.setUpToken();
    var sid = that.params.sid;
    var oSlide = $await(setting.findById(sid));

    if (!oSlide) {
        return that.render500('不存在的首页轮换');
    }

    setting.loadContent(oSlide);
    var oCover = $await(file.findById(oSlide.content.imageId));
    that.render('cpanel/slide/form', {
        slide: oSlide,
        cover: oCover,
        isEdit: true
    });
}

function fPostSettingEdit(req, res, next) {
    var that = this;
    that.setUpToken();
    var sid = that.params.sid;

    var bIsPublish = !!that.body.isPublish;
    var sContent = string.obj2str({
        title: that.body.title,
        url: that.body.url,
        style: that.body.style,
        imageId: that.body.imageId,
        description: that.body.description
    });

    var oFilter = setting.filter();
    oFilter.data('isPublish', bIsPublish);
    oFilter.data('content', sContent);
    oFilter.cond('id', sid);
    $await(setting.update(oFilter));
    that.redirect(uri.cpanel('slide'));
}