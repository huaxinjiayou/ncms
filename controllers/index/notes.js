
var note = _require('services/note');
var file = _require('services/file');
var tag = _require('services/tag');
var relationtag = _require('services/relationtag');

module.exports = {
    route: '/notes.html',
    filter: ['joke'],
    get: eval(windAsync(fGetNotes))
};

var fNewNotes = eval(windAsync(fGetNewNotes));

function fGetNotes(req, res, next) {
    var that = this;

    // 最新的文章
    if (that.query.tag === 'new') {
        return $await(fNewNotes.apply(that, arguments));
    }

    // 最新的文章
    if (that.query.tag === 'new') {
        return $await(fNewCollects.apply(that, arguments));
    }

    var oUser = that.user;
    var nCurPage = that.query.page;
    var oRecommend = $await(tag.recommend());
    var oData = $await(relationtag.pageObj(oRecommend, note.type, 'updatedAt desc', nCurPage));
    var aCovers = $await(file.findCover(oData.data));

    that.render('site/index/books.html', {
        items: oData.data,
        covers: aCovers,
        data: oData,
        type: 'note',
        listType: 'recommend'
    });
}

function fGetNewNotes(req, res, next) {
    var that = this;
    var nCurPage = that.query.page;

    var oFilter = note.filter();
    oFilter.order('createdAt desc');
    oFilter.cond('isPublish', true);
    oFilter.page(nCurPage);
    var oData = $await(note.page(oFilter));
    var aItems = oData.data;
    var aCovers = $await(file.findCover(aItems));
    that.render('site/index/books.html', {
        items: aItems,
        covers: aCovers,
        data: oData,
        type: 'note',
        listType: 'new'
    });
}