CREATE TABLE IF NOT EXISTS books (
                                     id SERIAL PRIMARY KEY,
                                     title TEXT NOT NULL,
                                     author TEXT NOT NULL,
                                     description TEXT DEFAULT '',
                                     created_at TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS categories (
                                          id SERIAL PRIMARY KEY,
                                          name TEXT NOT NULL UNIQUE
);

-- optional mapping later
