CREATE TABLE IF NOT EXISTS reviews (
                                       id SERIAL PRIMARY KEY,
                                       user_id INT NOT NULL,
                                       book_id INT NOT NULL,
                                       rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
    );
