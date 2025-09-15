# Configuração de Variáveis de Ambiente no Vercel

## 🎯 Passo a Passo Visual

### 1. Acesse o Vercel Dashboard
- Vá para [vercel.com](https://vercel.com)
- Faça login na sua conta
- Clique no seu projeto `mariana-doces-api`

### 2. Navegue para Settings
- No menu lateral, clique em **"Settings"**
- Clique em **"Environment Variables"**

### 3. Adicione as Variáveis
Clique em **"Add New"** e adicione cada variável:

#### Variável 1: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://postgres.jvwggyjgfgfihicvqaof:S3nh4@123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Environment**: Marque todas as opções (Production, Preview, Development)

#### Variável 2: DIRECT_URL
- **Name**: `DIRECT_URL`
- **Value**: `postgresql://postgres:S3nh4@123@db.jvwggyjgfgfihicvqaof.supabase.co:5432/postgres`
- **Environment**: Marque todas as opções

#### Variável 3: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2`
- **Environment**: Marque todas as opções

#### Variável 4: IFOOD_FEE_PERCENT
- **Name**: `IFOOD_FEE_PERCENT`
- **Value**: `25`
- **Environment**: Marque todas as opções

#### Variável 5: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Marque todas as opções

### 4. Salvar e Fazer Deploy
- Clique em **"Save"** para cada variável
- Vá para a aba **"Deployments"**
- Clique em **"Redeploy"** no último deployment

## ✅ Verificação

Após o deploy, teste:

1. **Health Check**: `https://sua-api.vercel.app/health`
2. **Login**: 
   ```bash
   curl -X POST https://sua-api.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@marianaDoces.com","password":"admin123"}'
   ```

## 🐛 Troubleshooting

### Erro P1001 (Can't reach database)
- Verifique se as variáveis estão configuradas
- Confirme se o Supabase está ativo
- Teste a conexão local primeiro

### Erro de Build
- Verifique se todas as variáveis estão marcadas para "Production"
- Confirme se não há espaços extras nas URLs

### Erro de Autenticação
- Verifique se o JWT_SECRET está configurado
- Confirme se o usuário admin foi criado no banco
