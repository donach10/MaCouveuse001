-- Données de test pour la Couveuse Intelligente

-- Insertion des espèces
INSERT INTO species (name, incubation_days, optimal_temperature, optimal_humidity, description) VALUES
('Poule', 21, 37.5, 60.0, 'Gallus gallus domesticus - Espèce la plus commune en incubation'),
('Canard', 28, 37.5, 65.0, 'Anas platyrhynchos - Nécessite une humidité plus élevée'),
('Oie', 30, 37.4, 65.0, 'Anser anser - Longue période d''incubation'),
('Caille', 18, 37.8, 60.0, 'Coturnix coturnix - Incubation rapide, température légèrement plus élevée'),
('Dinde', 28, 37.5, 61.0, 'Meleagris gallopavo - Similaire au canard'),
('Pintade', 26, 37.6, 62.0, 'Numida meleagris - Espèce africaine domestiquée'),
('Faisan', 24, 37.6, 60.0, 'Phasianus colchicus - Gibier d''élevage'),
('Paon', 28, 37.5, 60.0, 'Pavo cristatus - Espèce ornementale');

-- Insertion des utilisateurs
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES
('Administrateur Système', 'admin@couveuse.fr', '01.23.45.67.89', '$2b$10$example_admin_hash', 'admin', 'active'),
('Marie Laurent', 'marie.laurent@email.fr', '06.12.34.56.78', '$2b$10$example_user_hash', 'user', 'active'),
('Pierre Martin', 'pierre.martin@email.fr', '06.23.45.67.89', '$2b$10$example_user_hash', 'user', 'active'),
('Sophie Dubois', 'sophie.dubois@email.fr', '06.34.56.78.90', '$2b$10$example_user_hash', 'user', 'active'),
('Jean Rousseau', 'jean.rousseau@email.fr', '06.45.67.89.01', '$2b$10$example_user_hash', 'user', 'active'),
('Claire Bernard', 'claire.bernard@email.fr', '06.56.78.90.12', '$2b$10$example_user_hash', 'user', 'inactive'),
('Marc Durand', 'marc.durand@email.fr', '06.67.89.01.23', '$2b$10$example_user_hash', 'user', 'active'),
('Lisa Moreau', 'lisa.moreau@email.fr', '06.78.90.12.34', '$2b$10$example_user_hash', 'user', 'active'),
('Paul Roux', 'paul.roux@email.fr', '06.89.01.23.45', '$2b$10$example_user_hash', 'user', 'active'),
('Emma Blanc', 'emma.blanc@email.fr', '06.90.12.34.56', '$2b$10$example_user_hash', 'user', 'active');

-- Configuration système
INSERT INTO system_config (parameter_name, parameter_value, parameter_type, description) VALUES
('total_capacity', '1056', 'number', 'Capacité totale de la couveuse en nombre d''œufs'),
('temperature_min', '35.0', 'number', 'Température minimale critique (°C)'),
('temperature_max', '40.0', 'number', 'Température maximale critique (°C)'),
('humidity_min', '50.0', 'number', 'Humidité minimale critique (%)'),
('humidity_max', '70.0', 'number', 'Humidité maximale critique (%)'),
('co2_max', '600', 'number', 'Niveau maximum de CO2 (ppm)'),
('rotation_interval_hours', '8', 'number', 'Intervalle de retournement automatique (heures)'),
('alert_temperature_duration', '60', 'number', 'Durée avant alerte température (minutes)'),
('alert_co2_duration', '30', 'number', 'Durée avant alerte CO2 (minutes)'),
('maintenance_mode', 'false', 'boolean', 'Mode maintenance activé'),
('notification_email', 'true', 'boolean', 'Notifications par email activées'),
('notification_sms', 'false', 'boolean', 'Notifications par SMS activées');

-- Couvées en cours
INSERT INTO batches (user_id, species_id, initial_quantity, current_quantity, start_date, expected_hatch_date, status, health_status, mirage_performed, mirage_date, mirage_fertile_count) VALUES
(2, 1, 12, 10, '2024-01-02', '2024-01-23', 'active', 'healthy', true, '2024-01-10', 10),
(3, 2, 8, 8, '2023-12-25', '2024-01-22', 'active', 'healthy', false, null, null),
(4, 4, 24, 18, '2024-01-05', '2024-01-23', 'active', 'attention', true, '2024-01-12', 18),
(5, 1, 6, 6, '2024-01-08', '2024-01-29', 'active', 'healthy', false, null, null),
(6, 3, 4, 4, '2024-01-01', '2024-01-31', 'active', 'healthy', false, null, null),
(7, 1, 15, 13, '2024-01-03', '2024-01-24', 'active', 'healthy', true, '2024-01-11', 13),
(8, 2, 10, 9, '2023-12-28', '2024-01-25', 'active', 'attention', true, '2024-01-05', 9),
(9, 4, 20, 20, '2024-01-06', '2024-01-24', 'active', 'healthy', false, null, null);

