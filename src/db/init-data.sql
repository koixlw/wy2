-- 物业管理系统初始化数据
-- 清空现有数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE expenses;
TRUNCATE TABLE residents;
TRUNCATE TABLE addresses;
SET FOREIGN_KEY_CHECKS = 1;

-- 插入地址数据 - 树形结构：小区 -> 栋 -> 楼层 -> 房间

-- 小区级别
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(1, '阳光花园小区', 'community', NULL, 'YG001', '高档住宅小区，环境优美', NULL, 1, NOW(), NOW()),
(2, '绿城家园', 'community', NULL, 'LC001', '经济适用房小区', NULL, 1, NOW(), NOW());

-- 栋级别 - 阳光花园小区
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(3, '1栋', 'building', 1, 'YG001-1', '阳光花园1栋，共18层', NULL, 1, NOW(), NOW()),
(4, '2栋', 'building', 1, 'YG001-2', '阳光花园2栋，共18层', NULL, 1, NOW(), NOW());

-- 栋级别 - 绿城家园
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(5, 'A栋', 'building', 2, 'LC001-A', '绿城家园A栋，共12层', NULL, 1, NOW(), NOW());

-- 楼层级别 - 阳光花园1栋
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(6, '1楼', 'floor', 3, 'YG001-1-01', '阳光花园1栋1楼', NULL, 1, NOW(), NOW()),
(7, '2楼', 'floor', 3, 'YG001-1-02', '阳光花园1栋2楼', NULL, 1, NOW(), NOW()),
(8, '3楼', 'floor', 3, 'YG001-1-03', '阳光花园1栋3楼', NULL, 1, NOW(), NOW());

-- 楼层级别 - 绿城家园A栋
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(9, '1楼', 'floor', 5, 'LC001-A-01', '绿城家园A栋1楼', NULL, 1, NOW(), NOW()),
(10, '2楼', 'floor', 5, 'LC001-A-02', '绿城家园A栋2楼', NULL, 1, NOW(), NOW());

-- 房间级别 - 阳光花园1栋1楼
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(11, '101室', 'room', 6, '101', '三室两厅两卫', 120.50, 1, NOW(), NOW()),
(12, '102室', 'room', 6, '102', '两室一厅一卫', 85.30, 1, NOW(), NOW());

-- 房间级别 - 阳光花园1栋2楼
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(13, '201室', 'room', 7, '201', '三室两厅两卫', 120.50, 1, NOW(), NOW()),
(14, '202室', 'room', 7, '202', '两室一厅一卫', 85.30, 1, NOW(), NOW());

-- 房间级别 - 阳光花园1栋3楼
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(15, '301室', 'room', 8, '301', '三室两厅两卫', 120.50, 1, NOW(), NOW()),
(16, '302室', 'room', 8, '302', '两室一厅一卫', 85.30, 1, NOW(), NOW());

-- 房间级别 - 绿城家园A栋1楼
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(17, '101室', 'room', 9, 'A101', '两室一厅一卫', 75.20, 1, NOW(), NOW()),
(18, '102室', 'room', 9, 'A102', '一室一厅一卫', 55.80, 1, NOW(), NOW());

-- 房间级别 - 绿城家园A栋2楼
INSERT INTO addresses (id, name, type, parent_id, code, description, area, is_active, created_at, updated_at) VALUES
(19, '201室', 'room', 10, 'A201', '两室一厅一卫', 75.20, 1, NOW(), NOW()),
(20, '202室', 'room', 10, 'A202', '一室一厅一卫', 55.80, 1, NOW(), NOW());

