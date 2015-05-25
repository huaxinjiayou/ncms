
var _ = require('underscore');
var Base = _require('services/base');
var clazz = _require('util/class');
var util = _require('util/util');
var Service = clazz.create();
var oModel = _require('models/file');

clazz.mix(Service, Base, {

}, {
    initialize: fFileInitialize,

    groupByDate : eval(windAsync(fFileGroupByDate)),
    findByDate  : eval(windAsync(fFileFindByDate)),

    findCover   : eval(windAsync(fFileFindCover))
});
module.exports = new Service(oModel);

function fFileInitialize(oModel) {
    var that = this;
    Service.superClass.initialize.call(that, oModel);
}

function fFileGroupByDate(sUid, sType) {
    var that = this;
    sUid = util.id(sUid);

    var sTmpType = sType ? "type = '" + sType + "'" : null;
    var sTmpUser = sUid ? "userId = " + sUid : null;
    var sWhere = 'where ' + (sTmpType ? sTmpType + (sTmpUser ? ' and ' : '') : '') + (sTmpUser || '');

    var aResult = $await(that.model.sql("select DATE_FORMAT(createdAt,'%Y%m') months,count(*) count from file #{where} group by months order by months desc", {
        where: sWhere,
        extConf: {raw: true}
    }));

    aResult = aResult || [];
    if (!util.isArray(aResult)) {
        aResult = [aResult];
    }
    return aResult;
}

function fFileFindByDate(sUid, sType, sDate) {
    var that = this;
    sUid = util.id(sUid);

    var aFiles = $await(that.model.sql("select * from file where DATE_FORMAT(createdAt,'%Y%m') = '#{date}' #{type} #{user} order by createdAt desc", {
        date: sDate,
        type: sType ? "and type = '" + sType + "'" : '',
        user: sUid ? "and userId = " + sUid : '',
        sequelize: that.sequelize
    }));

    aFiles = aFiles || [];
    if (!util.isArray(aFiles)) {
        aFiles = [aFiles];
    }

    return aFiles;
}

// function fFileFindCover(aData, sKey, bGetAll) {
//     var that = this;

//     if (!aData) {
//         return [];
//     }

//     sKey = sKey || 'cover';
//     var aResult = [];
//     var bIsArray = util.isArray(aData);
//     aData = bIsArray ? aData : [aData];

//     for (var i = 0, l = aData.length; i < l; i++) {
//         var oData = aData[i];
//         var aFileKey = oData ? util.split(oData[sKey]) : [];

//         aFileKey = bGetAll ? aFileKey : aFileKey.slice(0, 1);
//         var aFiles = $await(that.findById(aFileKey));

//         if (oData) {
//             aResult.push(bGetAll ? aFiles : aFiles[0]);
//         }
//     }

//     return bIsArray ? aResult : aResult[0];
// }

function fFileFindCover(aData, sKey, bGetAll) {
    var that = this;

    if (!aData) {
        return [];
    }

    sKey = sKey || 'cover';
    var bIsArray = util.isArray(aData);
    aData = bIsArray ? aData : [aData];

    // 先统一查出所有需要查询的文件，再按照每个文件的 file 的值分配文件
    var aAllIds = [];
    var aDataIds = [];
    for (var i = 0, l = aData.length; i < l; i++) {
        var oData = aData[i];
        var aFileKey = oData ? util.split(oData[sKey]) : [];
        aFileKey = bGetAll ? aFileKey : aFileKey.slice(0, 1);

        aDataIds.push(aFileKey);
        aAllIds = aAllIds.concat(aFileKey);
    }
    aAllIds = _.union(aAllIds);

    var aFiles = $await(that.findById(aAllIds));
    var oFileMap = {};
    aFiles.forEach(function (oItem) {
        oFileMap[oItem.id] = oItem;
    });
    aFiles.length = 0;

    var aResult = [];
    aDataIds.forEach(function (aIds, nIndex) {
        if (!bGetAll) {
            var sTmpId = aIds[0];
            aResult.push(sTmpId && oFileMap[sTmpId] ? oFileMap[sTmpId] : null);
            return;
        }

        aResult[nIndex] = [];
        aIds.forEach(function (sId) {
            sId && oFileMap[sId] && aResult[nIndex].push(oFileMap[sId]);
        });
    });
    aAllIds.length = 0;
    aDataIds.length = 0;

    return bIsArray ? aResult : aResult[0];
}
