-- Update admin password
UPDATE users 
SET hashed_password = '$2b$12$nc595Cm.PpgfJM0EjjZlOuj7r260pNLLdJpVkNCH7FlYhCLAagEjG' 
WHERE email = 'admin@privateplane.app' AND role = 'ADMIN';

-- Verify update
SELECT email, role, LENGTH(hashed_password) as hash_length, LEFT(hashed_password, 30) as hash_preview
FROM users 
WHERE email = 'admin@privateplane.app';

