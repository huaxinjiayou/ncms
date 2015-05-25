
var util = _require('util/util');

module.exports = {
    normal: 'javascript:void(0);',

    signin: '/sign/signin',
    signup: '/sign/signup',
    signout: '/sign/signout',
    signForgetPwd: '/sign/forgetpwd',
    signSend: '/sign/send',
    signSended: '/sign/sended',
    signSendedPwd: '/sign/sendedpwd',
    signupSucc: '/sign/signuped',
    signOauth: '/sign/oauth',

    profile: fUriProfile,
    writerNote: fUriWriterNote,
    writerPost: fUriWriterPost,
    writerBook: fUriWriterBook,
    cpanel: fUriCpanel,

    common: fUriCommon
};

function fUriProfile(oUser, sAction) {
    var sUid = util.id(oUser);
    sAction = sAction || 'index';

    if (!sUid) {
        return '/profile/' + sAction;
    }

    if (sAction === 'index') {
        return '/profile/' + sUid;
    }

    return '/profile/' + sUid + '/' + sAction;
}

function fUriWriterNote(sAction, oItem) {
    return this.common('note', oItem, sAction);
}

function fUriWriterPost(sAction, oItem) {
    return this.common('post', oItem, sAction, 'bid');
}

/**
 * 获取操作链接
 * @param  {String} sAction 操作类型, index, new, edit, del, newCollect
 * @param  {Object|String} oItem 操作对象
 * @return {String} 链接
 */
function fUriWriterBook(sAction, oItem) {
    if (sAction === 'newCollect') {
        return '/writer/book/new?type=collect';
    }
    return this.common('book', oItem, sAction, 'bid');
}

function fUriCpanel(sSubPath, oItem) {
    var sItemId = util.id(oItem);
    return '/cpanel/' + sSubPath + (sItemId ? '/' + sItemId : '');
}

function fUriCommon(sObjType, oItem, sAction, sParam) {
    var sItemId = util.id(oItem);
    var sUri = this.normal;

    if (sAction === 'index') {
        return '/writer/' + sObjType + (sItemId ? '/' + sItemId : '');
    }

    if (sAction === 'new') {
        sUri = '/writer/' + sObjType + '/new';
        if (sParam && sItemId) {
            sUri += '?' + sParam + '=' + sItemId;
        }
        return sUri;
    }

    if (!sItemId) {
        return sObjType ? '/' + sObjType + '.html' : sUri;
    }

    if (sAction === 'edit') {
        return ['/writer', sObjType, sItemId, 'edit'].join('/');
    } else if (sAction === 'del') {
        return ['/writer', sObjType, sItemId, 'del'].join('/'); 
    } else if (sObjType === 'profile' || sObjType === 'qsyk') {
        return ['/' + sObjType, sItemId].join('/')
    }
    return ['/' + sObjType, sItemId, oItem.pinyin || 'content'].join('/') + '.html';
}
