const { getConnection } = require('../config/database');

// Get all books
const getAllBooks = async (req, res) => {
    try {
        const connection = await getConnection();
        
        // 调用存储过程获取所有书籍
        const [rows] = await connection.execute('CALL getAllBooks()');
        
        res.json({ success: true, data: rows[0] || [] });
    } catch (error) {
        console.error('Failed to get book list:', error);
        res.status(500).json({ success: false, error: 'Failed to get book list' });
    }
};

// Get book by ID
const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        // Call stored procedure to get book by ID
        await connection.execute('CALL getBookById(?, @result_code, @result_message)', [id]);
        const [result] = await connection.execute('SELECT @result_code as result_code, @result_message as result_message');
        
        if (result[0].result_code === 1) {
            return res.status(404).json({ error: result[0].result_message });
        } else if (result[0].result_code !== 0) {
            return res.status(500).json({ error: result[0].result_message });
        }
        
        // Get actual query results
        const [rows] = await connection.execute('SELECT * FROM books WHERE book_id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Failed to get book:', error);
        res.status(500).json({ error: 'Failed to get book' });
    }
};

// Add new book
const addBook = async (req, res) => {
    try {
        const { book_id, title, isbn, publisher_id, publication_year, total_stock, current_stock, location } = req.body;
        const connection = await getConnection();
        
        // Call stored procedure to add book
        await connection.execute(
            'CALL addBook(?, ?, ?, ?, ?, ?, ?, @result_code, @result_message)',
            [book_id, title, isbn, publisher_id, publication_year, total_stock, location]
        );
        const [result] = await connection.execute('SELECT @result_code as result_code, @result_message as result_message');
        
        if (result[0].result_code === 1) {
            return res.status(400).json({ error: result[0].result_message });
        } else if (result[0].result_code !== 0) {
            return res.status(500).json({ error: result[0].result_message });
        }
        
        res.status(201).json({ message: result[0].result_message });
    } catch (error) {
        console.error('Failed to add book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
};

// Update book information
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, isbn, publisher_id, publication_year, total_stock, current_stock, location } = req.body;
        const connection = await getConnection();
        
        // Call stored procedure to update book information
        await connection.execute(
            'CALL updateBook(?, ?, ?, ?, ?, ?, ?, ?, @result_code, @result_message)',
            [id, title, isbn, publisher_id, publication_year, total_stock, current_stock, location]
        );
        const [result] = await connection.execute('SELECT @result_code as result_code, @result_message as result_message');
        
        if (result[0].result_code === 1) {
            return res.status(404).json({ error: result[0].result_message });
        } else if (result[0].result_code !== 0) {
            return res.status(500).json({ error: result[0].result_message });
        }
        
        res.json({ message: result[0].result_message, affectedRows: 1 });
    } catch (error) {
        console.error('Failed to update book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
};

// Delete book
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        
        // Call stored procedure to delete book
        await connection.execute('CALL deleteBook(?, @result_code, @result_message)', [id]);
        const [result] = await connection.execute('SELECT @result_code as result_code, @result_message as result_message');
        
        if (result[0].result_code === 1) {
            return res.status(404).json({ error: result[0].result_message });
        } else if (result[0].result_code !== 0) {
            return res.status(500).json({ error: result[0].result_message });
        }
        
        res.json({ message: result[0].result_message, affectedRows: 1 });
    } catch (error) {
        console.error('Failed to delete book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
};

// Search books
const searchBooks = async (req, res) => {
    try {
        const { query } = req.params;
        const connection = await getConnection();
        
        // 直接调用存储过程搜索
        const [rows] = await connection.execute('CALL searchBooks(?)', [query]);
        
        res.json({ success: true, data: rows[0] || [] });
    } catch (error) {
        console.error('Failed to search books:', error);
        res.status(500).json({ success: false, error: 'Failed to search books' });
    }
};

// Search books by tag
const searchByTag = async (req, res) => {
    try {
        const { query } = req.params;
        const connection = await getConnection();
        
        const [rows] = await connection.execute('CALL searchBooksByTag(?)', [query]);
        
        res.json({ success: true, data: rows[0] || [] });
    } catch (error) {
        console.error('Failed to search books by tag:', error);
        res.status(500).json({ success: false, error: 'Failed to search books by tag' });
    }
};

// Search books by publisher
const searchByPublisher = async (req, res) => {
    try {
        const { query } = req.params;
        const connection = await getConnection();
        
        const [rows] = await connection.execute('CALL searchBooksByPublisher(?)', [query]);
        
        res.json({ success: true, data: rows[0] || [] });
    } catch (error) {
        console.error('Failed to search books by publisher:', error);
        res.status(500).json({ success: false, error: 'Failed to search books by publisher' });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    searchBooks,
    searchByTag,
    searchByPublisher
};
