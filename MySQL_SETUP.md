# SSD开卡工具站 - MySQL 版本

## 管理员账号信息
- **邮箱**: admin@example.com
- **密码**: admin123

## 快速开始

### 1. 环境准备
确保你的系统已安装：
- Node.js 18+
- MySQL 8.0+

### 2. 数据库配置

#### 方式一：使用 MySQL 命令行
```bash
# 创建数据库并导入初始化脚本
mysql -u root -p < init.sql
```

#### 方式二：使用图形化工具（如 Navicat, phpMyAdmin）
1. 新建数据库 `ssd_tool_db`
2. 导入 `init.sql` 文件

### 3. 配置环境变量
```bash
# 复制 .env.example 为 .env
cp .env.example .env

# 编辑 .env 文件，填入你的数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ssd_tool_db
```

### 4. 安装依赖
```bash
npm install
```

### 5. 启动项目
```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run client:dev  # 前端 (http://localhost:5173)
npm run server:dev  # 后端 (http://localhost:3001)
```

## 项目结构
```
.
├── api/              # 后端代码
│   ├── db.js         # MySQL 数据库连接
│   └── server.js     # Express 服务器
├── src/              # 前端代码
├── shared/           # 共享类型定义
├── init.sql          # MySQL 数据库初始化脚本
└── .env.example      # 环境变量示例
```

## 数据库表结构
- **users**: 用户表
- **categories**: 分类表
- **firmware**: 固件表
- **downloads**: 下载记录表
- **donations**: 捐赠记录表
- **config**: 系统配置表

## 注意事项
1. 生产环境请务必修改默认密码
2. 密码应该使用 bcrypt 等方式加密存储
3. 数据库连接信息应妥善保管，不要提交到代码仓库
