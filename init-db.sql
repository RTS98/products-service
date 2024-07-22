SELECT 'CREATE DATABASE products'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'products')\gexec