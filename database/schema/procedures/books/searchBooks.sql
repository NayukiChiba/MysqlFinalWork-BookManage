SET NAMES utf8mb4;

USE bookmanage;

DROP PROCEDURE IF EXISTS searchBooks;

DELIMITER / /

CREATE PROCEDURE searchBooks(
    IN p_query VARCHAR(255)
)
BEGIN
    -- 搜索图书（按书名、ISBN、作者名）
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
    WHERE b.title LIKE CONCAT('%', p_query, '%') 
       OR b.isbn LIKE CONCAT('%', p_query, '%') 
       OR a.author_name LIKE CONCAT('%', p_query, '%')
    GROUP BY b.book_id
    ORDER BY b.title;
END//

DELIMITER;