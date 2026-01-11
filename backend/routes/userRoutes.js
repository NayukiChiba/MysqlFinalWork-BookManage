const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 获取用户信息（从token中获取）
router.get('/info', userController.getUserInfo);

// 获取用户借阅记录（从token中获取）
router.get('/borrowing-records/current', userController.getCurrentBorrowingRecords);
router.get('/borrowing-records/all', userController.getAllUserBorrowingRecords);

// 获取用户罚款记录（从token中获取）
router.get('/fine-records', userController.getUserFineRecordsFromToken);

// 缴纳单个罚款
router.post('/fine-records/pay', userController.payFine);

// 缴纳所有罚款
router.post('/fine-records/pay-all', userController.payAllFines);

// 获取用户信息（通过ID）
router.get('/:id', userController.getUserById);

// 更新用户信息
router.put('/:id', userController.updateUser);

// 获取用户借阅记录（通过ID）
router.get('/:id/borrowing-records', userController.getUserBorrowingRecords);

// 获取用户罚款记录（通过ID）
router.get('/:id/fine-records', userController.getUserFineRecords);

module.exports = router;
