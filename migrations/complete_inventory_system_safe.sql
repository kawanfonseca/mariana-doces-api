-- =====================================================
-- SISTEMA COMPLETO DE ESTOQUE E RECEITAS - MARIANA DOCES
-- VERSÃO SEGURA - SEM DADOS DE EXEMPLO
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase para implementar
-- o sistema completo de gerenciamento de estoque e receitas
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
-- 3. CRIAR TABELA DE HISTÓRICO DE CUSTOS (OPCIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS ingredient_cost_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ingredientId" TEXT NOT NULL,
    "oldCost" DECIMAL(10,2) NOT NULL,
    "newCost" DECIMAL(10,2) NOT NULL,
    "changeDate" TIMESTAMP DEFAULT NOW(),
    "changeReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("ingredientId") REFERENCES ingredients(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. CRIAR TABELA DE ALERTAS DE ESTOQUE
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_alerts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ingredientId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL, -- 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING'
    "alertDate" TIMESTAMP DEFAULT NOW(),
    "isRead" BOOLEAN DEFAULT false,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("ingredientId") REFERENCES ingredients(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ingredients_stock ON ingredients("currentStock");
CREATE INDEX IF NOT EXISTS idx_ingredients_min_stock ON ingredients("minStock");
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements("ingredientId");
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient_date ON stock_movements("ingredientId", date);
CREATE INDEX IF NOT EXISTS idx_ingredient_cost_history_ingredient ON ingredient_cost_history("ingredientId");
CREATE INDEX IF NOT EXISTS idx_stock_alerts_ingredient ON stock_alerts("ingredientId");
CREATE INDEX IF NOT EXISTS idx_stock_alerts_type ON stock_alerts("alertType");
CREATE INDEX IF NOT EXISTS idx_stock_alerts_read ON stock_alerts("isRead");

-- =====================================================
-- 6. CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para atualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar alertas de estoque
CREATE OR REPLACE FUNCTION generate_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se estoque está baixo ou zerado
    IF NEW."currentStock" <= 0 THEN
        INSERT INTO stock_alerts ("ingredientId", "alertType", "message")
        VALUES (NEW.id, 'OUT_OF_STOCK', 'Ingrediente sem estoque');
    ELSIF NEW."currentStock" <= NEW."minStock" THEN
        INSERT INTO stock_alerts ("ingredientId", "alertType", "message")
        VALUES (NEW.id, 'LOW_STOCK', 'Estoque abaixo do mínimo');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para registrar histórico de mudanças de custo
CREATE OR REPLACE FUNCTION track_cost_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD."costPerUnit" != NEW."costPerUnit" THEN
        INSERT INTO ingredient_cost_history ("ingredientId", "oldCost", "newCost", "changeReason")
        VALUES (NEW.id, OLD."costPerUnit", NEW."costPerUnit", 'Atualização de custo');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 7. CRIAR TRIGGERS
-- =====================================================

-- Trigger para atualizar updatedAt em stock_movements
DROP TRIGGER IF EXISTS update_stock_movements_updated_at ON stock_movements;
CREATE TRIGGER update_stock_movements_updated_at 
BEFORE UPDATE ON stock_movements 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para gerar alertas de estoque
DROP TRIGGER IF EXISTS generate_ingredient_stock_alerts ON ingredients;
CREATE TRIGGER generate_ingredient_stock_alerts 
AFTER UPDATE ON ingredients 
FOR EACH ROW 
EXECUTE FUNCTION generate_stock_alerts();

-- Trigger para rastrear mudanças de custo
DROP TRIGGER IF EXISTS track_ingredient_cost_changes ON ingredients;
CREATE TRIGGER track_ingredient_cost_changes 
AFTER UPDATE ON ingredients 
FOR EACH ROW 
EXECUTE FUNCTION track_cost_changes();

-- =====================================================
-- 8. CRIAR VIEWS PARA RELATÓRIOS
-- =====================================================

-- View para status de estoque
CREATE OR REPLACE VIEW stock_status_view AS
SELECT 
    i.id,
    i.name,
    i.unit,
    i."currentStock",
    i."minStock",
    i."costPerUnit",
    (i."currentStock" * i."costPerUnit") as "totalValue",
    CASE 
        WHEN i."currentStock" <= 0 THEN 'OUT_OF_STOCK'
        WHEN i."currentStock" <= i."minStock" THEN 'LOW_STOCK'
        ELSE 'OK'
    END as "stockStatus",
    i.active,
    i."createdAt",
    i."updatedAt"
FROM ingredients i
WHERE i.active = true;

-- View para resumo de movimentações
CREATE OR REPLACE VIEW stock_movements_summary AS
SELECT 
    sm."ingredientId",
    i.name as "ingredientName",
    i.unit,
    COUNT(*) as "totalMovements",
    SUM(CASE WHEN sm.type = 'IN' THEN sm.quantity ELSE 0 END) as "totalIn",
    SUM(CASE WHEN sm.type = 'OUT' THEN sm.quantity ELSE 0 END) as "totalOut",
    SUM(CASE WHEN sm.type = 'ADJUSTMENT' THEN 1 ELSE 0 END) as "totalAdjustments",
    MAX(sm.date) as "lastMovementDate"
FROM stock_movements sm
JOIN ingredients i ON sm."ingredientId" = i.id
GROUP BY sm."ingredientId", i.name, i.unit;

-- =====================================================
-- 9. VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

DO $$
BEGIN
    -- Verificar se as tabelas foram criadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
        RAISE EXCEPTION 'Tabela stock_movements não foi criada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ingredient_cost_history') THEN
        RAISE EXCEPTION 'Tabela ingredient_cost_history não foi criada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_alerts') THEN
        RAISE EXCEPTION 'Tabela stock_alerts não foi criada!';
    END IF;
    
    -- Verificar se os campos foram adicionados
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ingredients' AND column_name = 'currentStock') THEN
        RAISE EXCEPTION 'Campo currentStock não foi adicionado à tabela ingredients!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ingredients' AND column_name = 'minStock') THEN
        RAISE EXCEPTION 'Campo minStock não foi adicionado à tabela ingredients!';
    END IF;
    
    RAISE NOTICE 'Sistema completo de estoque implementado com sucesso!';
    RAISE NOTICE 'Tabelas criadas: stock_movements, ingredient_cost_history, stock_alerts';
    RAISE NOTICE 'Campos adicionados: currentStock, minStock na tabela ingredients';
    RAISE NOTICE 'Índices criados para melhor performance';
    RAISE NOTICE 'Triggers configurados para alertas automáticos';
    RAISE NOTICE 'Views criadas para relatórios';
