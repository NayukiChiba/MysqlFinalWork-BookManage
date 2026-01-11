const { getConnection } = require('../config/database');

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
        // 这里可以添加管理员管理功能
        // 例如：添加管理员、删除管理员、修改管理员权限等
        res.status(500).json({ error: 'Admin management feature not implemented' });
    } catch (error) {
        console.error('Failed to manage admin:', error);
        res.status(500).json({ error: 'Failed to manage admin' });
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
