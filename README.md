# 图书管理系统

一个基于 Vue.js 和 Node.js 的图书借阅管理系统，支持用户注册、登录、图书搜索、借阅管理、罚款处理等功能。

## 项目简介

本系统是一个完整的图书管理解决方案，包含前端用户界面和后端 API 服务。系统支持多种用户角色（学生、教师、管理员），提供图书借阅、归还、罚款管理等功能。

## 技术栈

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP 客户端
- **Vite** - 前端构建工具

### 后端

- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **MySQL** - 关系型数据库

## 快速启动

本系统推荐使用 Docker Compose 进行快速部署。

### 1. 环境准备

- Docker Engine
- Docker Compose

### 2. 配置文件

在项目根目录创建 `.env` 文件，复制以下内容：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root密码
DB_NAME=bookmanage
SUPER_ADMIN_NAME=超级管理员名字
SUPER_ADMIN_PASSWORD=超级管理员密码
SUPER_ADMIN_PHONE=超级管理员电话
```

### 3. 启动服务

运行以下命令构建并启动所有服务：

```bash
docker-compose up --build -d
```

### 4. 访问应用

- **前端页面**：http://localhost:80
- **后端 API**：http://localhost:3000
- **数据库**：localhost:3306

## 项目结构

```
BookManage/
├── backend/                 # 后端服务
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── routes/             # 路由
│   ├── utils/              # 工具函数
│   ├── tests/              # 测试文件
│   ├── server.js           # 服务器入口
│   └── package.json        # 后端依赖配置
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 可重用组件
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── package.json        # 前端依赖配置
│   └── vite.config.js      # Vite配置
├── database/               # 数据库相关
│   ├── migrations/         # 数据库迁移
│   ├── schema/            # 数据库结构
│   └── seeds/             # 种子数据
└── README.md              # 项目说明文档
```

## 功能说明

### 用户功能

- **用户注册**：支持学生、教师、管理员等不同身份类型注册
- **用户登录**：基于 JWT 的安全认证
- **个人中心**：查看个人信息、当前借阅、历史记录、罚款信息
- **图书搜索**：支持按书名、作者、标签、出版社、ISBN 搜索
- **在线借书**：快速借阅功能
- **在线还书**：便捷的还书操作
- **罚款查询**：查看罚款记录和缴纳状态

### 管理员功能

- **用户管理**：查看、搜索、冻结/激活用户账户
- **借阅记录管理**：查看所有用户的借阅记录
- **罚款记录管理**：查看所有罚款记录
- **登录日志**：查看用户登录历史和 IP 地址

### 系统功能

- **权限控制**：基于用户角色的访问控制
- **数据统计**：借阅量、罚款等数据统计
- **自动计算**：逾期天数、罚款金额自动计算
- **实时更新**：数据变更实时反映到界面

## 开发说明

### 添加新功能

1. 后端：在 `backend/controllers/` 添加新的控制器方法
2. 前端：在 `frontend/src/views/` 添加新的页面组件
3. 路由：在 `frontend/src/router/index.js` 添加新路由
4. API：在 `frontend/src/utils/api.js` 添加新的 API 调用

### 数据库修改

1. 在 `database/migrations/` 中添加新的迁移文件
2. 运行迁移：`npm run migrate`
3. 更新相关模型和控制器

### 样式修改

- 全局样式：在 `frontend/src/main.js` 中导入 CSS 文件
- 组件样式：在 Vue 组件的 `<style>` 标签中编写
- 使用 CSS 预处理器：项目支持 Sass/Less

## 联系方式

如有问题或建议，请联系开发团队。

---

**注意**：本项目仅用于本地开发和测试环境，请勿在生产环境中使用。
