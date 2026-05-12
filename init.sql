-- SSD开卡工具站 - MySQL 数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ssd_tool_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ssd_tool_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'maintainer', 'user')),
    download_quota INT DEFAULT 5,
    downloads_used INT DEFAULT 0,
    quota_reset_date DATE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    parent_id VARCHAR(36),
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_parent_id (parent_id),
    INDEX idx_order_index (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 固件表
CREATE TABLE IF NOT EXISTS firmware (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    category_id VARCHAR(36),
    uploader_id VARCHAR(36),
    uploader_name VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    download_count INT DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uploader_id) REFERENCES users(id),
    INDEX idx_category_id (category_id),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 下载记录表
CREATE TABLE IF NOT EXISTS downloads (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    firmware_id VARCHAR(36),
    firmware_title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (firmware_id) REFERENCES firmware(id),
    INDEX idx_user_id (user_id),
    INDEX idx_firmware_id (firmware_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 捐赠记录表
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    user_nickname VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 系统配置表
CREATE TABLE IF NOT EXISTS config (
    `key` VARCHAR(100) PRIMARY KEY,
    value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始管理员账号 (密码: admin123 - 实际项目中应该加密存储)
INSERT INTO users (id, email, nickname, role, download_quota, is_premium)
VALUES ('user-001', 'admin@example.com', '系统管理员', 'admin', 9999, TRUE)
ON DUPLICATE KEY UPDATE nickname=nickname;

-- 插入系统配置
INSERT INTO config (`key`, value) VALUES
    ('site_settings', '{"name": "SSD开卡工具站", "description": "专业的固态硬盘开卡工具分享平台"}'),
    ('module_settings', '{"showHero": true, "showHot": true, "showLatest": true, "showDonations": true, "showContributors": true}'),
    ('quota_settings', '{"freeQuota": 5, "premiumQuota": 100, "singleDownloadPrice": 1, "premiumPrice": 8}')
ON DUPLICATE KEY UPDATE value=value;

-- 插入初始分类数据
INSERT INTO categories (id, name, parent_id, order_index) VALUES
    ('cat-1', '慧荣 (SMI)', NULL, 1),
    ('cat-2', '群联 (Phison)', NULL, 2),
    ('cat-3', '联芸 (Maxio)', NULL, 3),
    ('cat-4', '得一微 (YMC)', NULL, 4),
    ('cat-1-1', 'SM2258XT', 'cat-1', 1),
    ('cat-1-2', 'SM2259XT', 'cat-1', 2),
    ('cat-1-3', 'SM2263XT', 'cat-1', 3),
    ('cat-2-1', 'PS3111', 'cat-2', 1),
    ('cat-2-2', 'PS5013', 'cat-2', 2),
    ('cat-3-1', 'MAP1202', 'cat-3', 1)
ON DUPLICATE KEY UPDATE name=name;

-- 插入初始固件数据
INSERT INTO firmware (id, title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, download_count, is_paid, status) VALUES
    ('fw-1', 'SM2258XT 开卡工具 v1.2', '慧荣SM2258XT主控固态硬盘开卡工具，支持多种闪存颗粒，修复SSD无法识别问题。', '1.2', 'cat-1-1', 'user-001', '系统管理员', '/files/sm2258xt-v1.2.zip', 15728640, 2580, FALSE, 'approved'),
    ('fw-2', 'PS3111 量产工具 v2.5', '群联PS3111主控SSD开卡工具，支持最新固件版本，提供完整的开卡教程。', '2.5', 'cat-2-1', 'user-001', '系统管理员', '/files/ps3111-v2.5.zip', 23068672, 1845, FALSE, 'approved'),
    ('fw-3', 'SM2259XT 高级工具 v3.0', '专业版SM2259XT开卡工具，支持高级设置和调试功能，适合专业维修人员使用。', '3.0', 'cat-1-2', 'user-001', '系统管理员', '/files/sm2259xt-pro-v3.0.zip', 36700160, 890, TRUE, 'approved'),
    ('fw-4', 'MAP1202 开卡程序 v1.0', '联芸MAP1202主控专用开卡工具，操作简单，支持自动检测颗粒。', '1.0', 'cat-3-1', 'user-001', '系统管理员', '/files/map1202-v1.0.zip', 12582912, 654, FALSE, 'approved')
ON DUPLICATE KEY UPDATE title=title;

-- 插入初始捐赠数据
INSERT INTO donations (id, user_nickname, amount, type, created_at) VALUES
    ('don-1', '张*明', 8, 'premium_upgrade', DATE_SUB(NOW(), INTERVAL 1 MINUTE)),
    ('don-2', '李*华', 1, 'single_download', DATE_SUB(NOW(), INTERVAL 3 MINUTE)),
    ('don-3', '王*强', 8, 'premium_upgrade', DATE_SUB(NOW(), INTERVAL 5 MINUTE))
ON DUPLICATE KEY UPDATE amount=amount;

-- 查看插入的数据
SELECT 'Database initialized successfully!' AS message;
