-- SQL para criar todas as tabelas no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- Extensão para gerar IDs únicos (cuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função para gerar CUID (simplificada)
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
BEGIN
  RETURN 'c' || substr(md5(random()::text), 1, 25);
END;
$$ LANGUAGE plpgsql;

-- Tabela de usuários
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'OPERATOR',
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de ingredientes
CREATE TABLE ingredients (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    name TEXT UNIQUE NOT NULL,
    unit TEXT NOT NULL,
    "costPerUnit" DECIMAL(10,2) NOT NULL,
    supplier TEXT,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de embalagens
CREATE TABLE packaging (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    name TEXT UNIQUE NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    name TEXT UNIQUE NOT NULL,
    "channelBasePriceDirect" DECIMAL(10,2),
    "channelBasePriceIFood" DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    "defaultVariantId" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de variantes de produtos
CREATE TABLE product_variants (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "productId" TEXT NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("productId", name),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
);

-- Tabela de itens de receita
CREATE TABLE recipe_items (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "productId" TEXT,
    "variantId" TEXT,
    "ingredientId" TEXT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    "wastePct" DECIMAL(5,2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY ("ingredientId") REFERENCES ingredients(id)
);

-- Tabela de uso de embalagens
CREATE TABLE packaging_usage (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "productId" TEXT,
    "variantId" TEXT,
    "packagingId" TEXT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY ("variantId") REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY ("packagingId") REFERENCES packaging(id)
);

-- Tabela de presets de custo de mão de obra
CREATE TABLE labor_cost_presets (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "productId" TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    "minutesPerBatch" INTEGER NOT NULL,
    "batchYield" INTEGER NOT NULL,
    "laborRatePerHour" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
);

-- Tabela de movimentações de estoque
CREATE TABLE inventory_movements (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    type TEXT NOT NULL,
    entity TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    "unitCost" DECIMAL(10,2),
    note TEXT,
    date TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("entityId") REFERENCES ingredients(id),
    FOREIGN KEY ("entityId") REFERENCES packaging(id),
    FOREIGN KEY ("entityId") REFERENCES products(id)
);

-- Tabela de pedidos de venda
CREATE TABLE sale_orders (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    date TIMESTAMP NOT NULL,
    channel TEXT NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    discounts DECIMAL(10,2) DEFAULT 0,
    "platformFees" DECIMAL(10,2) DEFAULT 0,
    costs DECIMAL(10,2) DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    notes TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens de venda
CREATE TABLE sale_items (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    qty DECIMAL(10,3) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineGross" DECIMAL(10,2) NOT NULL,
    "lineDiscount" DECIMAL(10,2) DEFAULT 0,
    "lineNet" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("orderId") REFERENCES sale_orders(id) ON DELETE CASCADE,
    FOREIGN KEY ("productId") REFERENCES products(id),
    FOREIGN KEY ("variantId") REFERENCES product_variants(id)
);

-- Tabela de promoções
CREATE TABLE promotions (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    name TEXT NOT NULL,
    channel TEXT,
    "percentOff" DECIMAL(5,2),
    "valueOff" DECIMAL(10,2),
    "activeFrom" TIMESTAMP NOT NULL,
    "activeTo" TIMESTAMP NOT NULL,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Tabela de snapshots de custo
CREATE TABLE cost_snapshots (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    "productId" TEXT,
    "variantId" TEXT,
    "ingredientsCost" DECIMAL(10,2) NOT NULL,
    "packagingCost" DECIMAL(10,2) NOT NULL,
    "laborCost" DECIMAL(10,2) NOT NULL,
    "overheadCost" DECIMAL(10,2) DEFAULT 0,
    "totalUnitCost" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id),
    FOREIGN KEY ("variantId") REFERENCES product_variants(id)
);

-- Tabela de configurações
CREATE TABLE config (
    id TEXT PRIMARY KEY DEFAULT generate_cuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_packaging_name ON packaging(name);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_sale_orders_date ON sale_orders(date);
CREATE INDEX idx_sale_orders_channel ON sale_orders(channel);
CREATE INDEX idx_inventory_movements_entity ON inventory_movements(entity, "entityId");
CREATE INDEX idx_recipe_items_product ON recipe_items("productId");
CREATE INDEX idx_recipe_items_variant ON recipe_items("variantId");
CREATE INDEX idx_packaging_usage_product ON packaging_usage("productId");
CREATE INDEX idx_packaging_usage_variant ON packaging_usage("variantId");

-- Triggers para atualizar updatedAt automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packaging_updated_at BEFORE UPDATE ON packaging FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_items_updated_at BEFORE UPDATE ON recipe_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packaging_usage_updated_at BEFORE UPDATE ON packaging_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labor_cost_presets_updated_at BEFORE UPDATE ON labor_cost_presets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sale_orders_updated_at BEFORE UPDATE ON sale_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin inicial
-- Senha: admin123 (hash bcrypt correto)
INSERT INTO users (id, email, password, name, role, active) VALUES (
    'admin-001',
    'admin@marianaDoces.com',
    '$2a$12$oCQ0Kt/edb1FobSITO9AnuK6lccKjZbCtmf.IKVlw3Xy2KcT4qQhm', -- admin123
    'Administrador',
    'ADMIN',
    true
);

-- Inserir algumas configurações iniciais
INSERT INTO config (id, key, value, description) VALUES 
    ('config-001', 'ifood_fee_percent', '25', 'Percentual da taxa do iFood'),
    ('config-002', 'default_margin_percent', '100', 'Margem padrão para produtos'),
    ('config-003', 'company_name', 'Mariana Doces', 'Nome da empresa'),
    ('config-004', 'company_phone', '', 'Telefone da empresa'),
    ('config-005', 'company_address', '', 'Endereço da empresa');
