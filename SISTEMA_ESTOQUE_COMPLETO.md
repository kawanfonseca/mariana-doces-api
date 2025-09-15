# 🎯 Sistema Completo de Estoque e Receitas - Mariana Doces

## 📋 Visão Geral

Este sistema implementa um controle completo de estoque e receitas para a confeitaria Mariana Doces, incluindo:

- ✅ **Controle de Estoque** com movimentações (IN/OUT/ADJUSTMENT)
- ✅ **Receitas de Produtos** com ingredientes e custos
- ✅ **Relatórios Avançados** de estoque e consumo
- ✅ **Alertas Automáticos** de estoque baixo/zerado
- ✅ **Previsão de Consumo** baseada em vendas
- ✅ **Operações Avançadas** (transferências, ajustes em lote, etc.)

## 🚀 Instalação

### Opção 1: Sistema Completo (Recomendado)
```bash
node scripts/setup-supabase.js complete
```

### Opção 2: Migração Básica
```bash
node scripts/setup-supabase.js migration
```

### Opção 3: Banco Novo
```bash
node scripts/setup-supabase.js full
```

## 📊 Funcionalidades Implementadas

### 1. **Controle de Estoque Básico**
- Movimentações de entrada, saída e ajuste
- Controle de estoque mínimo
- Alertas automáticos
- Histórico completo de movimentações

### 2. **Relatórios de Estoque**
- **Movimentações**: Histórico detalhado com filtros
- **Valor em Estoque**: Análise financeira do estoque
- **Ingredientes Mais Utilizados**: Ranking de consumo
- **Previsão de Estoque**: Baseada em vendas históricas
- **Rotatividade**: Análise de giro de estoque
- **Exportação CSV**: Para análise externa

### 3. **Operações Avançadas**
- **Ajuste em Lote**: Múltiplos ingredientes simultaneamente
- **Transferência**: Entre ingredientes diferentes
- **Consumo Automático**: Baseado em receitas de produção
- **Reabastecimento Automático**: Baseado em estoque mínimo
- **Histórico Detalhado**: Por ingrediente
- **Ingredientes Próximos ao Vencimento**: Simulação

### 4. **Sistema de Alertas**
- Estoque zerado
- Estoque abaixo do mínimo
- Ingredientes próximos ao vencimento
- Histórico de alertas

## 🔗 Endpoints da API

### Estoque Básico (`/api/stock`)
```
GET    /movements              # Listar movimentações
GET    /movements/:id          # Buscar movimentação
POST   /movements              # Criar movimentação
PUT    /movements/:id          # Atualizar movimentação
DELETE /movements/:id          # Deletar movimentação
GET    /status                 # Status do estoque
GET    /alerts                 # Alertas de estoque
```

### Relatórios (`/api/inventory/reports`)
```
GET    /movements              # Relatório de movimentações
GET    /movements/export       # Exportar CSV
GET    /value                  # Relatório de valor
GET    /most-used              # Ingredientes mais utilizados
GET    /turnover               # Rotatividade de estoque
GET    /forecast               # Previsão de estoque
```

### Operações Avançadas (`/api/inventory/advanced`)
```
POST   /bulk-adjustment        # Ajuste em lote
POST   /transfer               # Transferência entre ingredientes
POST   /consume                # Consumo para produção
POST   /auto-restock           # Reabastecimento automático
GET    /ingredient/:id/history # Histórico por ingrediente
GET    /expiring               # Ingredientes próximos ao vencimento
```

### Receitas (`/api/recipes`)
```
GET    /:productId             # Buscar receita do produto
PUT    /:productId             # Atualizar receita do produto
```

## 📈 Exemplos de Uso

### 1. Criar Movimentação de Entrada
```javascript
POST /api/stock/movements
{
  "ingredientId": "ingredient_id",
  "type": "IN",
  "quantity": 1000,
  "reason": "Compra de ingredientes",
  "notes": "Fornecedor ABC - Lote 123"
}
```

