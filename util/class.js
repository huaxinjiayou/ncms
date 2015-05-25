
var _ = require('underscore');

module.exports = {
    create: fCreate,
    mix: fMix,
    inherit: fInherit
}

function fCreate() {
    // 获得一个类定义，并且绑定一个类初始化方法
    var Class = function () {
        // 获得initialize引用的对象，如果是类调用，就没有this.initialize
        var that = this.constructor === Class ? this : arguments.callee;
        var fInitialize = that.initialize;
        if (fInitialize) {
            // 返回当前class派生出来对象可以被定义
            return fInitialize.apply(that, arguments);
        }
    };

    return Class;
}

function fMix(oChild, oParent, oExtend, oExtendPrototype) {
    if (!oChild.superClass) {
        oChild.superClass = {};
    }

    for (var sProperty in oParent) {
        if (_.isFunction(oParent[sProperty])) {
            // 如果是方法
            if (!oChild.superClass[sProperty]) {
                // superClass里面没有对应的方法，直接指向父类方法
                oChild.superClass[sProperty] = oParent[sProperty];
            } else {
                // superClass里有对应方法，需要新建一个function依次调用
                var _function = oChild.superClass[sProperty];
                oChild.superClass[sProperty] = function (_property, fFunc) {
                    return function () {
                        fFunc.apply(this, arguments);
                        oParent[_property].apply(this, arguments);
                    };
                } (sProperty, _function);
            }
        } else {
            // 类属性，直接复制
            oChild.superClass[sProperty] = oParent[sProperty];
        }

        if (!oChild[sProperty]) {
            // 子类没有父类的方法或属性，直接拷贝
            oChild[sProperty] = oParent[sProperty];
        }
    }

    if (oExtend) {
        _.extend(oChild, oExtend);
    }

    // toString 单独处理
    if (oParent.toString != oParent.constructor.prototype.toString) {
        oChild.superClass.toString = function () {
            oParent.toString.apply(oChild, arguments);
        };
    }

    if (oExtendPrototype && oChild.prototype && oParent.prototype) {
        module.exports.inherit(oChild, oParent, oExtendPrototype);
    }

    return oChild;
}

function fInherit(oChild, oParent, oExtend) {
    var Inheritance = function () { };
    Inheritance.prototype = oParent.prototype;
    /* 
        使用new父类方式生成子类的prototype
        为什么不使用oChild.prototype = oParent.prototype?
        1.子类和父类的prototype不能指向同一个对象，否则父类的属性或者方法会可能被覆盖
        2.父类中构造函数可能会有对象成员定义
        缺点：
        1.父类的构造函数不能继承，如果父类的构造函数有参数或者代码逻辑的话，会有些意外情况出现
        2.constructor需要重新覆盖
    */
    oChild.prototype = new Inheritance();
    oChild.prototype.constructor = oChild;
    oChild.superConstructor = oParent;
    oChild.superClass = oParent.prototype;
    if (oParent._onInherit) {
        try {
            oParent._onInherit(oChild);
        } catch (e) { }
    }
    if (oExtend) {
        _.extend(oChild.prototype, oExtend);
    }
}