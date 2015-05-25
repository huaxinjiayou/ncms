/* global windAsync */
/* global $await */

var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/book');

clazz.mix(Service, Base, {
    type: {
        normal: 0,
        system: 1
    }
}, {
    initialize: fBookInitialize,

    create: eval(windAsync(fBookCreate)),
    updateById: eval(windAsync(fBookUpdateById)),
    removeById: eval(windAsync(fBookRemoveById)),
    findSysTmp: eval(windAsync(fBookFindSysTmp)),
    findCover: eval(windAsync(fBookFindCover)),

    isBook: fBookIsBook,
    isCollect: fBookIsCollect,
    sort: fBookSort
});
module.exports = new Service(oModel);

function fBookInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fBookCreate(oUser, oData) {
    var that = this;

    // 创建书籍
    var sUid = util.id(oUser);

    if (!sUid) {
        return;
    }

    // 查找父元素
    var sParentId = util.id(oData.parentId);
    var oParent = $await(that.findById(sParentId));
    sParentId = oParent && oParent.isEnd && util.id(oParent.userId) === sUid ? sParentId : null;
    oData.parentId = sParentId || oData.parentId;

    // 判断是否完结
    var bIsEnd = oData.isEnd;
    bIsEnd = sParentId || bIsEnd || bIsEnd === undefined;
    oData.isEnd = bIsEnd;

    // 设置默认标题
    if (!oData.title) {
        oData.title = '无标题' + (bIsEnd ? '书籍' : '合集');
    }
    
    // 创建书籍
    var oBook = $await(Service.superClass.create.call(that, oUser, oData));
    
    // 更新父元素的数量
    $await(that.updateCount(oData.parentId, 'itemCount', that, 'parentId'));
    return oBook;
}

function fBookUpdateById(oUser, sBookId, oData) {
    var that = this;
    var oBook = $await(that.findById(sBookId));
    var sUid = util.id(oUser);
    if (!sUid || util.id(oBook.userId) !== sUid) {
        return;
    }

    delete oData['userId'];
    delete oData['isDel'];

    // 默认标题
    if (oData.title === '') {
        oData.title = '无标题' + (oData.isEnd ? '书籍' : '合集');
    }

    // 更新数据
    var oFilter = that.filter();
    oFilter.data(oData);
    oFilter.cond('id', oBook.id);
    $await(Service.superClass.update.call(that, oFilter));

    // 更改书籍的父元素
    var sDParentId = util.id(oData.parentId);
    var sBParentId = util.id(oBook.parentId);
    if (sDParentId && oBook.isEnd && sDParentId !== sBParentId) {
        $await(that.updateCount(sDParentId, 'itemCount', that, 'parentId'));
        $await(that.updateCount(sBParentId, 'itemCount', that, 'parentId'));
    }
}

function fBookRemoveById(oUser, sBookId) {
    var that = this;
    var oBook = $await(that.findById(sBookId));
    var sUid = util.id(oUser);
    if (!sUid || util.id(oBook.userId) !== sUid) {
        return;
    }

    var post = _require('services/post');
    var oFilter;
    oFilter = that.filter();
    oFilter.cond('id', oBook.id);
    oFilter.data('itemCount', 0);
    oFilter.data('isDel', true);
    $await(that.update(oFilter));

    if (that.isBook(oBook)) {
        oFilter = post.filter();
        oFilter.cond('parentId', oBook.id);
        oFilter.data('isDel', true);
        $await(post.update(oFilter));
        $await(that.updateCount(oBook.parentId, 'itemCount', that, 'parentId'));
        return;
    }

    oFilter = that.filter();
    oFilter.cond('parentId', oBook.id);
    oFilter.attr('id');
    var aBooks = $await(that.find(oFilter));
    var aIds = aBooks.map(function (oItem) {return oItem.id;});

    // 删除全部书籍
    oFilter = that.filter();
    oFilter.cond('id', aIds);
    oFilter.data('isDel', true);
    oFilter.data('itemCount', 0);
    $await(that.update(oFilter));

    // 删除全部文章
    oFilter = post.filter();
    oFilter.cond('parentId', aIds);
    oFilter.data('isDel', true);
    $await(post.update(oFilter));
}

function fBookFindSysTmp(oUser) {
    var that = this;
    var sUid = util.id(oUser);

    if (!sUid) {
        return;
    }

    var oData = {
        title: '临时书籍',
        isEnd: true,
        userId: sUid,
        type: Service.type.system
    };

    var oFilter = that.filter();
    oFilter.cond(oData);
    oFilter.data(oData);
    return $await(that.findOrCreate(oUser, oFilter));
}

function fBookFindCover(oBook) {

}


function fBookIsBook(oBook) {
    return !!oBook.isEnd;
}

function fBookIsCollect(oBook) {
    return !oBook.isEnd;
}

function fBookSort(aBook) {
    var oResult = {
        books: [],
        collects: []
    };
    var oMap = {};

    aBook && aBook.forEach(function (oItem) {
        if (oItem.isEnd) {
            var sParentId = util.id(oItem.parentId);
            if (!sParentId) {
                oResult.books.push(oItem);
            } else {
                if (!oMap[sParentId]) {
                    oMap[sParentId] = [];
                }

                oMap[sParentId].push(oItem);
            }
        } else {
            var sId = util.id(oItem.id);
            if (!oMap[sId]) {
                oMap[sId] = [];
            }
            var aBooks = oMap[sId];

            oResult.collects.push({
                collect: oItem,
                books: aBooks
            });
        }
    });

    return oResult;
}

