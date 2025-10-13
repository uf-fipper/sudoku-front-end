# 使用 nginx 作为基础镜像
FROM nginx:alpine

# 删除默认的 nginx 静态文件
RUN rm -rf /usr/share/nginx/html/*

# 拷贝打包好的 dist 文件夹到 nginx 静态目录
COPY dist/ /usr/share/nginx/html/

# 如果需要支持 history 模式路由，添加自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
