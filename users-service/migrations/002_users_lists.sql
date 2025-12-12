CREATE TABLE IF NOT EXISTS favorites (
                                         user_id INT NOT NULL,
                                         book_id INT NOT NULL,
                                         created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
    );

CREATE TABLE IF NOT EXISTS read_items (
                                          user_id INT NOT NULL,
                                          book_id INT NOT NULL,
                                          created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
    );