-- 插入住户数据
INSERT INTO residents (id, name, phone, id_card, address_id, resident_type, move_in_date, move_out_date, is_active, created_at, updated_at) VALUES
(1, '张三', '13800138001', '110101199001011234', 11, 'owner', '2024-01-15 00:00:00', NULL, 1, NOW(), NOW()),
(2, '李四', '13800138002', '110101199002021234', 12, 'tenant', '2024-02-01 00:00:00', NULL, 1, NOW(), NOW()),
(3, '王五', '13800138003', '110101199003031234', 13, 'owner', '2024-01-20 00:00:00', NULL, 1, NOW(), NOW()),
(4, '赵六', '13800138004', '110101199004041234', 17, 'owner', '2024-03-01 00:00:00', NULL, 1, NOW(), NOW()),
(5, '孙七', '13800138005', '110101199005051234', 18, 'tenant', '2024-03-15 00:00:00', NULL, 1, NOW(), NOW()),
(6, '周八', '13800138006', '110101199006061234', 15, 'owner', '2024-02-10 00:00:00', NULL, 1, NOW(), NOW());

-- 插入费用数据
-- 2024年1月费用
INSERT INTO expenses (id, address_id, resident_id, expense_type, amount, period, `usage`, unit_price, status, due_date, paid_date, description, created_at, updated_at) VALUES
(1, 11, 1, 'water', 45.60, '2024-01', 15.200, 3.0000, 'paid', '2024-02-15 00:00:00', '2024-02-10 00:00:00', '1月份水费', NOW(), NOW()),
(2, 11, 1, 'electricity', 128.40, '2024-01', 214.000, 0.6000, 'paid', '2024-02-15 00:00:00', '2024-02-10 00:00:00', '1月份电费', NOW(), NOW()),
(3, 11, 1, 'property', 241.00, '2024-01', NULL, 2.0000, 'paid', '2024-02-15 00:00:00', '2024-02-08 00:00:00', '1月份物业费，按面积120.5平米计算', NOW(), NOW());

-- 2024年2月费用
INSERT INTO expenses (id, address_id, resident_id, expense_type, amount, period, `usage`, unit_price, status, due_date, paid_date, description, created_at, updated_at) VALUES
(4, 12, 2, 'water', 32.10, '2024-02', 10.700, 3.0000, 'unpaid', '2024-03-15 00:00:00', NULL, '2月份水费', NOW(), NOW()),
(5, 12, 2, 'electricity', 96.60, '2024-02', 161.000, 0.6000, 'unpaid', '2024-03-15 00:00:00', NULL, '2月份电费', NOW(), NOW()),
(6, 13, 3, 'gas', 68.50, '2024-02', 25.000, 2.7400, 'paid', '2024-03-15 00:00:00', '2024-03-05 00:00:00', '2月份燃气费', NOW(), NOW()),
(7, 17, 4, 'property', 150.40, '2024-03', NULL, 2.0000, 'unpaid', '2024-04-15 00:00:00', NULL, '3月份物业费，按面积75.2平米计算', NOW(), NOW()),
(8, 18, 5, 'parking', 200.00, '2024-03', NULL, NULL, 'unpaid', '2024-04-15 00:00:00', NULL, '3月份停车费', NOW(), NOW()),
(9, 15, 6, 'water', 51.90, '2024-03', 17.300, 3.0000, 'overdue', '2024-04-15 00:00:00', NULL, '3月份水费，已逾期', NOW(), NOW()),
(10, 15, 6, 'electricity', 156.00, '2024-03', 260.000, 0.6000, 'overdue', '2024-04-15 00:00:00', NULL, '3月份电费，已逾期', NOW(), NOW());

-- 重置自增ID
ALTER TABLE addresses AUTO_INCREMENT = 21;
ALTER TABLE residents AUTO_INCREMENT = 7;
ALTER TABLE expenses AUTO_INCREMENT = 11;

-- 查询验证数据
SELECT '地址数据统计' as info, COUNT(*) as count FROM addresses;
SELECT '住户数据统计' as info, COUNT(*) as count FROM residents;
SELECT '费用数据统计' as info, COUNT(*) as count FROM expenses;

SELECT '初始化数据导入完成！' as message;