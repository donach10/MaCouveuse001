-- Vues et fonctions utiles pour la Couveuse Intelligente

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(b.id) as total_batches,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_batches,
    COUNT(CASE WHEN b.status = 'active' THEN 1 END) as active_batches,
    COALESCE(AVG(CASE WHEN b.status = 'completed' THEN b.success_rate END), 0) as average_success_rate,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.current_quantity END), 0) as total_hatched_eggs,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.initial_quantity END), 0) as total_eggs_incubated
FROM users u
LEFT JOIN batches b ON u.id = b.user_id
WHERE u.role = 'user'
GROUP BY u.id, u.name, u.email;

-- Vue pour les couvées actives avec détails
CREATE OR REPLACE VIEW active_batches_details AS
SELECT 
    b.id,
    b.user_id,
    u.name as user_name,
    s.name as species_name,
    s.incubation_days,
    b.initial_quantity,
    b.current_quantity,
    b.start_date,
    b.expected_hatch_date,
    b.status,
    b.health_status,
    b.mirage_performed,
    b.mirage_date,
    b.mirage_fertile_count,
    CURRENT_DATE - b.start_date + 1 as current_day,
    CASE 
        WHEN CURRENT_DATE >= b.expected_hatch_date THEN 'overdue'
        WHEN CURRENT_DATE >= b.expected_hatch_date - INTERVAL '2 days' THEN 'due_soon'
        ELSE 'in_progress'
    END as hatch_status
FROM batches b
JOIN users u ON b.user_id = u.id
JOIN species s ON b.species_id = s.id
WHERE b.status = 'active';

-- Vue pour les alertes actives
CREATE OR REPLACE VIEW active_alerts AS
SELECT 
    id,
    alert_type,
    severity,
    title,
    message,
    value,
    threshold,
    start_time,
    duration_minutes,
    acknowledged,
    acknowledged_by,
    CASE 
        WHEN acknowledged THEN 'acknowledged'
        WHEN severity = 'emergency' THEN 'critical'
        WHEN severity = 'critical' THEN 'urgent'
        ELSE 'normal'
    END as priority
FROM alerts
WHERE resolved = false
ORDER BY 
    CASE severity 
        WHEN 'emergency' THEN 1
        WHEN 'critical' THEN 2
        WHEN 'warning' THEN 3
    END,
    start_time DESC;

-- Vue pour les données environnementales récentes
CREATE OR REPLACE VIEW recent_environmental_data AS
SELECT 
    temperature,
    humidity,
    co2_level,
    battery_level,
    wifi_strength,
    recorded_at,
    CASE 
        WHEN temperature < 37.2 OR temperature > 37.8 THEN 'critical'
        WHEN temperature < 37.4 OR temperature > 37.6 THEN 'warning'
        ELSE 'normal'
    END as temperature_status,
    CASE 
        WHEN humidity < 50 OR humidity > 70 THEN 'critical'
        WHEN humidity < 55 OR humidity > 65 THEN 'warning'
        ELSE 'normal'
    END as humidity_status,
    CASE 
        WHEN co2_level > 600 THEN 'critical'
        WHEN co2_level > 500 THEN 'warning'
        ELSE 'normal'
    END as co2_status
FROM environmental_data
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
ORDER BY recorded_at DESC;

-- Fonction pour calculer la capacité utilisée
CREATE OR REPLACE FUNCTION get_current_capacity_usage()
RETURNS TABLE(
    total_capacity INTEGER,
    used_capacity INTEGER,
    available_capacity INTEGER,
    usage_percentage DECIMAL(5,2)
) AS $$
DECLARE
    total_cap INTEGER;
    used_cap INTEGER;
