ncms
====

### 使用
1. clone
2. 根据自己的环境修改 config.js 中的 $_$ 变量
3. 执行 `node sh/initdatabase.js ` 初始化数据库
4.  执行`node app` 

### 说明
1. [360duzhe.com](http://360duzhe.com) 的源代码，使用 express + mysql 开发，后端使用 wind 作为异步管理工具（sh/parseWind.js 提供了 wind 文件编译），前端使用 seajs 作为模块管理工具
2. 开发过程中借鉴了很多人的开发思路（[前端乱炖](http://www.html-js.com/)、[CNode](https://cnodejs.org/)、 [tornado](https://github.com/tornadoweb/tornado)...）及开发成果（[express](https://github.com/strongloop/express)、[wind](https://github.com/JeffreyZhao/wind)、[seajs](https://github.com/seajs/seajs) ...）
3. node_modules 中根据自身需求改了一些库的实现，具体搜索关键字 'huaxinjiayou'
4. 暂时缺少 public/javascripts 目录，不方便公开
5. 具体的代码结构说明[请看这里](http://www.360duzhe.com/post/1972/wang-zhan-dai-ma-jie-gou-shuo-ming.html)