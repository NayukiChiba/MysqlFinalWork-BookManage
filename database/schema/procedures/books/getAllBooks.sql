SET NAMES utf8mb4;

USE bookmanage;

DROP PROCEDURE IF EXISTS getAllBooks;

DELIMITER / /

CREATE PROCEDURE IF NOT EXISTS getAllBooks()
BEGIN
    -- 查询所有图书，包含作者和出版社信息
    SELECT 
        b.book_id, 
        b.title, 
        b.isbn, 
        b.publication_year,
        b.total_stock,
        b.current_stock as available_stock,
        b.location,
        p.publisher_name,
        GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') as author_names
    FROM books b
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    GROUP BY b.book_id
    ORDER BY b.book_id;
END//

DELIMITER;