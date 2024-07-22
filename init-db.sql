SELECT 'CREATE DATABASE products'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'products')\gexec

CREATE TABLE IF NOT EXISTS idempotency_key (
    id integer PRIMARY KEY,
    "value" varchar(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS product (
    id integer PRIMARY KEY,
    title varchar(50) NOT NULL,
    price integer NOT NULL,
    quantity integer NOT NULL,
    "description" TEXT NOT NULL,
    idempotency_key_id integer NOT NULL,
    CONSTRAINT fk_idempotency_key 
        FOREIGN KEY(idempotency_key_id) 
            REFERENCES idempotency_key(id)
            ON DELETE CASCADE
);
