-- Base de données pour la Couveuse Intelligente
-- Création des tables principales

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des espèces
CREATE TABLE IF NOT EXISTS species (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    incubation_days INTEGER NOT NULL,
    optimal_temperature DECIMAL(4,2) DEFAULT 37.5,
    optimal_humidity DECIMAL(4,2) DEFAULT 60.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des couvées
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    species_id INTEGER REFERENCES species(id),
    initial_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    start_date DATE NOT NULL,
    expected_hatch_date DATE NOT NULL,
    actual_hatch_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'attention', 'critical')),
    mirage_performed BOOLEAN DEFAULT FALSE,
    mirage_date DATE,
    mirage_fertile_count INTEGER,
    success_rate DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paramètres environnementaux (historique)
CREATE TABLE IF NOT EXISTS environmental_data (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL(4,2) NOT NULL,
    humidity DECIMAL(4,2) NOT NULL,
    co2_level DECIMAL(6,2) NOT NULL,
    battery_level DECIMAL(4,2),
    wifi_strength DECIMAL(4,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des alertes
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('warning', 'critical', 'emergency')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    value DECIMAL(10,2),
    threshold DECIMAL(10,2),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by INTEGER REFERENCES users(id),
    acknowledged_at TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des retournements d'œufs
CREATE TABLE IF NOT EXISTS egg_rotations (
    id SERIAL PRIMARY KEY,
    performed_by INTEGER REFERENCES users(id),
    rotation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batch_ids INTEGER[], -- Array des IDs de couvées concernées
    notes TEXT
);

-- Table des mirages
CREATE TABLE IF NOT EXISTS candling_records (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id) ON DELETE CASCADE,
    performed_by INTEGER REFERENCES users(id),
    candling_date DATE NOT NULL,
    day_of_incubation INTEGER NOT NULL,
    fertile_eggs INTEGER NOT NULL,
    infertile_eggs INTEGER NOT NULL,
    dead_embryos INTEGER DEFAULT 0,
    notes TEXT,
    images TEXT[], -- URLs des photos de mirage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de configuration système
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    parameter_name VARCHAR(100) UNIQUE NOT NULL,
    parameter_value TEXT NOT NULL,
    parameter_type VARCHAR(20) DEFAULT 'string' CHECK (parameter_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'activité
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_environmental_data_recorded_at ON environmental_data(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_start_time ON alerts(start_time);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
