
module.exports = {
    site: {
        domain: 'localhost:3000',
        name: '360读者网',
        title: '360读者网 - 读我喜欢',
        keywords: ['读者', '360读者', '在线阅读'],
        description: '本人一直喜欢阅读，360读者网是我的个人网站，为读者网友提供一个在线阅读的平台。网站已经针对移动设备进行优化，用手机、平板阅读更方便。360duzhe.com会保持更新频率，让我们一起寻找打动心灵的文章，发现愉快而美好的阅读时光！'
    },

    nav: {
        site: [
            {
                title: '首页',
                tag: 'index',
                href: '/'
            }, {
                title: '内容',
                tag: 'contents',
                href: function () {
                    var uri = _require('frame/uri');
                    return uri.common('posts');
                }
            },
            {
                title: '轻松一刻',
                tag: '4fun',
                href: function () {
                    var uri = _require('frame/uri');
                    return uri.common('qing-song-yi-ke');
                }
            }, {
                title: '我的主页',
                tag: 'profile',
                requireLogin: true,
                href: function (locals) {
                    var uri = _require('frame/uri');
                    return uri.profile(locals.session.user);
                }
            }
        ],
        cpanel: [
            {title: '首页', tag: 'index', href: '/cpanel'},
            {title: '测试', tag: 'test', href: '/cpanel/test'}
        ]
    },

    redis: {
        host: 'localhost',
        port: 6379,
        session: 1,
        cache: 2,
        password: '$_$'
    },

    // 数据库
    db: {
        dialect: 'mysql',
        database: '360duzhe',
        username: '$_$',
        password: '$_$',
        host: 'localhost',
        port: '3306'
    },

    // 静态文件路径
    front: {
        staticUrl: ''
    },
    
    page: {
        site: 20,
        user: 30,
        cpanel: 50
    },

    // session 和 cookie相关
    auth: {
        secret: '$_$',
        cookieName: '$_$',
        codeMaxAge: 86400000, // 注册码有效期, 1天 = 1000 * 60 * 60 * 24
        cookieMaxAge: 2592000000, // 登录 cookie 有效期 30天 = 1000 * 60 * 60 * 24 * 30
        sessionMaxAge: 3600000, // 1小时 = 1000 * 60 * 60

        viewCookieName: 'view',
        viewMaxAge: 10000, // 单次浏览间隔 60s = 1000 * 10，这个值不能设置得太长，不然 cookie 会很大，影响请求效率

        redisMaxAge: 30, // 通用查询在 redis 中的混存时间，这个数字随便定的
        redisCacheAge: 86400
    },
    
    // 邮件发送
    mail: {
        username: '$_$',
        password: '$_$'
    },
    
    // 七牛存储账号
    qiniu: {
        accessKey: '$_$',
        secretKey: '$_$',
        bucket: 'test360duzhe',
        domain: 'test360duzhe.qiniudn.com'
    }

};