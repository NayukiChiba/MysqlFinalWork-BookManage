const { getConnection } = require('../config/database');
const jwt = require('jsonwebtoken');

// 从请求头获取用户信息
const getUserFromToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        } catch (e) {
            return null;
        }
    }
    return null;
};

// 获取所有用户
const getAllUsers = async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT b.uid, b.name, b.phone, b.identity_type, b.student_id, 
                   b.employee_id, b.registration_date, b.borrowing_status, b.borrowed_count,
                   ut.type_name, ua.is_admin
            FROM borrowers b
            LEFT JOIN user_types ut ON b.identity_type = ut.type_id
            LEFT JOIN user_auth ua ON b.uid = ua.user_id
            ORDER BY b.registration_date DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Failed to get users:', error);
        res.status(500).json({ success: false, error: 'Failed to get users' });
    }
};

// 获取所有借阅记录
const getAllBorrowingRecords = async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT br.*, b.title as book_title, bo.name as borrower_name, bo.identity_type
            FROM borrowing_records br
            JOIN books b ON br.book_id = b.book_id
            JOIN borrowers bo ON br.borrower_id = bo.uid
            ORDER BY br.borrow_date DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Failed to get borrowing records:', error);
        res.status(500).json({ success: false, error: 'Failed to get borrowing records' });
    }
};

// 获取所有罚款记录
const getAllFineRecords = async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT fr.*, b.title as book_title, bo.name as borrower_name, bo.identity_type
            FROM fine_records fr
            JOIN books b ON fr.book_id = b.book_id
            JOIN borrowers bo ON fr.borrower_id = bo.uid
            ORDER BY fr.borrow_date DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Failed to get fine records:', error);
        res.status(500).json({ success: false, error: 'Failed to get fine records' });
    }
};

// 获取用户登录日志
const getUserLoginLogs = async (req, res) => {
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(`
            SELECT ll.*, bo.name as user_name, bo.identity_type
            FROM login_logs ll
            JOIN borrowers bo ON ll.user_id = bo.uid
            ORDER BY ll.login_time DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Failed to get login logs:', error);
        res.status(500).json({ success: false, error: 'Failed to get login logs' });
    }
};

// 管理用户
const manageUser = async (req, res) => {
    try {
        const { uid, action } = req.body; // action: 'activate', 'suspend', 'delete'
        const connection = await getConnection();
        
        switch (action) {
            case 'activate':
                await connection.execute(
                    'UPDATE borrowers SET borrowing_status = "active" WHERE uid = ?',
                    [uid]
                );
                res.json({ success: true, message: 'User activated' });
                break;
                
            case 'suspend':
                await connection.execute(
                    'UPDATE borrowers SET borrowing_status = "suspended" WHERE uid = ?',
                    [uid]
                );
                res.json({ success: true, message: 'User suspended' });
                break;
                
            case 'delete':
                // 开始事务
                const conn = await connection.getConnection();
                
                try {
                    // 删除用户认证信息
                    await conn.beginTransaction();

                    // 删除用户借阅记录
                    await conn.execute(
                        'DELETE FROM user_auth WHERE user_id = ?',
                        [uid]
                    );

                    // 删除用户借阅记录
                    await conn.execute(
                        'DELETE FROM borrowing_records WHERE borrower_id = ?',
                        [uid]
                    );

                    // 删除用户罚款记录
                    await conn.execute(
                        'DELETE FROM fine_records WHERE borrower_id = ?',
                        [uid]
                    );

                    // 删除用户登录日志
                    await conn.execute(
                        'DELETE FROM login_logs WHERE user_id = ?',
                        [uid]
                    );

                    // 删除用户
                    await conn.execute(
                        'DELETE FROM borrowers WHERE uid = ?',
                        [uid]
                    );

                    // 提交事务
                    await conn.commit();
                    res.json({ message: 'User deleted' });
                } catch (error) {
                    // 回滚事务
                    await conn.rollback();
                    throw error;
                } finally {
                    // Release connection
                    conn.release();
                }
                break;
                
            default:
                res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Failed to manage user:', error);
        res.status(500).json({ error: 'Failed to manage user' });
    }
};

// 管理管理员
const manageAdmin = async (req, res) => {
    try {
        // 验证当前操作者是否为超级管理员
        const currentUser = getUserFromToken(req);
        if (!currentUser) {
            return res.status(401).json({ success: false, error: '请先登录' });
        }
        
        // 检查操作者的权限
        if (currentUser.identity_type < 5) {
            return res.status(403).json({ success: false, error: '只有超级管理员可以管理管理员权限' });
        }
        
        const { uid, action } = req.body; // action: 'promote', 'demote'
        const connection = await getConnection();
        
        // 检查目标用户是否存在
        const [userCheck] = await connection.execute(
            'SELECT identity_type FROM borrowers WHERE uid = ?',
            [uid]
        );
        
        if (userCheck.length === 0) {
            return res.status(404).json({ success: false, error: '用户不存在' });
        }
        
        const currentType = userCheck[0].identity_type;
        
        switch (action) {
            case 'promote':
                // 提升为管理员 (identity_type = 4)
                if (currentType >= 3) {
                    return res.status(400).json({ success: false, error: '该用户已经是管理员' });
                }
                // 更新 borrowers 表的 identity_type
                await connection.execute(
                    'UPDATE borrowers SET identity_type = 4 WHERE uid = ?',
                    [uid]
                );
                // 更新 user_auth 表的 is_admin
                await connection.execute(
                    'UPDATE user_auth SET is_admin = 1 WHERE user_id = ?',
                    [uid]
                );
                res.json({ success: true, message: '已提升为管理员' });
                break;
                
            case 'demote':
                // 取消管理员权限，根据用户信息恢复原始身份
                if (currentType < 3) {
                    return res.status(400).json({ success: false, error: '该用户不是管理员' });
                }
                if (currentType >= 5) {
                    return res.status(400).json({ success: false, error: '无法取消超级管理员权限' });
                }
                
                // 查询用户的student_id和employee_id来判断原始身份
                const [userInfo] = await connection.execute(
                    'SELECT student_id, employee_id FROM borrowers WHERE uid = ?',
                    [uid]
                );
                
                // 根据是否有employee_id判断是教师还是学生
                // 教师 = 2, 学生 = 1
                const originalType = userInfo[0].employee_id ? 2 : 1;
                
                // 更新 borrowers 表的 identity_type
                await connection.execute(
                    'UPDATE borrowers SET identity_type = ? WHERE uid = ?',
                    [originalType, uid]
                );
                // 更新 user_auth 表的 is_admin
                await connection.execute(
                    'UPDATE user_auth SET is_admin = 0 WHERE user_id = ?',
                    [uid]
                );
                res.json({ success: true, message: `已取消管理员权限，恢复为${originalType === 2 ? '教师' : '学生'}` });
                break;
                
            default:
                res.status(400).json({ success: false, error: '无效的操作' });
        }
    } catch (error) {
        console.error('Failed to manage admin:', error);
        res.status(500).json({ success: false, error: '管理员操作失败' });
    }
};

module.exports = {
    getAllUsers,
    getAllBorrowingRecords,
    getAllFineRecords,
    getUserLoginLogs,
    manageUser,
    manageAdmin
};
