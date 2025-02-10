# 使用 Node.js 20.18 作为基础镜像
FROM node:20.18

# 设置工作目录
WORKDIR /app

# 复制项目文件到容器中
COPY . .

# 安装依赖
RUN npm install

# 构建项目
RUN npm run build

# 暴露端口（根据你的项目需求修改）
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]