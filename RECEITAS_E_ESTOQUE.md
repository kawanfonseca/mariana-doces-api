# Sistema de Receitas e Controle de Estoque - Mariana Doces API 🧁

## 📋 Visão Geral

Este documento descreve as novas funcionalidades implementadas no backend da Mariana Doces API para suportar:

- ✅ **Receitas de produtos** com ingredientes e embalagens
- ✅ **Controle de estoque** de ingredientes
- ✅ **Movimentações de estoque** (entrada, saída, ajustes)
- ✅ **Análise de custos** baseada em receitas
- ✅ **Alertas de estoque baixo**
- ✅ **Cálculo automático de lucro**

## 🚀 Novas Funcionalidades

### 1. Sistema de Receitas

Cada produto pode ter uma receita completa com:
- **Ingredientes**: quantidade, porcentagem de desperdício
- **Embalagens**: tipos e quantidades utilizadas
- **Mão de obra**: tempo, rendimento e custo por hora

### 2. Controle de Estoque

- **Estoque atual** e **estoque mínimo** para cada ingrediente
- **Movimentações automáticas** com histórico completo
- **Alertas** quando estoque está baixo ou zerado
- **Relatórios** de valor total em estoque

### 3. Análise de Custos

- **Cálculo automático** do custo de cada produto
- **Margem de lucro** para canais direto e iFood
- **Análise comparativa** de todos os produtos
- **Sugestões de preços** baseadas nos custos

## 🛠️ Configuração

### 1. Configurar Banco de Dados

Execute o SQL do Supabase:

```bash
node scripts/setup-supabase.js
```

### 2. Executar Migrações

```bash
npm run prisma:migrate
```

### 3. Popular com Dados de Exemplo

```bash
npm run prisma:seed
```

### 4. Testar Conexão

```bash
npm run db:test
```

## 📡 Endpoints da API

### Receitas de Produtos

```http
# Obter receita de um produto
GET /api/recipes/:productId

# Atualizar receita de um produto
PUT /api/recipes/:productId

# Calcular custos de um produto
GET /api/recipes/:productId/cost

# Duplicar receita entre produtos
POST /api/recipes/:sourceProductId/duplicate
```

### Movimentações de Estoque

```http
# Listar movimentações
GET /api/stock/movements

# Criar movimentação
POST /api/stock/movements

# Obter movimentação específica
GET /api/stock/movements/:id
```

### Análise de Estoque

```http
# Status geral do estoque
GET /api/stock/status

# Alertas de estoque baixo
GET /api/stock/alerts

# Análise de custos de todos os produtos
GET /api/stock/cost-analysis
```

## 💡 Exemplos de Uso

### 1. Criar Receita para um Produto

```json
PUT /api/recipes/produto-123
{
  "recipeItems": [
    {
      "ingredientId": "farinha-001",
      "qty": 200,
      "wastePct": 5
    },
    {
      "ingredientId": "acucar-001", 
      "qty": 150,
      "wastePct": 0
    }
  ],
  "packagingUsages": [
    {
      "packagingId": "saquinho-001",
      "qty": 1
    }
  ],
  "laborCostPreset": {
    "name": "Cookies - lote 24",
    "minutesPerBatch": 45,
    "batchYield": 24,
    "laborRatePerHour": 20.00
  }
}
```

### 2. Registrar Entrada de Estoque

```json
POST /api/stock/movements
{
  "ingredientId": "farinha-001",
  "type": "IN",
  "quantity": 5000,
  "reason": "Compra mensal",
  "notes": "Fornecedor ABC - NF 12345"
}
```

### 3. Registrar Saída para Produção

```json
POST /api/stock/movements
{
  "ingredientId": "farinha-001", 
  "type": "OUT",
  "quantity": 800,
  "reason": "Produção cookies",
  "notes": "Lote 48 unidades"
}
```

### 4. Ajuste de Estoque

```json
POST /api/stock/movements
{
  "ingredientId": "acucar-001",
  "type": "ADJUSTMENT", 
  "quantity": 2850,
  "reason": "Contagem mensal",
  "notes": "Diferença encontrada na contagem"
}
```

## 📊 Dados de Exemplo

O sistema já vem com dados de exemplo incluindo:

### Ingredientes com Estoque
- Farinha de Trigo: 4.200g (estoque atual)
- Açúcar Cristal: 3.000g
- Ovos: 48 unidades
- Chocolate em Pó: 1.300g
- Pasta de Pistache: 50g ⚠️ (estoque baixo)

### Produtos com Receitas
- **Cookies Tradicional**: farinha + açúcar + manteiga + ovos
- **Cookies Chocolate**: receita tradicional + chocolate
- **Cookies Pistache**: receita tradicional + pasta de pistache
- **Marmitinha Brownie**: chocolate + farinha + açúcar + ovos + manteiga
- **Bentô Cenoura**: cenoura + farinha + açúcar + ovos

### Movimentações Históricas
- Entradas de estoque inicial (01/07/2025)
- Saídas para produção (20-26/07/2025)
- Ajustes de contagem (25/07/2025)

## 🔍 Monitoramento

### Alertas Automáticos

O sistema gera alertas quando:
- **Estoque zerado**: ingrediente sem estoque
- **Estoque baixo**: quantidade abaixo do mínimo definido

### Relatórios Disponíveis

1. **Status do Estoque**: visão geral com totais
2. **Análise de Custos**: margem de cada produto
3. **Movimentações**: histórico completo
4. **Alertas**: ingredientes que precisam reposição

## 🚨 Validações

### Movimentações de Estoque
- ✅ Ingrediente deve existir
- ✅ Quantidade deve ser positiva
- ✅ Motivo é obrigatório
- ✅ Saídas não podem exceder estoque atual

### Receitas
- ✅ Ingredientes devem existir
- ✅ Embalagens devem existir
- ✅ Quantidades devem ser positivas
- ✅ Porcentagem de desperdício entre 0-100%

## 🔧 Comandos Úteis

```bash
# Visualizar status do banco
npm run prisma:studio

# Resetar banco e dados
npm run prisma:migrate reset

# Gerar client atualizado
npm run prisma:generate

# Executar seed novamente
npm run prisma:seed

# Testar API
npm run dev
```

## 📝 Próximos Passos

1. **Integrar com frontend** para interface visual
2. **Configurar notificações** para alertas de estoque
3. **Implementar relatórios** em PDF/Excel
4. **Adicionar backup automático** dos dados
5. **Criar dashboard** com métricas em tempo real

---

**Desenvolvido para Mariana Doces** 🧁  
Sistema completo de gestão com controle de receitas e estoque!
