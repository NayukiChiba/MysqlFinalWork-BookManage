SET NAMES utf8mb4;

USE bookmanage;

DROP PROCEDURE IF EXISTS searchBooksByTag;

DELIMITER / /

CREATE PROCEDURE IF NOT EXISTS searchBooksByTag(
    IN p_tag_name VARCHAR(50)
)
BEGIN
    -- 按标签搜索图书
    SELECT 
        b.book_id,
        b.title,
        b.isbn,
        p.publisher_name,
        b.publication_year,
        b.current_stock AS available_stock,
        b.total_stock,
        GROUP_CONCAT(DISTINCT a.author_name SEPARATOR ', ') AS author_names,
        GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ', ') AS tags
    FROM books b
    LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
    LEFT JOIN book_authors ba ON b.book_id = ba.book_id
    LEFT JOIN authors a ON ba.author_id = a.author_id
    LEFT JOIN book_tags bt ON b.book_id = bt.book_id
    LEFT JOIN tags t ON bt.tag_id = t.tag_id
    WHERE t.tag_name LIKE CONCAT('%', p_tag_name, '%')
    GROUP BY b.book_id
    ORDER BY b.title;
END//

DELIMITER;