// windjs 编译

// 载入 app 环境变量
require('../env');

var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var uglifyJs = require('UglifyJs');

var util = _require('util/util');
var sApproot = process.env.PWD;

// 代码目录
var aDirName = ['controllers', 'filters', 'frame', 'models', 'sequelize', 'services', 'util'];

aDirName.forEach(function (sDirName) {
    glob.sync(process.env.PWD + '/' + sDirName + '/**/*.js').forEach(function (sFile) {
        var sPath = sFile.replace(sApproot.replace(/\/$/,'') + '/', '');

        // 分割路径
        var aParts = sPath.split('/');
        var sFileName = aParts.pop();

        // 读取内容
        var sContent = fs.readFileSync(sFile, {encoding: 'utf-8'});

        // 存在 eval 的情况，则进行解析
        if (/eval\(windAsync\(/g.test(sContent)) {
            var aContentAst = Wind.parse(sContent);
            var aEval = fFindEval(aContentAst);
            var oCodeResult = {};

            if (aEval && aEval.length > 0) {
                _.forEach(aEval, function (aItem) {
                    try {
                        var sFuncName = aItem[2][0][2][0][1];
                        var aFuncAst, bAnonymity;
                        if (!sFuncName) {
                            // 匿名函数随机生成名称
                            sFuncName = 'huaxinjiayou' + Math.floor(Math.random() * 10000000);
                            aFuncAst = aItem[2][0][2][0].slice(0);
                            aFuncAst[1] = sFuncName;
                            bAnonymity = true;


                            aItem[2][0][2][0].length = 0;
                            aItem[2][0][2][0][0] = 'name';
                            aItem[2][0][2][0][1] = sFuncName;
                        } else {
                            aFuncAst = fFindFunc(aContentAst, sFuncName);
                        }

                        var sCode = Wind.hxAst(aFuncAst);
                        var aCodeAst = Wind.parse(sCode);

                        // 匿名函数，则还原
                        if (bAnonymity) {
                            oCodeResult[sFuncName] = sCode.replace('function ' + sFuncName, 'function ') + ';';
                        } else {
                            oCodeResult[sFuncName] = sCode;
                        }
                    } catch (e) {
                        console.log('========== bug in : ' + sFileName);
                    }
                });

                // 用代码替换之前的标志位，避免源码注释被 uglify 去掉
                var sCode = uglifyJs.uglify.gen_code(aContentAst, {beautify: true});
                _.each(oCodeResult, function (sVal, sKey) {
                    sCode = sCode.replace('eval(windAsync(' + sKey + '))', sVal);
                });
                sContent = sCode;
            }
        }

        // 创建目录并重新写回
        aParts.unshift('output');
        var sDirName = process.env.PWD;
        aParts.forEach(function (sDir) {
            sDirName = path.join(sDirName, sDir);
            if (!fs.existsSync(sDirName)) {
                fs.mkdirSync(sDirName);
            }
        });
        fs.writeFileSync(path.join(sDirName, sFileName), sContent, {encoding: 'utf-8'});
    });
});


function fFindEval(aContentAst, aParent, aResult) {
    aResult = aResult || [];
    if (!util.isArray(aContentAst)) {
        return;
    }

    if (aContentAst.length === 2 && aContentAst[1] === 'eval' && aContentAst[0] === 'name') {
        aResult.push(aParent);
        return;
    }

    var aItem;
    for (var i = 0, l = aContentAst.length; i < l; i++) {
        aItem = aContentAst[i];
        if (!util.isArray(aItem)) {
            continue;
        }

        if (aItem.length === 2 && aItem[1] === 'eval' && aItem[0] === 'name') {
            aResult.push(aContentAst);
            return;
        } else {
            for (var ii = 0, ll = aItem.length; ii < ll; ii++) {
                fFindEval(aItem[ii], aItem, aResult);
            }
        }
    }

    return aResult;
}

function fFindFunc(aContentAst, sFuncName) {
    if (!util.isArray(aContentAst)) {
        return;
    }

    if (aContentAst[0] === 'defun' && aContentAst[1] === sFuncName) {
        return aContentAst;
    }

    var aItem;
    for (var i = 0, l = aContentAst.length; i < l; i++) {
        aItem = aContentAst[i];
        if (!util.isArray(aItem)) {
            continue;
        }

        if (aItem[0] === 'defun' && aItem[1] === sFuncName) {
            return aItem;
        } else {
            for (var ii = 0, ll = aItem.length; ii < ll; ii++) {
                var oResult = fFindFunc(aItem[ii], sFuncName);
                if (oResult) {
                    return oResult;
                }
            }
        }
    }
}

// 退出
console.log('finish');
process.exit(0);
