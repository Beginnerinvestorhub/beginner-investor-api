#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create schema
    CREATE SCHEMA IF NOT EXISTS app;
    
    -- Set default privileges
    ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL PRIVILEGES ON TABLES TO $POSTGRES_USER;
    ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL PRIVILEGES ON SEQUENCES TO $POSTGRES_USER;
    
    -- Create tables
    CREATE TABLE IF NOT EXISTS app.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        hashed_password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_superuser BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS app.api_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
        key_hash VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP WITH TIME ZONE
    );
    
    CREATE TABLE IF NOT EXISTS app.audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES app.users(id) ON DELETE SET NULL,
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50),
        resource_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON app.audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON app.audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON app.audit_logs(action);
    
    -- Create functions
    CREATE OR REPLACE FUNCTION app.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create triggers
    DROP TRIGGER IF EXISTS update_users_updated_at ON app.users;
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW EXECUTE FUNCTION app.update_updated_at_column();
    
    -- Create default admin user if it doesn't exist
    INSERT INTO app.users (email, hashed_password, full_name, is_superuser)
    VALUES (
        'admin@example.com',
        -- Password: admin123
        '\$2b\$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
        'Admin User',
        true
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Create read-only user for monitoring
    CREATE USER ${PGADMIN_READONLY_USER:-readonly} WITH PASSWORD '${PGADMIN_READONLY_PASSWORD:-readonly}';
    GRANT CONNECT ON DATABASE ${POSTGRES_DB:-python_engine} TO ${PGADMIN_READONLY_USER:-readonly};
    GRANT USAGE ON SCHEMA app TO ${PGADMIN_READONLY_USER:-readonly};
    GRANT SELECT ON ALL TABLES IN SCHEMA app TO ${PGADMIN_READONLY_USER:-readonly};
    ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT ON TABLES TO ${PGADMIN_READONLY_USER:-readonly};
EOSQL

echo "Database initialization complete!"