BEGIN
    -- Récupérer la capacité totale depuis la configuration
    SELECT parameter_value::INTEGER INTO total_cap
    FROM system_config 
    WHERE parameter_name = 'total_capacity';
    
    -- Calculer la capacité utilisée
    SELECT COALESCE(SUM(current_quantity), 0) INTO used_cap
    FROM batches 
    WHERE status = 'active';
    
    RETURN QUERY SELECT 
        total_cap,
        used_cap,
        total_cap - used_cap,
        ROUND((used_cap::DECIMAL / total_cap::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques de performance par espèce
CREATE OR REPLACE FUNCTION get_species_performance()
RETURNS TABLE(
    species_name VARCHAR(100),
    total_batches BIGINT,
    average_success_rate DECIMAL(5,2),
    average_fertility_rate DECIMAL(5,2),
    total_eggs_hatched BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.name,
        COUNT(b.id),
        COALESCE(AVG(b.success_rate), 0)::DECIMAL(5,2),
        COALESCE(AVG(
            CASE 
                WHEN b.mirage_performed AND b.initial_quantity > 0 
                THEN (b.mirage_fertile_count::DECIMAL / b.initial_quantity::DECIMAL) * 100
            END
        ), 0)::DECIMAL(5,2),
        COALESCE(SUM(
            CASE WHEN b.status = 'completed' THEN b.current_quantity ELSE 0 END
        ), 0)
    FROM species s
    LEFT JOIN batches b ON s.id = b.species_id
    GROUP BY s.id, s.name
    ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une alerte
CREATE OR REPLACE FUNCTION create_alert(
    p_alert_type VARCHAR(50),
    p_severity VARCHAR(20),
    p_title VARCHAR(255),
    p_message TEXT,
    p_value DECIMAL(10,2) DEFAULT NULL,
    p_threshold DECIMAL(10,2) DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    alert_id INTEGER;
BEGIN
    INSERT INTO alerts (
        alert_type, severity, title, message, value, threshold, start_time
    ) VALUES (
        p_alert_type, p_severity, p_title, p_message, p_value, p_threshold, NOW()
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour acquitter une alerte
CREATE OR REPLACE FUNCTION acknowledge_alert(
    p_alert_id INTEGER,
    p_user_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE alerts 
    SET 
        acknowledged = true,
        acknowledged_by = p_user_id,
        acknowledged_at = NOW()
    WHERE id = p_alert_id AND acknowledged = false;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour résoudre une alerte
CREATE OR REPLACE FUNCTION resolve_alert(p_alert_id INTEGER) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE alerts 
    SET 
        resolved = true,
        end_time = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
    WHERE id = p_alert_id AND resolved = false;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour enregistrer une rotation d'œufs
CREATE OR REPLACE FUNCTION log_egg_rotation(
    p_user_id INTEGER,
    p_batch_ids INTEGER[],
    p_notes TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    rotation_id INTEGER;
BEGIN
    INSERT INTO egg_rotations (performed_by, batch_ids, notes)
    VALUES (p_user_id, p_batch_ids, p_notes)
    RETURNING id INTO rotation_id;
    
    -- Log de l'activité
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (
        p_user_id, 
        'egg_rotation', 
        'rotation', 
        rotation_id,
        jsonb_build_object('batch_ids', p_batch_ids, 'notes', p_notes)
    );
    
    RETURN rotation_id;
END;
$$ LANGUAGE plpgsql;

-- Vue pour le tableau de bord administrateur
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'user' AND status = 'active') as active_users,
    (SELECT COUNT(*) FROM batches WHERE status = 'active') as active_batches,
    (SELECT used_capacity FROM get_current_capacity_usage()) as current_occupancy,
    (SELECT available_capacity FROM get_current_capacity_usage()) as remaining_capacity,
    (SELECT COUNT(*) FROM batches WHERE mirage_performed = true) as mirages_performed,
    (SELECT COUNT(*) FROM alerts WHERE resolved = false) as active_alerts,
    (SELECT COUNT(*) FROM alerts WHERE acknowledged = false AND resolved = false) as unacknowledged_alerts,
    (SELECT COALESCE(AVG(success_rate), 0) FROM batches WHERE status = 'completed' AND success_rate IS NOT NULL) as average_success_rate;
