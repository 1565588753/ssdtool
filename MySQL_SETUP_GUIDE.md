# SSD开卡工具站 - MySQL 版本完整配置指南

## 📋 管理员账号信息
- **邮箱**: admin@example.com  
- **密码**: admin123

## 🚀 快速开始（5分钟完成）

### 步骤1：确保MySQL已安装并运行

**Windows (使用XAMPP/WAMP/MAMP):**
```bash
# 启动MySQL服务
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS (使用Homebrew):**
```bash
brew services start mysql
```

### 步骤2：创建数据库

使用MySQL命令行或图形化工具（Navicat/phpMyAdmin）:

```sql
-- 方法1：直接执行
mysql -u root -p < init.sql

-- 方法2：手动创建
CREATE DATABASE IF NOT EXISTS ssd_tool_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssd_tool_db;
-- 然后导入 init.sql 文件内容
```

### 步骤3：配置数据库连接

编辑 `.env` 文件：
```bash
DB_HOST=localhost          # 数据库主机
DB_PORT=3306              # MySQL默认端口
DB_USER=root              # 你的MySQL用户名
DB_PASSWORD=your_password # 你的MySQL密码
DB_NAME=ssd_tool_db      # 数据库名
```

### 步骤4：安装依赖并启动

```bash
# 安装依赖
npm install

# 启动项目（同时运行前端和后端）
npm run dev
```

## 📊 数据同步说明

启动后，以下数据会自动从MySQL数据库同步：

### 前台显示的数据
1. **统计数据区** - 从数据库实时读取：
   - 固件总数 (firmware表记录数)
   - 下载次数总和 (downloads表)
   - 用户数量 (users表)
   - 主控品牌数量 (categories表)

2. **热门固件** - 基于 download_count 排序
3. **最新上传** - 基于 created_at 排序
4. **爱心捐赠** - 从 donations 表读取
5. **贡献榜** - 根据用户上传固件数量排序

### 数据表对应关系
- `users` → 用户账号信息
- `categories` → 分类管理（支持多级分类）
- `firmware` → 固件信息
- `downloads` → 下载记录
- `donations` → 捐赠记录
- `contributors` → 贡献者统计

## 🔧 故障排查

### 问题1：连接数据库失败
```
Error: ER_ACCESS_DENIED_ERROR
```
**解决方案**: 检查 `.env` 中的 `DB_USER` 和 `DB_PASSWORD` 是否正确

### 问题2：数据库不存在
```
Error: ER_BAD_DB_ERROR
```
**解决方案**: 运行 `mysql -u root -p < init.sql` 创建数据库

### 问题3：端口3001被占用
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

### 问题4：前端仍然显示连接错误
清除浏览器缓存后重试，或使用无痕模式打开页面。

## 📝 数据库表结构概览

### users 表
存储用户信息，包括管理员和普通用户：
```sql
- id, email, password (加密), nickname
- role: 'admin' | 'user'
- download_quota: 下载配额
- is_premium: 是否Premium会员
```

### categories 表
支持多级分类的树形结构：
```sql
- id, name, parent_id (父分类ID), order_index
```

### firmware 表
固件文件信息：
```sql
- id, title, description, version
- category_id, uploader_id, file_path
- download_count, is_paid, price, status
```

### donations 表
爱心捐赠记录：
```sql
- id, user_nickname, amount, type
```

## 🎯 测试建议

1. **首次使用**：
   - 访问 http://localhost:5173
   - 使用管理员账号登录
   - 在用户中心测试添加分类和标签

2. **数据验证**：
   - 检查首页统计数据是否与数据库一致
   - 测试分类页面的筛选功能
   - 验证捐赠和贡献榜数据显示

3. **性能检查**：
   - 确认API响应时间 < 200ms
   - 检查浏览器控制台无错误
   - 验证页面加载流畅

## 🔒 安全建议

1. 生产环境务必修改 `admin123` 默认密码
2. 使用强密码策略（包含大小写、数字、特殊字符）
3. 定期备份数据库
4. 不要将 `.env` 文件提交到版本控制

## 📞 常见问题

**Q: 如何重置管理员密码？**
```sql
UPDATE users SET password = '$2a$10$...' WHERE email = 'admin@example.com';
```
（使用 bcrypt 加密的新密码）

**Q: 如何添加测试数据？**
参考 `init.sql` 文件底部的示例数据插入语句。

**Q: 备份数据库命令？**
```bash
mysqldump -u root -p ssd_tool_db > backup_$(date +%Y%m%d).sql
```

---

启动后如果还有问题，请查看浏览器控制台的具体错误信息！