### 2. Ajuste em Lote
```javascript
POST /api/inventory/advanced/bulk-adjustment
{
  "adjustments": [
    {
      "ingredientId": "ingredient_1",
      "newStock": 500
    },
    {
      "ingredientId": "ingredient_2", 
      "newStock": 300
    }
  ],
  "reason": "Contagem mensal",
  "notes": "Inventário físico realizado"
}
```

### 3. Consumo para Produção
```javascript
POST /api/inventory/advanced/consume
{
  "productId": "product_id",
  "quantity": 10,
  "reason": "Produção",
  "notes": "Lote de 10 unidades"
}
```

### 4. Relatório de Valor em Estoque
```javascript
GET /api/inventory/reports/value?minValue=100&maxValue=1000
```

### 5. Previsão de Estoque
```javascript
GET /api/inventory/reports/forecast?days=30
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais
- **`ingredients`**: Ingredientes com estoque atual e mínimo
- **`stock_movements`**: Histórico de movimentações
- **`ingredient_cost_history`**: Histórico de mudanças de custo
- **`stock_alerts`**: Alertas de estoque
- **`recipe_items`**: Itens das receitas (já existente)

### Views Criadas
- **`stock_status_view`**: Status atual de todos os ingredientes
- **`stock_movements_summary`**: Resumo de movimentações

### Triggers Automáticos
- **Alertas de Estoque**: Gera alertas quando estoque baixa
- **Histórico de Custos**: Registra mudanças de preço
- **Atualização de Timestamps**: Mantém `updatedAt` atualizado

## 📊 Relatórios Disponíveis

### 1. **Relatório de Movimentações**
- Filtros por data, ingrediente, tipo
- Totais de entrada, saída e ajustes
- Valores monetários
- Exportação CSV

### 2. **Relatório de Valor em Estoque**
- Valor total do estoque
- Valor por categoria (baixo estoque, zerado)
- Valor médio por ingrediente
- Status de cada ingrediente

### 3. **Ingredientes Mais Utilizados**
- Ranking por quantidade consumida
- Valor total consumido
- Média por movimentação
- Período configurável

### 4. **Previsão de Estoque**
- Baseada em vendas dos últimos 30 dias
- Cálculo de dias restantes
- Recomendação de pedidos
- Identificação de ingredientes críticos

### 5. **Rotatividade de Estoque**
- Índice de rotatividade por ingrediente
- Categorização (alta/média/baixa rotatividade)
- Dias médios em estoque
- Identificação de ingredientes parados

## 🔧 Configuração

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### Comandos Úteis
```bash
# Gerar cliente Prisma
npm run prisma:generate

# Testar conexão
npm run db:test

# Iniciar servidor
npm run dev

# Seed do banco (dados de exemplo)
npm run prisma:seed
```

## 🎯 Próximos Passos

1. **Execute o SQL no Supabase**:
   ```bash
   node scripts/setup-supabase.js complete
   ```

2. **Configure as variáveis de ambiente**

3. **Gere o cliente Prisma**:
   ```bash
   npm run prisma:generate
   ```

4. **Teste a conexão**:
   ```bash
   npm run db:test
   ```

5. **Inicie o servidor**:
   ```bash
   npm run dev
   ```

6. **Teste os endpoints** usando o frontend ou Postman

## 📱 Integração com Frontend

O frontend já possui as páginas:
- **Inventory.tsx**: Controle de estoque
- **ProductRecipe.tsx**: Gestão de receitas

As novas funcionalidades estarão disponíveis através dos endpoints da API.

## 🚨 Alertas e Notificações

O sistema gera alertas automáticos para:
- ✅ Estoque zerado
- ✅ Estoque abaixo do mínimo
- ✅ Ingredientes próximos ao vencimento
- ✅ Histórico de alertas consultável

## 📈 Benefícios

- **Controle Total**: Visibilidade completa do estoque
- **Automação**: Alertas e reabastecimento automático
- **Relatórios**: Análises detalhadas para tomada de decisão
- **Previsão**: Antecipação de necessidades
- **Eficiência**: Operações em lote e transferências
- **Rastreabilidade**: Histórico completo de movimentações

---

**Sistema implementado com sucesso! 🎉**

Para suporte ou dúvidas, consulte a documentação da API ou os logs do servidor.
