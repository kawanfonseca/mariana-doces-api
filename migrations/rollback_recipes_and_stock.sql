-- =====================================================
-- ROLLBACK: Remover Sistema de Receitas e Controle de Estoque
-- =====================================================
-- Execute este SQL apenas se precisar desfazer as alterações
-- ATENÇÃO: Isso irá APAGAR TODOS os dados de estoque e movimentações!

-- =====================================================
-- 1. REMOVER TRIGGER E FUNÇÃO
-- =====================================================

DROP TRIGGER IF EXISTS update_stock_movements_updated_at ON stock_movements;

-- Nota: A função update_updated_at_column() pode estar sendo usada por outras tabelas
-- Descomente a linha abaixo APENAS se tiver certeza de que não está sendo usada em outros lugares
-- DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- 2. REMOVER ÍNDICES
-- =====================================================

DROP INDEX IF EXISTS idx_ingredients_stock;
DROP INDEX IF EXISTS idx_stock_movements_ingredient;
DROP INDEX IF EXISTS idx_stock_movements_type;
DROP INDEX IF EXISTS idx_stock_movements_date;

-- =====================================================
-- 3. REMOVER TABELA DE MOVIMENTAÇÕES
-- =====================================================

DROP TABLE IF EXISTS stock_movements CASCADE;

-- =====================================================
-- 4. REMOVER CAMPOS DE ESTOQUE DA TABELA INGREDIENTS
-- =====================================================

ALTER TABLE ingredients 
DROP COLUMN IF EXISTS "currentStock",
DROP COLUMN IF EXISTS "minStock";

-- =====================================================
-- 5. VERIFICAÇÃO
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
        RAISE EXCEPTION 'Erro: Tabela stock_movements ainda existe!';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ingredients' AND column_name = 'currentStock') THEN
        RAISE EXCEPTION 'Erro: Campo currentStock ainda existe na tabela ingredients!';
    END IF;
    
    RAISE NOTICE 'Rollback concluído com sucesso!';
    RAISE NOTICE 'Tabela stock_movements removida';
    RAISE NOTICE 'Campos de estoque removidos da tabela ingredients';
    RAISE NOTICE 'Índices removidos';
END $$;

-- =====================================================
-- ROLLBACK CONCLUÍDO
-- =====================================================
-- Após executar este rollback:
-- 1. Execute: npm run prisma:generate
-- 2. Remova as rotas de estoque do servidor se necessário
-- 3. O sistema voltará ao estado anterior
-- =====================================================