-- Couvées terminées (historique)
INSERT INTO batches (user_id, species_id, initial_quantity, current_quantity, start_date, expected_hatch_date, actual_hatch_date, status, health_status, mirage_performed, mirage_date, mirage_fertile_count, success_rate, notes) VALUES
(2, 1, 15, 12, '2023-11-25', '2023-12-16', '2023-12-16', 'completed', 'healthy', true, '2023-12-03', 13, 92.31, 'Excellente couvée, conditions parfaites'),
(3, 2, 10, 6, '2023-10-28', '2023-11-25', '2023-11-26', 'completed', 'attention', true, '2023-11-05', 8, 75.00, 'Panne électrique de 2h le jour 15'),
(4, 4, 24, 21, '2023-10-15', '2023-11-02', '2023-11-02', 'completed', 'healthy', true, '2023-10-22', 22, 95.45, 'Résultat exceptionnel'),
(2, 1, 18, 15, '2023-09-20', '2023-10-11', '2023-10-11', 'completed', 'healthy', true, '2023-09-28', 16, 93.75, 'Très bon résultat'),
(5, 3, 6, 4, '2023-09-01', '2023-10-01', '2023-10-02', 'completed', 'attention', true, '2023-09-08', 5, 80.00, 'Humidité un peu basse'),
(7, 1, 12, 10, '2023-08-15', '2023-09-05', '2023-09-05', 'completed', 'healthy', true, '2023-08-23', 11, 90.91, 'Bonne couvée'),
(8, 2, 14, 11, '2023-08-01', '2023-08-29', '2023-08-30', 'completed', 'healthy', true, '2023-08-08', 12, 91.67, 'Retard d''un jour'),
(9, 4, 30, 25, '2023-07-20', '2023-08-07', '2023-08-07', 'completed', 'healthy', true, '2023-07-27', 27, 92.59, 'Grande couvée réussie'),
(3, 1, 8, 5, '2023-07-01', '2023-07-22', '2023-07-23', 'completed', 'critical', true, '2023-07-08', 6, 83.33, 'Problème de ventilation'),
(4, 2, 16, 12, '2023-06-15', '2023-07-13', '2023-07-13', 'completed', 'healthy', true, '2023-06-22', 14, 85.71, 'Résultat satisfaisant');

-- Données environnementales récentes (dernières 48h)
INSERT INTO environmental_data (temperature, humidity, co2_level, battery_level, wifi_strength, recorded_at)
SELECT 
    37.5 + (random() - 0.5) * 0.4, -- Température entre 37.3 et 37.7
    60 + (random() - 0.5) * 6,     -- Humidité entre 57 et 63
    400 + random() * 200,          -- CO2 entre 400 et 600
    85 + random() * 15,            -- Batterie entre 85 et 100
    75 + random() * 25,            -- WiFi entre 75 et 100
    NOW() - INTERVAL '1 minute' * generate_series(0, 2880) -- Toutes les minutes sur 48h
FROM generate_series(1, 2880);

-- Enregistrements de mirage
INSERT INTO candling_records (batch_id, performed_by, candling_date, day_of_incubation, fertile_eggs, infertile_eggs, dead_embryos, notes) VALUES
(1, 1, '2024-01-10', 8, 10, 2, 0, 'Mirage standard, développement normal'),
(3, 1, '2024-01-12', 7, 18, 6, 0, 'Bon taux de fertilité pour les cailles'),
(6, 1, '2024-01-11', 8, 13, 2, 0, 'Développement embryonnaire excellent'),
(7, 1, '2024-01-05', 8, 9, 1, 0, 'Un embryon mort détecté');

-- Historique des retournements
INSERT INTO egg_rotations (performed_by, rotation_time, batch_ids, notes)
SELECT 
    1, -- Admin
    NOW() - INTERVAL '1 hour' * generate_series(0, 168), -- Toutes les 8h sur 7 jours
    ARRAY[1,2,3,4,5,6,7,8], -- Toutes les couvées actives
    'Retournement automatique programmé'
FROM generate_series(0, 21); -- 21 rotations sur 7 jours

-- Alertes récentes
INSERT INTO alerts (alert_type, severity, title, message, value, threshold, start_time, end_time, duration_minutes, acknowledged, acknowledged_by, resolved) VALUES
('temperature_high', 'critical', 'TEMPÉRATURE CRITIQUE ÉLEVÉE', 'Température ≥ 40°C depuis plus d''une heure', 40.2, 40.0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 60, true, 1, true),
('co2_high', 'warning', 'NIVEAU CO₂ ÉLEVÉ', 'CO₂ ≥ 600 ppm depuis plus de 30 minutes', 650, 600, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '15 minutes', 30, true, 1, true),
('temperature_low', 'emergency', 'TEMPÉRATURE CRITIQUE BASSE', 'Température ≤ 35°C depuis plus d''une heure', 34.8, 35.0, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', 60, true, 1, true);

-- Notifications pour les utilisateurs
INSERT INTO notifications (user_id, title, message, type, read) VALUES
(2, 'Couvée prête pour mirage', 'Votre couvée de poules #1 est prête pour le mirage (jour 8)', 'info', false),
(3, 'Éclosion imminente', 'Votre couvée de canards #2 va éclore dans 2 jours', 'success', false),
(4, 'Attention requise', 'Votre couvée de cailles #3 nécessite une surveillance accrue', 'warning', true),
(5, 'Nouveau mirage disponible', 'Vous pouvez maintenant effectuer le mirage de votre couvée #4', 'info', false),
(2, 'Couvée terminée', 'Félicitations ! Votre couvée #11 s''est terminée avec un taux de 92%', 'success', true);

-- Logs d'activité récents
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details, ip_address) VALUES
(1, 'egg_rotation', 'system', null, '{"batches": [1,2,3,4,5,6,7,8], "automatic": true}', '192.168.1.100'),
(1, 'alert_acknowledged', 'alert', 1, '{"alert_type": "temperature_high", "severity": "critical"}', '192.168.1.100'),
(2, 'batch_view', 'batch', 1, '{"action": "view_details"}', '192.168.1.101'),
(3, 'login', 'user', 3, '{"success": true}', '192.168.1.102'),
(4, 'candling_request', 'batch', 3, '{"day": 7, "species": "caille"}', '192.168.1.103'),
(1, 'system_maintenance', 'system', null, '{"action": "sensor_calibration", "sensor": "humidity"}', '192.168.1.100');
