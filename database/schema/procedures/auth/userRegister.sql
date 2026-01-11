SET NAMES utf8mb4;

USE bookmanage;

DROP PROCEDURE IF EXISTS userRegister;

DELIMITER /
/

CREATE PROCEDURE IF NOT EXISTS userRegister(
    IN p_uid VARCHAR(50),
    IN p_name VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_identity_type INT,
    IN p_student_id VARCHAR(50),
    IN p_employee_id VARCHAR(50),
    IN p_password_hash VARCHAR(255),
    IN p_registration_date DATE,
    OUT p_result_code INT,
    OUT p_result_message VARCHAR(255)
)
BEGIN
    DECLARE v_student_name VARCHAR(100) DEFAULT NULL;
    DECLARE v_student_uid VARCHAR(50) DEFAULT NULL;
    DECLARE v_student_sid VARCHAR(50) DEFAULT NULL;
    
    -- 声明异常处理
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        ROLLBACK;
        SET p_result_code = -1;
        SET p_result_message = CONCAT('系统错误：', COALESCE(@text, '注册失败'));
    END;
    
    -- 初始化返回值
    SET p_result_code = 0;
    SET p_result_message = '';
    
    -- 开始事务
    START TRANSACTION;
    
    -- 检查用户ID是否已存在
    IF EXISTS (SELECT 1 FROM borrowers WHERE uid = p_uid) THEN
        SET p_result_code = 1;
        SET p_result_message = '该用户ID已被注册';
        ROLLBACK;
    -- 检查手机号是否已存在
    ELSEIF EXISTS (SELECT 1 FROM borrowers WHERE phone = p_phone) THEN
        SET p_result_code = 2;
        SET p_result_message = '该手机号已被注册';
        ROLLBACK;
    -- 检查身份类型是否存在
    ELSEIF NOT EXISTS (SELECT 1 FROM user_types WHERE type_id = p_identity_type) THEN
        SET p_result_code = 3;
        SET p_result_message = '身份类型不存在';
        ROLLBACK;
    -- 如果是学生注册，验证学生信息
    ELSEIF p_identity_type = 1 THEN
        -- 先检查学号是否存在
        IF NOT EXISTS (SELECT 1 FROM students WHERE student_id = p_student_id) THEN
            SET p_result_code = 4;
            SET p_result_message = '学号不存在于学生名单中';
            ROLLBACK;
        ELSE
            -- 获取学生信息
            SELECT id, name, student_id INTO v_student_uid, v_student_name, v_student_sid
            FROM students 
            WHERE student_id = p_student_id
            LIMIT 1;
            
            -- 验证用户ID是否匹配
            IF v_student_uid != p_uid THEN
                SET p_result_code = 5;
                SET p_result_message = '用户ID与学生信息不匹配';
                ROLLBACK;
            -- 验证姓名是否匹配
            ELSEIF v_student_name != p_name THEN
                SET p_result_code = 6;
                SET p_result_message = '姓名与学生信息不匹配';
                ROLLBACK;
            ELSE
                -- 学生验证通过，插入用户信息
                INSERT INTO borrowers (
                    uid, name, phone, identity_type, student_id, employee_id,
                    borrowed_count, registration_date, borrowing_status
                ) VALUES (
                    p_uid, p_name, p_phone, p_identity_type, p_student_id, p_employee_id,
                    0, p_registration_date, 'active'
                );
                
                -- 插入用户认证信息
                INSERT INTO user_auth (user_id, password_hash) 
                VALUES (p_uid, SHA2(p_password_hash, 256));
                
                -- 提交事务
                COMMIT;
                SET p_result_code = 0;
                SET p_result_message = '注册成功';
            END IF;
        END IF;
    ELSE
        -- 非学生注册（教师、校外人员）
        INSERT INTO borrowers (
            uid, name, phone, identity_type, student_id, employee_id,
            borrowed_count, registration_date, borrowing_status
        ) VALUES (
            p_uid, p_name, p_phone, p_identity_type, p_student_id, p_employee_id,
            0, p_registration_date, 'active'
        );
        
        -- 插入用户认证信息
        INSERT INTO user_auth (user_id, password_hash) 
        VALUES (p_uid, SHA2(p_password_hash, 256));
        
        -- 提交事务
        COMMIT;
        SET p_result_code = 0;
        SET p_result_message = '注册成功';
    END IF;
END
/
/

DELIMITER;