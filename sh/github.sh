#!/bin/sh
#发布脚本
export LANG=en_US.UTF-8
export LC_ALL="en_US.utf8"
export LC_LANG="en_US.utf8"

DATETIME=$(date +'%Y%m%d%H%M')
WEBAPPPATH="/Users/huaxin/Code/nodejs/web/ncms"
PUBLISHNAME="ncms"
PUBLISHPATH="/Users/huaxin/Code/nodejs/web/ncmsgithub"

# 更新配置
source ~/.bashrc

# 当前路径
CURRENTPATH=$(cd `dirname $0`; pwd)

cd ${WEBAPPPATH}

# 移动开发文件
echo "移动开发文件"
cp -rf "${WEBAPPPATH}/controllers" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/filters" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/frame" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/models" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/node_modules" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/public/images" "${PUBLISHPATH}/${PUBLISHNAME}/public/"
cp -rf "${WEBAPPPATH}/public/stylesheets" "${PUBLISHPATH}/${PUBLISHNAME}/public/"
cp -rf "${WEBAPPPATH}/public/swf" "${PUBLISHPATH}/${PUBLISHNAME}/public/"
cp -rf "${WEBAPPPATH}/sequelize" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/services" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/sh/github.sh" "${PUBLISHPATH}/${PUBLISHNAME}/sh/github.sh"
cp -rf "${WEBAPPPATH}/sh/initdatabase.js" "${PUBLISHPATH}/${PUBLISHNAME}/sh/initdatabase.js"
cp -rf "${WEBAPPPATH}/sh/mail.js" "${PUBLISHPATH}/${PUBLISHNAME}/sh/mail.js"
cp -rf "${WEBAPPPATH}/sh/parseWind.js" "${PUBLISHPATH}/${PUBLISHNAME}/sh/parseWind.js"
cp -rf "${WEBAPPPATH}/test" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/util" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/views" "${PUBLISHPATH}/${PUBLISHNAME}/"
cp -rf "${WEBAPPPATH}/app.js" "${PUBLISHPATH}/${PUBLISHNAME}/app.js"
cp -rf "${WEBAPPPATH}/env.js" "${PUBLISHPATH}/${PUBLISHNAME}/env.js"
cp -rf "${WEBAPPPATH}/Makefile" "${PUBLISHPATH}/${PUBLISHNAME}/Makefile"
cp -rf "${WEBAPPPATH}/package.json" "${PUBLISHPATH}/${PUBLISHNAME}/package.json"

# 替换网站配置文件
cp -rf "${PUBLISHPATH}/config.bak.js" "${PUBLISHPATH}/${PUBLISHNAME}/config.js"

echo "提交代码"
cd "${PUBLISHPATH}/${PUBLISHNAME}"
env -i git add -A
env -i git commit -m ${DATETIME}
env -i git push origin master

echo "finish"