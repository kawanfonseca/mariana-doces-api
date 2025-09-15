-- =====================================================
-- MIGRAÇÃO: Adicionar Sistema de Receitas e Controle de Estoque
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase para adicionar as novas funcionalidades
-- Data: 15/09/2025

-- =====================================================
-- 1. ADICIONAR CAMPOS DE ESTOQUE NA TABELA INGREDIENTS
-- =====================================================

ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS "currentStock" DECIMAL(10,3) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "minStock" DECIMAL(10,3) DEFAULT 0;

-- =====================================================
-- 2. CRIAR TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "ingredientId" TEXT NOT NULL,
    type TEXT NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT'
    quantity DECIMAL(10,3) NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    date TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("ingredientId") REFERENCES ingredients(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ingredients_stock ON ingredients("currentStock");
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements("ingredientId");
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);

-- =====================================================
-- 4. CRIAR FUNÇÃO E TRIGGER PARA ATUALIZAR updatedAt
-- =====================================================

-- Criar função para atualizar updatedAt (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS update_stock_movements_updated_at ON stock_movements;

CREATE TRIGGER update_stock_movements_updated_at 
BEFORE UPDATE ON stock_movements 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Atualizar ingredientes existentes com estoque inicial
UPDATE ingredients SET 
    "currentStock" = CASE 
        WHEN name = 'Farinha de Trigo' THEN 5000
        WHEN name = 'Açúcar Cristal' THEN 3000
        WHEN name = 'Ovos' THEN 60
        WHEN name = 'Manteiga' THEN 2000
        WHEN name = 'Chocolate em Pó' THEN 1500
        WHEN name = 'Leite' THEN 2000
        WHEN name = 'Corante Alimentício' THEN 100
        WHEN name = 'Pasta de Pistache' THEN 500
        WHEN name = 'Nutella' THEN 800
        WHEN name = 'Cenoura' THEN 1000
        WHEN name = 'Água Mineral' THEN 24
        WHEN name = 'Refrigerante' THEN 12
        WHEN name = 'Vela Colorida' THEN 50
        WHEN name = 'Vela Metalizada' THEN 30
        ELSE "currentStock"
    END,
    "minStock" = CASE 
        WHEN name = 'Farinha de Trigo' THEN 1000
        WHEN name = 'Açúcar Cristal' THEN 500
        WHEN name = 'Ovos' THEN 12
        WHEN name = 'Manteiga' THEN 500
        WHEN name = 'Chocolate em Pó' THEN 300
        WHEN name = 'Leite' THEN 500
        WHEN name = 'Corante Alimentício' THEN 20
        WHEN name = 'Pasta de Pistache' THEN 100
        WHEN name = 'Nutella' THEN 200
        WHEN name = 'Cenoura' THEN 200
        WHEN name = 'Água Mineral' THEN 6
        WHEN name = 'Refrigerante' THEN 6
        WHEN name = 'Vela Colorida' THEN 10
        WHEN name = 'Vela Metalizada' THEN 5
        ELSE "minStock"
    END
WHERE name IN (
    'Farinha de Trigo', 'Açúcar Cristal', 'Ovos', 'Manteiga', 'Chocolate em Pó',
    'Leite', 'Corante Alimentício', 'Pasta de Pistache', 'Nutella', 'Cenoura',
    'Água Mineral', 'Refrigerante', 'Vela Colorida', 'Vela Metalizada'
);

-- Inserir movimentações de exemplo (estoque inicial)
INSERT INTO stock_movements ("ingredientId", type, quantity, reason, notes, date)
SELECT 
    id,
    'IN',
    "currentStock",
    'Estoque inicial',
    'Migração para sistema de controle de estoque',
    '2025-07-01 00:00:00'
FROM ingredients 
WHERE "currentStock" > 0;

-- =====================================================
-- 6. VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

-- Verificar se as tabelas foram criadas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
        RAISE EXCEPTION 'Tabela stock_movements não foi criada!';
    END IF;
    
    RAISE NOTICE 'Migração concluída com sucesso!';
    RAISE NOTICE 'Tabela stock_movements criada';
    RAISE NOTICE 'Campos de estoque adicionados à tabela ingredients';
    RAISE NOTICE 'Índices criados para melhor performance';
    RAISE NOTICE 'Dados de exemplo inseridos';
END $$;

-- =====================================================
-- 7. COMANDOS DE VERIFICAÇÃO (EXECUTAR APÓS A MIGRAÇÃO)
-- =====================================================

-- Verificar estrutura da tabela ingredients
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'ingredients' 
-- ORDER BY ordinal_position;

-- Verificar estrutura da tabela stock_movements
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'stock_movements' 
-- ORDER BY ordinal_position;

-- Verificar ingredientes com estoque
-- SELECT name, unit, "currentStock", "minStock",
--        CASE 
--            WHEN "currentStock" <= 0 THEN 'SEM ESTOQUE'
--            WHEN "currentStock" <= "minStock" THEN 'ESTOQUE BAIXO'
--            ELSE 'OK'
--        END as status
-- FROM ingredients 
-- WHERE active = true
-- ORDER BY "currentStock" ASC;

-- Verificar movimentações criadas
-- SELECT COUNT(*) as total_movimentacoes FROM stock_movements;
-- SELECT type, COUNT(*) as quantidade FROM stock_movements GROUP BY type;

-- =====================================================
-- MIGRAÇÃO CONCLUÍDA
-- =====================================================
-- Após executar este SQL:
-- 1. Execute: npm run prisma:generate
-- 2. Teste a conexão: npm run db:test  
-- 3. Inicie o servidor: npm run dev
-- 4. Teste os novos endpoints de estoque e receitas
-- =====================================================
