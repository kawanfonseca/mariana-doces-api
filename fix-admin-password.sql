-- SQL para corrigir a senha do usuário admin
-- Execute este SQL no Supabase para corrigir a senha

-- Atualizar a senha do usuário admin com o hash correto
UPDATE users 
SET password = '$2a$12$oCQ0Kt/edb1FobSITO9AnuK6lccKjZbCtmf.IKVlw3Xy2KcT4qQhm'
WHERE email = 'admin@marianaDoces.com';

-- Verificar se foi atualizado
SELECT id, email, name, role, active, "createdAt" 
FROM users 
WHERE email = 'admin@marianaDoces.com';
