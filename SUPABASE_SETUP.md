# Configuração Supabase - Mariana Doces API

## 🚀 Setup Inicial do Supabase

### 1. Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - **Name**: `mariana-doces-api`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: `South America (São Paulo)` para menor latência
5. Clique em "Create new project"

### 2. Obter String de Conexão

Após criar o projeto:

1. Vá em **Settings** → **Database**
2. Na seção **Connection string**, copie a **URI**
3. Exemplo: `postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres`

### 3. Configurar Variáveis de Ambiente

#### Desenvolvimento Local (.env)
```env
# Database Supabase
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[SEU-REF].supabase.co:5432/postgres"

# JWT
JWT_SECRET="seu_jwt_secret_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Configurações de negócio
IFOOD_FEE_PERCENT=25
DEFAULT_LABOR_RATE_PER_HOUR=20.00

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

#### Produção Vercel
Configure no painel do Vercel:
- `DATABASE_URL` = string de conexão do Supabase
- `JWT_SECRET` = token seguro
- `CORS_ORIGIN` = URL do seu frontend
- Outras variáveis conforme necessário

## 🛠️ Executar Migrações

### Primeira vez (criar tabelas):
```bash
cd mariana-doces-api
npm run prisma:migrate
```

### Deploy das migrações (produção):
```bash
npx prisma migrate deploy
```

### Gerar cliente Prisma:
```bash
npm run prisma:generate
```

### Popular com dados iniciais:
```bash
npm run prisma:seed
```

## 🔍 Verificar Setup

### 1. Prisma Studio (visualizar dados)
```bash
npm run prisma:studio
```

### 2. Testar conexão
```bash
cd mariana-doces-api
npm run dev
```

Acesse: `http://localhost:3001/health`

### 3. Verificar no Supabase Dashboard
- Vá em **Table Editor** no painel do Supabase
- Você deve ver as tabelas criadas pelo Prisma

## 📊 Tabelas Criadas

O Prisma criará automaticamente estas tabelas:
- `users` - Usuários do sistema
- `ingredients` - Ingredientes
- `packaging` - Embalagens  
- `products` - Produtos
- `product_variants` - Variações de produtos
- `recipe_items` - Itens de receita
- `packaging_usage` - Uso de embalagens
- `labor_cost_presets` - Presets de custo de mão de obra
- `sale_orders` - Pedidos de venda
- `sale_items` - Itens dos pedidos
- `cost_snapshots` - Snapshots de custos
- `inventory_movements` - Movimentações de estoque
- `promotions` - Promoções
- `config` - Configurações do sistema

## 🔐 Segurança

### Row Level Security (RLS)
O Supabase vem com RLS habilitado por padrão, mas como usamos nossa própria autenticação JWT, você pode:

1. **Opção 1**: Desabilitar RLS (mais simples)
   - No Supabase Dashboard → Authentication → Settings
   - Desmarque "Enable row level security"

2. **Opção 2**: Configurar políticas RLS (mais seguro)
   - Criar políticas baseadas em JWT claims
   - Requer configuração adicional

### Conexões Seguras
- O Supabase usa SSL por padrão
- Todas as conexões são criptografadas
- IP allowlist disponível no plano pago

## 💰 Limites do Plano Gratuito

- **Database**: 500MB
- **Bandwidth**: 5GB/mês
- **API Requests**: 50.000/mês
- **Auth Users**: 50.000/mês
- **Storage**: 1GB

## 🚀 Deploy no Vercel

1. Configure `DATABASE_URL` nas variáveis de ambiente do Vercel
2. O Vercel executará automaticamente:
   ```bash
   npm run build && npm run prisma:generate
   ```
3. Para migrações em produção, execute localmente:
   ```bash
   DATABASE_URL="[URL-PRODUCAO]" npx prisma migrate deploy
   ```

## 🐛 Troubleshooting

### Erro de Conexão
- Verifique se a senha está correta na DATABASE_URL
- Confirme se o projeto Supabase está ativo
- Teste conexão no Supabase Dashboard

### Erro de Migração
```bash
# Reset do banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Aplicar migrações manualmente
npx prisma db push
```

### Timeout de Conexão
- Supabase pode ter cold start
- Configure connection pooling no Prisma:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Para migrações
}
```

## 📱 Monitoramento

No painel do Supabase você pode:
- Ver logs em tempo real
- Monitorar performance
- Analisar queries SQL
- Verificar uso de recursos

## 🔄 Backup

O Supabase faz backup automático, mas recomenda-se:
- Exportar dados importantes regularmente
- Usar `pg_dump` para backups completos
- Manter scripts de seed atualizados
