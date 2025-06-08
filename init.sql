-- 物业管理系统数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS property_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE property_management;

-- 设置时区
SET time_zone = '+08:00';

-- 创建用户（如果不存在）
CREATE USER IF NOT EXISTS 'property_user'@'%' IDENTIFIED BY 'property_pass';

-- 授权
GRANT ALL PRIVILEGES ON property_management.* TO 'property_user'@'%';
FLUSH PRIVILEGES;

-- 插入一些初始数据（可选）
-- 注意：这些数据会在 Drizzle 迁移之后插入，所以表结构应该已经存在

-- 示例小区数据
-- INSERT INTO addresses (name, type, parent_id, created_at, updated_at) VALUES
-- ('阳光花园小区', 'community', NULL, NOW(), NOW()),
-- ('梧桐苑小区', 'community', NULL, NOW(), NOW());

-- 示例栋数据
-- INSERT INTO addresses (name, type, parent_id, created_at, updated_at) VALUES
-- ('1号楼', 'building', 1, NOW(), NOW()),
-- ('2号楼', 'building', 1, NOW(), NOW()),
-- ('A栋', 'building', 2, NOW(), NOW());

-- 示例楼层数据
-- INSERT INTO addresses (name, type, parent_id, created_at, updated_at) VALUES
-- ('1楼', 'floor', 3, NOW(), NOW()),
-- ('2楼', 'floor', 3, NOW(), NOW()),
-- ('3楼', 'floor', 3, NOW(), NOW());

-- 示例房间数据
-- INSERT INTO addresses (name, type, parent_id, created_at, updated_at) VALUES
-- ('101', 'room', 6, NOW(), NOW()),
-- ('102', 'room', 6, NOW(), NOW()),
-- ('201', 'room', 7, NOW(), NOW()),
-- ('202', 'room', 7, NOW(), NOW());

-- 示例住户数据
-- INSERT INTO residents (name, phone, id_card, address_id, type, move_in_date, created_at, updated_at) VALUES
-- ('张三', '13800138001', '110101199001011234', 9, 'owner', '2023-01-15', NOW(), NOW()),
-- ('李四', '13800138002', '110101199002022345', 10, 'tenant', '2023-02-20', NOW(), NOW()),
-- ('王五', '13800138003', '110101199003033456', 11, 'owner', '2023-03-10', NOW(), NOW());

-- 示例费用数据
-- INSERT INTO expenses (address_id, resident_id, type, amount, billing_date, due_date, status, created_at, updated_at) VALUES
-- (9, 1, 'water', 45.50, '2024-01-01', '2024-01-31', 'paid', NOW(), NOW()),
-- (9, 1, 'electricity', 120.30, '2024-01-01', '2024-01-31', 'unpaid', NOW(), NOW()),
-- (10, 2, 'property', 200.00, '2024-01-01', '2024-01-31', 'unpaid', NOW(), NOW()),
-- (11, 3, 'gas', 35.80, '2024-01-01', '2024-01-31', 'paid', NOW(), NOW());

SELECT 'Database initialization completed!' as message;