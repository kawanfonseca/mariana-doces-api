# Mariana Doces API

API para sistema de gerenciamento da confeitaria Mariana Doces, desenvolvida com Node.js, TypeScript, Express e Prisma.

## 🚀 Tecnologias

- **Node.js 20+** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista
- **Prisma ORM** - ORM moderno para TypeScript/JavaScript
- **SQLite** - Banco de dados local (desenvolvimento)
- **PostgreSQL** - Suporte para produção
- **Zod** - Validação de schemas
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **Multer** - Upload de arquivos
- **csv-parser** - Processamento de arquivos CSV

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd mariana-doces-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Configure o banco de dados:
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. Execute o seed para popular o banco com dados de exemplo:
```bash
npm run prisma:seed
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

```env
# Database
DATABASE_URL="file:./dev.db"
# Para produção: DATABASE_URL="postgresql://user:password@localhost:5432/mariana_doces"

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

### Configurações de Negócio

- **IFOOD_FEE_PERCENT**: Taxa do iFood em porcentagem (padrão: 25%)
- **DEFAULT_LABOR_RATE_PER_HOUR**: Taxa padrão de mão de obra por hora em R$ (padrão: 20,00)

## 🏃‍♂️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor em modo desenvolvimento com hot reload

# Build
npm run build        # Compila TypeScript para JavaScript
npm start            # Inicia servidor em produção

# Banco de dados
npm run prisma:migrate    # Executa migrações do banco
npm run prisma:seed      # Popula banco com dados de exemplo
npm run prisma:studio    # Abre interface visual do Prisma
npm run prisma:generate  # Gera cliente Prisma

# Testes
npm test            # Executa testes (quando implementados)
```

## 📊 Estrutura do Banco de Dados

### Entidades Principais

- **User** - Usuários do sistema (admin/operador)
- **Ingredient** - Ingredientes/insumos
- **Packaging** - Embalagens
- **Product** - Produtos vendidos
- **ProductVariant** - Variações de produtos
- **RecipeItem** - Composição de receitas
- **PackagingUsage** - Uso de embalagens por produto
- **LaborCostPreset** - Presets de custo de mão de obra
- **SaleOrder** - Pedidos de venda
- **SaleItem** - Itens dos pedidos
- **CostSnapshot** - Snapshot de custos no momento da venda
- **InventoryMovement** - Movimentações de estoque
- **Promotion** - Promoções e descontos
- **Config** - Configurações do sistema

## 🛣️ Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário (admin)
- `GET /api/auth/me` - Dados do usuário atual

### Ingredientes
- `GET /api/ingredients` - Listar ingredientes
- `GET /api/ingredients/:id` - Obter ingrediente
- `POST /api/ingredients` - Criar ingrediente (admin)
- `PUT /api/ingredients/:id` - Atualizar ingrediente (admin)
- `DELETE /api/ingredients/:id` - Excluir ingrediente (admin)

### Embalagens
- `GET /api/packaging` - Listar embalagens
- `GET /api/packaging/:id` - Obter embalagem
- `POST /api/packaging` - Criar embalagem (admin)
- `PUT /api/packaging/:id` - Atualizar embalagem (admin)
- `DELETE /api/packaging/:id` - Excluir embalagem (admin)

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Obter produto
- `GET /api/products/:id/recipe` - Obter receita do produto
- `GET /api/products/pricing/preview` - Preview de custos e preços
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `PUT /api/products/:id/recipe` - Atualizar receita (admin)
- `DELETE /api/products/:id` - Excluir produto (admin)

### Pedidos/Vendas
- `GET /api/orders` - Listar pedidos
- `GET /api/orders/:id` - Obter pedido
- `POST /api/orders` - Criar pedido
- `PUT /api/orders/:id` - Atualizar pedido
- `DELETE /api/orders/:id` - Excluir pedido (admin)

### Relatórios
- `GET /api/reports/summary` - Resumo por período
- `GET /api/reports/products` - Relatório por produtos
- `GET /api/reports/export/csv` - Exportar CSV

### Importação
- `POST /api/import/sales-csv` - Importar vendas via CSV

### Configurações
- `GET /api/config` - Obter configurações
- `PUT /api/config` - Atualizar configuração (admin)

## 👥 Usuários Padrão

Após executar o seed, os seguintes usuários estarão disponíveis:

- **Admin**: admin@marianaDoces.com / admin123
- **Operador**: operador@marianaDoces.com / operador123

## 📈 Produtos de Exemplo

O seed inclui todos os produtos da confeitaria com custos e preços baseados nos dados fornecidos:

- Alfajor P
- Cookies (Tradicional, Chocolate, Red Velvet, Pistache)
- Marmitinhas Brownie (com e sem Nutella)
- Bentôs (Cenoura, Formigueiro)
- Fatia de Bolo
- Bem Casados
- Bebidas (Água, Refrigerante)
- Velas (Colorida, Metalizada)

## 💰 Cálculo de Custos

O sistema calcula automaticamente:

1. **Custo de Ingredientes**: Soma dos ingredientes × quantidades (+ % desperdício)
2. **Custo de Embalagens**: Soma das embalagens × quantidades
3. **Custo de Mão de Obra**: (minutos/60) × taxa/hora × (1/rendimento)
4. **Custo Total Unitário**: Soma dos custos acima
5. **Preços Sugeridos**: Com margem configurável
6. **Preço iFood**: Compensando taxa da plataforma

## 📤 Importação CSV

O sistema suporta importação de vendas via CSV no formato:

```csv
Produto1,Produto2,Produto3
3,2,1
```

Ou com coluna de data:

```csv
Dia,Produto1,Produto2,Produto3
23/07/2025,3,2,1
```

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de dados com Zod
- Middleware de autorização por roles
- CORS configurável
- Headers de segurança com Helmet

## 🌍 Deploy

### PostgreSQL (Produção)

1. Configure a variável `DATABASE_URL` para PostgreSQL
2. Execute as migrações: `npm run prisma:migrate`
3. Build da aplicação: `npm run build`
4. Inicie o servidor: `npm start`

### Vercel/Railway/Render

O projeto está configurado para deploy em plataformas serverless e PaaS.

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.
