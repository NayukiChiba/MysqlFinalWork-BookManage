USE bookmanage;

DROP TABLE IF EXISTS user_types;

CREATE TABLE IF NOT EXISTS user_types (
    type_id INT PRIMARY KEY,
    type_name VARCHAR(255) NOT NULL UNIQUE,
    max_borrow_count INT NOT NULL DEFAULT 0,
    max_borrow_days INT NOT NULL DEFAULT 0
);

-- 使用明确的type_id，确保ID映射一致
INSERT IGNORE INTO
    user_types (
        type_id,
        type_name,
        max_borrow_count,
        max_borrow_days
    )
VALUES (1, '学生', 5, 30),
    (2, '教师', 10, 60),
    (3, '校外人员', 3, 15),
    (4, '管理员', 20, 90),
    (5, '超级管理员', 50, 180);