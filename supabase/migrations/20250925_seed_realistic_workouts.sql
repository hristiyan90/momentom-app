-- 20250925_seed_realistic_workouts.sql
-- Seeds realistic workout data for calendar testing
-- Creates 4 months of varied training data (June-September 2025)

-- Clear existing test sessions to avoid conflicts
DELETE FROM public.sessions 
WHERE athlete_id = '00000000-0000-0000-0000-000000000001' 
AND date >= '2025-06-01' 
AND date <= '2025-09-30';

-- Insert realistic workout data
-- Note: This is a representative sample. For full dataset, use the API endpoint.

INSERT INTO public.sessions (
  athlete_id, date, sport, title, planned_duration_min, planned_load, 
  planned_zone_primary, status, structure_json, actual_duration_min
) VALUES 
-- June 2025 - Base Building Phase
('00000000-0000-0000-0000-000000000001', '2025-06-02', 'run', 'Easy Recovery Run', 35, 30, 'z1', 'completed', '{"segments":[]}', 33),
('00000000-0000-0000-0000-000000000001', '2025-06-03', 'bike', 'Base Endurance Ride', 75, 65, 'z2', 'completed', '{"segments":[]}', 78),
('00000000-0000-0000-0000-000000000001', '2025-06-04', 'swim', 'Technique Focus', 40, 35, 'z1', 'completed', '{"segments":[]}', 42),
('00000000-0000-0000-0000-000000000001', '2025-06-05', 'run', 'Base Aerobic Run', 60, 55, 'z2', 'completed', '{"segments":[]}', 58),
('00000000-0000-0000-0000-000000000001', '2025-06-06', 'strength', 'Core & Stability', 45, 35, null, 'completed', '{"segments":[]}', 47),
('00000000-0000-0000-0000-000000000001', '2025-06-07', 'bike', 'Long Steady Ride', 120, 85, 'z2', 'completed', '{"segments":[]}', 115),

('00000000-0000-0000-0000-000000000001', '2025-06-09', 'swim', 'Aerobic Base Swim', 50, 45, 'z2', 'completed', '{"segments":[]}', 52),
('00000000-0000-0000-0000-000000000001', '2025-06-10', 'run', 'Tempo Run', 45, 75, 'z3', 'completed', '{"segments":[]}', 43),
('00000000-0000-0000-0000-000000000001', '2025-06-11', 'bike', 'Sweet Spot Intervals', 70, 95, 'z3', 'completed', '{"segments":[]}', 72),
('00000000-0000-0000-0000-000000000001', '2025-06-12', 'run', 'Base Aerobic Run', 50, 50, 'z2', 'completed', '{"segments":[]}', 48),
('00000000-0000-0000-0000-000000000001', '2025-06-13', 'strength', 'General Strength', 50, 40, null, 'completed', '{"segments":[]}', 52),
('00000000-0000-0000-0000-000000000001', '2025-06-14', 'swim', 'Distance Swim', 70, 60, 'z2', 'completed', '{"segments":[]}', 68),

-- July 2025 - Build Phase Transition
('00000000-0000-0000-0000-000000000001', '2025-07-16', 'run', 'Lactate Threshold Run', 45, 95, 'z4', 'completed', '{"segments":[]}', 44),
('00000000-0000-0000-0000-000000000001', '2025-07-17', 'bike', 'FTP Intervals', 75, 125, 'z4', 'completed', '{"segments":[]}', 73),
('00000000-0000-0000-0000-000000000001', '2025-07-18', 'swim', 'Lactate Threshold Swim', 50, 85, 'z4', 'completed', '{"segments":[]}', 48),
('00000000-0000-0000-0000-000000000001', '2025-07-19', 'run', 'Progression Run', 65, 75, 'z2', 'completed', '{"segments":[]}', 67),
('00000000-0000-0000-0000-000000000001', '2025-07-20', 'strength', 'Sport-Specific Strength', 60, 55, null, 'completed', '{"segments":[]}', 58),
('00000000-0000-0000-0000-000000000001', '2025-07-21', 'bike', 'Endurance Ride', 105, 90, 'z2', 'completed', '{"segments":[]}', 108),

