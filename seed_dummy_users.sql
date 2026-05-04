-- Seed dummy users into civic_credits to initialize their accounts
-- Run: psql $DATABASE_URL -f seed_dummy_users.sql

INSERT INTO civic_credits (user_id, delta, badge) VALUES
('robot1508', 500, 'Developer'),
('voter_newbie', 50, 'Citizen'),
('official_test', 1000, 'Election Master'),
('voter_senior', 100, 'Veteran Voter')
ON CONFLICT DO NOTHING;
