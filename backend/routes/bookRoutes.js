const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const borrowController = require('../controllers/borrowController');

// 获取所有图书
router.get('/', bookController.getAllBooks);

// 借书和还书 - 需要放在 /:id 之前
router.post('/borrow', borrowController.borrowBook);
router.post('/return', borrowController.returnBook);

// 搜索图书 - 放在 /:id 之前，避免被匹配
router.get('/search/:query', bookController.searchBooks);
router.get('/search/name/:query', bookController.searchBooks);
router.get('/search/author/:query', bookController.searchBooks);
router.get('/search/tag/:query', bookController.searchBooks);
router.get('/search/publisher/:query', bookController.searchBooks);
router.get('/search/isbn/:query', bookController.searchBooks);

// 根据ID获取图书
router.get('/:id', bookController.getBookById);

// 添加新图书
router.post('/', bookController.addBook);

// 更新图书信息
router.put('/:id', bookController.updateBook);

// 删除图书
router.delete('/:id', bookController.deleteBook);

module.exports = router;
