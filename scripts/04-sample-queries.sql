-- Requêtes d'exemple pour la Couveuse Intelligente

-- 1. Obtenir toutes les couvées actives avec leurs détails
SELECT * FROM active_batches_details ORDER BY current_day DESC;

-- 2. Statistiques par utilisateur
SELECT * FROM user_statistics ORDER BY average_success_rate DESC;

-- 3. Alertes actives par priorité
SELECT * FROM active_alerts;

-- 4. Données environnementales des dernières 24h
SELECT 
    DATE_TRUNC('hour', recorded_at) as hour,
    AVG(temperature) as avg_temp,
    AVG(humidity) as avg_humidity,
    AVG(co2_level) as avg_co2
FROM environmental_data 
WHERE recorded_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', recorded_at)
ORDER BY hour DESC;

-- 5. Performance par espèce
SELECT * FROM get_species_performance();

-- 6. Utilisation de la capacité
SELECT * FROM get_current_capacity_usage();

-- 7. Couvées prêtes pour le mirage
SELECT 
    b.*,
    u.name as user_name,
    s.name as species_name,
    CURRENT_DATE - b.start_date + 1 as current_day
FROM batches b
JOIN users u ON b.user_id = u.id
JOIN species s ON b.species_id = s.id
WHERE b.status = 'active' 
    AND b.mirage_performed = false
    AND CURRENT_DATE - b.start_date + 1 >= 7;

-- 8. Historique des rotations des dernières 24h
SELECT 
    er.*,
    u.name as performed_by_name,
    array_length(er.batch_ids, 1) as batches_count
FROM egg_rotations er
JOIN users u ON er.performed_by = u.id
WHERE er.rotation_time >= NOW() - INTERVAL '24 hours'
ORDER BY er.rotation_time DESC;

-- 9. Notifications non lues par utilisateur
SELECT 
    u.name,
    COUNT(n.id) as unread_notifications
FROM users u
LEFT JOIN notifications n ON u.id = n.user_id AND n.read = false
WHERE u.role = 'user'
GROUP BY u.id, u.name
HAVING COUNT(n.id) > 0;

-- 10. Tendance de température sur les 7 derniers jours
SELECT 
    DATE(recorded_at) as date,
    MIN(temperature) as min_temp,
    AVG(temperature) as avg_temp,
    MAX(temperature) as max_temp,
    COUNT(*) as measurements
FROM environmental_data 
WHERE recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

-- 11. Couvées avec problèmes (attention ou critique)
SELECT 
    b.id,
    u.name as user_name,
    s.name as species_name,
    b.health_status,
    b.start_date,
    CURRENT_DATE - b.start_date + 1 as current_day,
    b.notes
FROM batches b
JOIN users u ON b.user_id = u.id
JOIN species s ON b.species_id = s.id
WHERE b.status = 'active' 
    AND b.health_status IN ('attention', 'critical');

-- 12. Analyse des échecs par période
SELECT 
    DATE_TRUNC('month', start_date) as month,
    COUNT(*) as total_batches,
    COUNT(CASE WHEN status = 'completed' AND success_rate >= 80 THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'failed' OR success_rate < 50 THEN 1 END) as failed,
    AVG(success_rate) as avg_success_rate
FROM batches 
WHERE start_date >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', start_date)
ORDER BY month DESC;

-- 13. Utilisateurs les plus actifs
SELECT 
    u.name,
    COUNT(b.id) as total_batches,
    MAX(b.start_date) as last_batch_date,
    AVG(b.success_rate) as avg_success_rate
FROM users u
JOIN batches b ON u.id = b.user_id
WHERE u.role = 'user'
GROUP BY u.id, u.name
ORDER BY total_batches DESC, avg_success_rate DESC;

-- 14. Alertes par type et fréquence
SELECT 
    alert_type,
    severity,
    COUNT(*) as frequency,
    AVG(duration_minutes) as avg_duration,
    COUNT(CASE WHEN acknowledged THEN 1 END) as acknowledged_count
FROM alerts 
WHERE start_time >= NOW() - INTERVAL '30 days'
GROUP BY alert_type, severity
ORDER BY frequency DESC;

-- 15. Prévisions d'éclosion pour les 7 prochains jours
SELECT 
    expected_hatch_date,
    COUNT(*) as batches_due,
    SUM(current_quantity) as eggs_expected,
    STRING_AGG(DISTINCT s.name, ', ') as species
FROM batches b
JOIN species s ON b.species_id = s.id
WHERE b.status = 'active' 
    AND b.expected_hatch_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
GROUP BY expected_hatch_date
ORDER BY expected_hatch_date;
