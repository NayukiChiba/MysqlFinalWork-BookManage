-- 插入超级管理员数据
-- 此脚本依赖于外部变量 @super_admin_name 和 @super_admin_password

USE bookmanage;

-- 确保超级管理员用户存在 (使用预设ID 'SA001')
-- 身份类型 5 对应 '超级管理员'
INSERT IGNORE INTO
    borrowers (
        uid,
        name,
        phone,
        identity_type,
        student_id,
        employee_id,
        borrowed_count,
        registration_date,
        borrowing_status
    )
VALUES (
        'SA001',
        @super_admin_name,
        @super_admin_phone,
        5,
        NULL,
        'SA001',
        0,
        CURRENT_DATE(),
        'active'
    );

-- 更新密码 (如果用户已存在但需要更新密码，或者新插入)
-- 先删除旧认证信息确保 cleanly update
DELETE FROM user_auth WHERE user_id = 'SA001';

-- 插入新认证信息
INSERT INTO
    user_auth (
        user_id,
        password_hash,
        is_admin
    )
VALUES (
        'SA001',
        SHA2(@super_admin_password, 256),
        1
    );

SELECT 'Super admin created/updated successfully' as result;