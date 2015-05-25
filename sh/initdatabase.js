// 初始化数据库

require('../env');
_require('models/book').rebuild().start();

// 退出
console.log('finish');
process.exit(0);