('00000000-0000-0000-0000-000000000001', '2025-07-23', 'swim', 'Threshold Swim Set', 55, 75, 'z3', 'completed', '{"segments":[]}', 57),
('00000000-0000-0000-0000-000000000001', '2025-07-24', 'run', 'Track Intervals', 55, 105, 'z4', 'completed', '{"segments":[]}', 53),
('00000000-0000-0000-0000-000000000001', '2025-07-25', 'bike', 'Over-Under Intervals', 70, 130, 'z4', 'completed', '{"segments":[]}', 68),
('00000000-0000-0000-0000-000000000001', '2025-07-26', 'run', 'Easy Recovery Run', 40, 35, 'z1', 'completed', '{"segments":[]}', 42),
('00000000-0000-0000-0000-000000000001', '2025-07-27', 'strength', 'Power Development', 55, 65, null, 'completed', '{"segments":[]}', 56),

-- August 2025 - Peak Build Phase
('00000000-0000-0000-0000-000000000001', '2025-08-05', 'run', 'VO2 Max Intervals', 40, 115, 'z5', 'completed', '{"segments":[]}', 38),
('00000000-0000-0000-0000-000000000001', '2025-08-06', 'bike', 'VO2 Max Efforts', 60, 145, 'z5', 'completed', '{"segments":[]}', 62),
('00000000-0000-0000-0000-000000000001', '2025-08-07', 'swim', 'VO2 Swim Intervals', 40, 100, 'z5', 'completed', '{"segments":[]}', 39),
('00000000-0000-0000-0000-000000000001', '2025-08-08', 'run', 'Tempo Efforts', 50, 80, 'z3', 'completed', '{"segments":[]}', 52),
('00000000-0000-0000-0000-000000000001', '2025-08-09', 'strength', 'Max Strength Work', 55, 75, null, 'completed', '{"segments":[]}', 53),
('00000000-0000-0000-0000-000000000001', '2025-08-10', 'bike', 'Sustained Power', 90, 110, 'z3', 'completed', '{"segments":[]}', 88),

-- September 2025 - Peak/Race Prep (including original test data dates)
('00000000-0000-0000-0000-000000000001', '2025-09-01', 'run', 'Sharpening Intervals', 45, 85, 'z4', 'completed', '{"segments":[]}', 43),
('00000000-0000-0000-0000-000000000001', '2025-09-02', 'bike', 'Race Simulation', 80, 100, 'z3', 'completed', '{"segments":[]}', 78),
('00000000-0000-0000-0000-000000000001', '2025-09-03', 'swim', 'Race Pace Practice', 45, 70, 'z3', 'completed', '{"segments":[]}', 47),
('00000000-0000-0000-0000-000000000001', '2025-09-04', 'run', 'Tempo Run', 40, 75, 'z3', 'completed', '{"segments":[]}', 38),
('00000000-0000-0000-0000-000000000001', '2025-09-05', 'strength', 'Maintenance Strength', 40, 45, null, 'completed', '{"segments":[]}', 42),