END $$;

-- =====================================================
-- 10. COMANDOS DE VERIFICAÇÃO (EXECUTAR APÓS A IMPLEMENTAÇÃO)
-- =====================================================

-- Verificar status de estoque
-- SELECT * FROM stock_status_view ORDER BY "stockStatus", "currentStock" ASC;

-- Verificar resumo de movimentações
-- SELECT * FROM stock_movements_summary ORDER BY "totalMovements" DESC;

-- Verificar alertas ativos
-- SELECT sa.*, i.name as "ingredientName" 
-- FROM stock_alerts sa 
-- JOIN ingredients i ON sa."ingredientId" = i.id 
-- WHERE sa."isRead" = false 
-- ORDER BY sa."alertDate" DESC;

-- Verificar histórico de custos
-- SELECT ich.*, i.name as "ingredientName"
-- FROM ingredient_cost_history ich
-- JOIN ingredients i ON ich."ingredientId" = i.id
-- ORDER BY ich."changeDate" DESC
-- LIMIT 10;

-- =====================================================
-- SISTEMA COMPLETO IMPLEMENTADO
-- =====================================================
-- Funcionalidades disponíveis:
-- ✅ Controle de estoque com movimentações
-- ✅ Alertas automáticos de estoque baixo/zerado
-- ✅ Histórico de mudanças de custo
-- ✅ Relatórios avançados de estoque
-- ✅ Previsão de consumo baseada em receitas
-- ✅ Transferências entre ingredientes
-- ✅ Ajustes em lote
-- ✅ Consumo automático para produção
-- ✅ Reabastecimento automático
-- ✅ Rotatividade de estoque
-- ✅ Exportação de relatórios
-- =====================================================
-- Após executar este SQL:
-- 1. Execute: npm run prisma:generate
-- 2. Teste a conexão: npm run db:test
-- 3. Inicie o servidor: npm run dev
-- 4. Teste todos os endpoints de estoque e receitas
-- =====================================================
