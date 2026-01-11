SET NAMES utf8mb4;

USE bookmanage;

DROP PROCEDURE IF EXISTS searchBooksByPublisher;

DELIMITER / /

CREATE PROCEDURE IF NOT EXISTS searchBooksByPublisher(
    IN p_publisher_name VARCHAR(100)
)
BEGIN
    -- 按出版社名搜索图书
    SELECT 
        b.book_id,
        b.title,
        b.isbn,
        p.publisher_name,
        b.publication_year,
        b.current_stock AS available_stock,
        b.total_stock,
        GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') AS author_names
    FROM books b
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    WHERE p.publisher_name LIKE CONCAT('%', p_publisher_name, '%')
    GROUP BY b.book_id
    ORDER BY b.title;
END//

DELIMITER;