-- Keep original test data for September 6-8 (will be updated by the seed script)
('00000000-0000-0000-0000-000000000001', '2025-09-06', 'run', 'Endurance Base', 90, 75, 'z2', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-06', 'strength', 'Core & Stability', 30, 20, null, 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-07', 'bike', 'Tempo Intervals', 60, 65, 'z3', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-08', 'swim', 'Technique Focus', 45, 40, 'z1', 'planned', '{"segments":[]}', null),

-- Continue with more September sessions
('00000000-0000-0000-0000-000000000001', '2025-09-10', 'run', 'Easy Recovery Run', 35, 30, 'z1', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-11', 'bike', 'Pre-Race Opener', 50, 60, 'z2', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-12', 'swim', 'Race Prep Swim', 35, 45, 'z2', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-13', 'run', 'Strides & Drills', 30, 35, 'z1', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-15', 'bike', 'Final Sharpener', 45, 55, 'z3', 'planned', '{"segments":[]}', null),

('00000000-0000-0000-0000-000000000001', '2025-09-17', 'run', 'Pre-Competition Run', 25, 25, 'z1', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-19', 'swim', 'Activation Swim', 20, 20, 'z1', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-20', 'bike', 'Openers', 30, 30, 'z2', 'planned', '{"segments":[]}', null),

('00000000-0000-0000-0000-000000000001', '2025-09-22', 'run', 'Easy Jog', 20, 20, 'z1', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-24', 'swim', 'Pre-Race Swim', 15, 15, 'z1', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-26', 'run', 'Race Day Prep', 10, 10, 'z1', 'planned', '{"segments":[]}', null);

-- Add some sample weekend long sessions
INSERT INTO public.sessions (
  athlete_id, date, sport, title, planned_duration_min, planned_load, 
  planned_zone_primary, status, structure_json, actual_duration_min
) VALUES 
-- Weekend long sessions across the months
('00000000-0000-0000-0000-000000000001', '2025-06-08', 'run', 'Long Base Run', 90, 75, 'z2', 'completed', '{"segments":[]}', 88),
('00000000-0000-0000-0000-000000000001', '2025-06-15', 'bike', 'Century Base Ride', 180, 120, 'z2', 'completed', '{"segments":[]}', 175),
('00000000-0000-0000-0000-000000000001', '2025-06-22', 'run', 'Progressive Long Run', 105, 85, 'z2', 'completed', '{"segments":[]}', 108),
('00000000-0000-0000-0000-000000000001', '2025-06-29', 'swim', 'Open Water Practice', 90, 70, 'z2', 'completed', '{"segments":[]}', 85),

('00000000-0000-0000-0000-000000000001', '2025-07-06', 'bike', 'Hill Training Ride', 150, 110, 'z3', 'completed', '{"segments":[]}', 148),
('00000000-0000-0000-0000-000000000001', '2025-07-13', 'run', 'Tempo Long Run', 75, 90, 'z3', 'completed', '{"segments":[]}', 72),
('00000000-0000-0000-0000-000000000001', '2025-07-27', 'swim', 'Distance Time Trial', 75, 80, 'z3', 'completed', '{"segments":[]}', 78),

('00000000-0000-0000-0000-000000000001', '2025-08-03', 'bike', 'Race Simulation Ride', 120, 125, 'z4', 'completed', '{"segments":[]}', 118),
('00000000-0000-0000-0000-000000000001', '2025-08-17', 'run', 'Peak Long Run', 120, 100, 'z2', 'completed', '{"segments":[]}', 122),
('00000000-0000-0000-0000-000000000001', '2025-08-24', 'swim', 'Peak Distance Swim', 90, 85, 'z2', 'completed', '{"segments":[]}', 88),

('00000000-0000-0000-0000-000000000001', '2025-09-07', 'run', 'Final Long Run', 60, 65, 'z2', 'planned', '{"segments":[]}', null),
('00000000-0000-0000-0000-000000000001', '2025-09-14', 'bike', 'Taper Ride', 75, 50, 'z2', 'planned', '{"segments":[]}', null);

-- Verify the insert
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as session_count,
  ARRAY_AGG(DISTINCT sport) as sports
FROM public.sessions 
WHERE athlete_id = '00000000-0000-0000-0000-000000000001'
  AND date >= '2025-06-01' 
  AND date <= '2025-09-30'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month;

-- Summary
SELECT 
  'Total sessions inserted' as metric,
  COUNT(*)::text as value
FROM public.sessions 
WHERE athlete_id = '00000000-0000-0000-0000-000000000001'
  AND date >= '2025-06-01' 
  AND date <= '2025-09-30';
