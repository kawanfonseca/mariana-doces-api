import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';
import { initializeDefaultConfigs } from '../src/controllers/config.controller';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.saleItem.deleteMany();
  await prisma.saleOrder.deleteMany();
  await prisma.costSnapshot.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.laborCostPreset.deleteMany();
  await prisma.packagingUsage.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.packaging.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.config.deleteMany();

  // Criar usuários
  const adminPassword = await hashPassword('admin123');
  const operatorPassword = await hashPassword('operador123');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@marianaDoces.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN'
    }
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: 'operador@marianaDoces.com',
      password: operatorPassword,
      name: 'Operador',
      role: 'OPERATOR'
    }
  });

  console.log('✅ Usuários criados');

  // Inicializar configurações padrão
  await initializeDefaultConfigs();
  console.log('✅ Configurações inicializadas');

  // Criar ingredientes básicos com estoque inicial
  const farinha = await prisma.ingredient.create({
    data: { 
      name: 'Farinha de Trigo', 
      unit: 'g', 
      costPerUnit: 0.008,
      currentStock: 5000,
      minStock: 1000
    }
  });

  const acucar = await prisma.ingredient.create({
    data: { 
      name: 'Açúcar Cristal', 
      unit: 'g', 
      costPerUnit: 0.006,
      currentStock: 3000,
      minStock: 500
    }
  });

  const ovos = await prisma.ingredient.create({
    data: { 
      name: 'Ovos', 
      unit: 'un', 
      costPerUnit: 0.50,
      currentStock: 60,
      minStock: 12
    }
  });

  const manteiga = await prisma.ingredient.create({
    data: { 
      name: 'Manteiga', 
      unit: 'g', 
      costPerUnit: 0.025,
      currentStock: 2000,
      minStock: 500
    }
  });

  const chocolate = await prisma.ingredient.create({
    data: { 
      name: 'Chocolate em Pó', 
      unit: 'g', 
      costPerUnit: 0.035,
      currentStock: 1500,
      minStock: 300
    }
  });

  const leite = await prisma.ingredient.create({
    data: { 
      name: 'Leite', 
      unit: 'ml', 
      costPerUnit: 0.004,
      currentStock: 2000,
      minStock: 500
    }
  });

  const corante = await prisma.ingredient.create({
    data: { 
      name: 'Corante Alimentício', 
      unit: 'ml', 
      costPerUnit: 0.20,
      currentStock: 100,
      minStock: 20
    }
  });

  const pistache = await prisma.ingredient.create({
    data: { 
      name: 'Pasta de Pistache', 
      unit: 'g', 
      costPerUnit: 0.08,
      currentStock: 500,
      minStock: 100
    }
  });

  const nutella = await prisma.ingredient.create({
    data: { 
      name: 'Nutella', 
      unit: 'g', 
      costPerUnit: 0.045,
      currentStock: 800,
      minStock: 200
    }
  });

  const cenoura = await prisma.ingredient.create({
    data: { 
      name: 'Cenoura', 
      unit: 'g', 
      costPerUnit: 0.005,
      currentStock: 1000,
      minStock: 200
    }
  });

  const agua = await prisma.ingredient.create({
    data: { 
      name: 'Água Mineral', 
      unit: 'un', 
      costPerUnit: 0.85,
      currentStock: 24,
      minStock: 6
    }
  });

  const refrigerante = await prisma.ingredient.create({
    data: { 
      name: 'Refrigerante', 
      unit: 'un', 
      costPerUnit: 2.99,
      currentStock: 12,
      minStock: 6
    }
  });

  const velaColorida = await prisma.ingredient.create({
    data: { 
      name: 'Vela Colorida', 
      unit: 'un', 
      costPerUnit: 0.91,
      currentStock: 50,
      minStock: 10
    }
  });

  const velaMetalizada = await prisma.ingredient.create({
    data: { 
      name: 'Vela Metalizada', 
      unit: 'un', 
      costPerUnit: 1.14,
      currentStock: 30,
      minStock: 5
    }
  });

  console.log('✅ Ingredientes criados');

  // Criar embalagens
  const embalagemCookie = await prisma.packaging.create({
    data: { name: 'Saquinho Cookies', unitCost: 0.35 }
  });

  const embalagemMarmita = await prisma.packaging.create({
    data: { name: 'Marmitinha Descartável', unitCost: 1.50 }
  });

  const embalagemBento = await prisma.packaging.create({
    data: { name: 'Caixa Bentô', unitCost: 3.50 }
  });

  const embalagemFatia = await prisma.packaging.create({
    data: { name: 'Caixinha Fatia', unitCost: 1.20 }
  });

  const embalagemBemCasado = await prisma.packaging.create({
    data: { name: 'Papel Seda', unitCost: 0.15 }
  });

  console.log('✅ Embalagens criadas');

  // Criar produtos com base nos dados fornecidos
  const produtos = [
    {
      name: 'Alfajor P',
      channelBasePriceDirect: 8.00,
      channelBasePriceIFood: 11.50,
      ingredientsCost: 3.50,
      packagingCost: 0.30,
      laborCost: 0.45
    },
    {
      name: 'Cookies Tradicional',
      channelBasePriceDirect: 10.00,
      channelBasePriceIFood: 13.90,
      ingredientsCost: 4.71,
      packagingCost: 0.48,
      laborCost: 0.70
    },
    {
      name: 'Cookies Chocolate',
      channelBasePriceDirect: 10.00,
      channelBasePriceIFood: 13.90,
      ingredientsCost: 4.15,
      packagingCost: 0.39,
      laborCost: 0.59
    },
    {
      name: 'Cookies Red Velvet',
      channelBasePriceDirect: 10.00,
      channelBasePriceIFood: 13.90,
      ingredientsCost: 3.21,
      packagingCost: 0.36,
      laborCost: 0.63
    },
    {
      name: 'Cookies Pistache',
      channelBasePriceDirect: 13.00,
      channelBasePriceIFood: 17.90,
      ingredientsCost: 6.36,
      packagingCost: 0.35,
      laborCost: 0.60
    },
    {
      name: 'Marmitinha Brownie',
      channelBasePriceDirect: 20.00,
      channelBasePriceIFood: 27.90,
      ingredientsCost: 5.16,
      packagingCost: 1.96,
      laborCost: 3.75
    },
    {
      name: 'Marmitinha Brownie c/ Nutella',
      channelBasePriceDirect: 25.00,
      channelBasePriceIFood: 31.90,
      ingredientsCost: 7.00,
      packagingCost: 0.90,
      laborCost: 3.75
    },
    {
      name: 'Bentô Cenoura',
      channelBasePriceDirect: 20.00,
      channelBasePriceIFood: 24.90,
      ingredientsCost: 3.51,
      packagingCost: 3.87,
      laborCost: 1.88
    },
    {
      name: 'Bentô Formigueiro',
      channelBasePriceDirect: 20.00,
      channelBasePriceIFood: 24.90,
      ingredientsCost: 6.88,
      packagingCost: 3.34,
      laborCost: 0.63
    },
    {
      name: 'Fatia de Bolo',
      channelBasePriceDirect: 22.00,
      channelBasePriceIFood: 27.90,
      ingredientsCost: 6.96,
      packagingCost: 1.46,
      laborCost: 1.41
    },
    {
      name: 'Bem Casados',
      channelBasePriceDirect: 3.00,
      channelBasePriceIFood: 4.50,
      ingredientsCost: 0.64,
      packagingCost: 0.19,
      laborCost: 0.36
    },
    {
      name: 'Água com gás',
      channelBasePriceDirect: 4.00,
      channelBasePriceIFood: 6.00,
      ingredientsCost: 0.85,
      packagingCost: 0,
      laborCost: 0
    },
    {
      name: 'Água sem gás',
      channelBasePriceDirect: 4.00,
      channelBasePriceIFood: 6.00,
      ingredientsCost: 0.85,
      packagingCost: 0,
      laborCost: 0
    },
    {
      name: 'Refrigerante',
      channelBasePriceDirect: 6.00,
      channelBasePriceIFood: 8.00,
      ingredientsCost: 2.99,
      packagingCost: 0,
      laborCost: 0
    },
    {
      name: 'Vela Colorida',
      channelBasePriceDirect: 1.00,
      channelBasePriceIFood: 1.50,
      ingredientsCost: 0.91,
      packagingCost: 0,
      laborCost: 0
    },
    {
      name: 'Vela Metalizada',
      channelBasePriceDirect: 2.00,
      channelBasePriceIFood: 2.50,
      ingredientsCost: 1.14,
      packagingCost: 0,
      laborCost: 0
    }
  ];

  // Criar os produtos
  for (const produtoData of produtos) {
    const produto = await prisma.product.create({
      data: {
        name: produtoData.name,
        channelBasePriceDirect: produtoData.channelBasePriceDirect,
        channelBasePriceIFood: produtoData.channelBasePriceIFood
      }
    });

    // Criar receitas básicas (simplificadas para o exemplo)
    if (produtoData.name.includes('Cookies')) {
      // Receita básica de cookies
      await prisma.recipeItem.createMany({
        data: [
          { productId: produto.id, ingredientId: farinha.id, qty: 200 },
          { productId: produto.id, ingredientId: acucar.id, qty: 150 },
          { productId: produto.id, ingredientId: manteiga.id, qty: 100 },
          { productId: produto.id, ingredientId: ovos.id, qty: 1 }
        ]
      });

      if (produtoData.name.includes('Chocolate')) {
        await prisma.recipeItem.create({
          data: { productId: produto.id, ingredientId: chocolate.id, qty: 50 }
        });
      }

      if (produtoData.name.includes('Red Velvet')) {
        await prisma.recipeItem.create({
          data: { productId: produto.id, ingredientId: corante.id, qty: 5 }
        });
      }

      if (produtoData.name.includes('Pistache')) {
        await prisma.recipeItem.create({
          data: { productId: produto.id, ingredientId: pistache.id, qty: 30 }
        });
      }

      // Embalagem para cookies
      await prisma.packagingUsage.create({
        data: { productId: produto.id, packagingId: embalagemCookie.id, qty: 1 }
      });

      // Preset de mão de obra para cookies
      await prisma.laborCostPreset.create({
        data: {
          productId: produto.id,
          name: `${produtoData.name} - lote 24`,
          minutesPerBatch: 45,
          batchYield: 24,
          laborRatePerHour: 20.00
        }
      });
    }

    // Receitas específicas para outros produtos
    if (produtoData.name.includes('Marmitinha Brownie')) {
      await prisma.recipeItem.createMany({
        data: [
          { productId: produto.id, ingredientId: chocolate.id, qty: 100 },
          { productId: produto.id, ingredientId: farinha.id, qty: 80 },
          { productId: produto.id, ingredientId: acucar.id, qty: 120 },
          { productId: produto.id, ingredientId: ovos.id, qty: 2 },
          { productId: produto.id, ingredientId: manteiga.id, qty: 80 }
        ]
      });

      if (produtoData.name.includes('Nutella')) {
        await prisma.recipeItem.create({
          data: { productId: produto.id, ingredientId: nutella.id, qty: 50 }
        });
      }

      await prisma.packagingUsage.create({
        data: { productId: produto.id, packagingId: embalagemMarmita.id, qty: 1 }
      });

      await prisma.laborCostPreset.create({
        data: {
          productId: produto.id,
          name: `${produtoData.name} - lote 6`,
          minutesPerBatch: 90,
          batchYield: 6,
          laborRatePerHour: 20.00
        }
      });
    }

    if (produtoData.name.includes('Bentô')) {
      if (produtoData.name.includes('Cenoura')) {
        await prisma.recipeItem.createMany({
          data: [
            { productId: produto.id, ingredientId: cenoura.id, qty: 200 },
            { productId: produto.id, ingredientId: farinha.id, qty: 150 },
            { productId: produto.id, ingredientId: acucar.id, qty: 100 },
            { productId: produto.id, ingredientId: ovos.id, qty: 2 }
          ]
        });
      }

      await prisma.packagingUsage.create({
        data: { productId: produto.id, packagingId: embalagemBento.id, qty: 1 }
      });

      await prisma.laborCostPreset.create({
        data: {
          productId: produto.id,
          name: `${produtoData.name} - lote 8`,
          minutesPerBatch: 60,
          batchYield: 8,
          laborRatePerHour: 20.00
        }
      });
    }

    // Produtos sem receita (bebidas e velas)
    if (produtoData.name.includes('Água')) {
      await prisma.recipeItem.create({
        data: { productId: produto.id, ingredientId: agua.id, qty: 1 }
      });
    }

    if (produtoData.name.includes('Refrigerante')) {
      await prisma.recipeItem.create({
        data: { productId: produto.id, ingredientId: refrigerante.id, qty: 1 }
      });
    }

    if (produtoData.name.includes('Vela Colorida')) {
      await prisma.recipeItem.create({
        data: { productId: produto.id, ingredientId: velaColorida.id, qty: 1 }
      });
    }

    if (produtoData.name.includes('Vela Metalizada')) {
      await prisma.recipeItem.create({
        data: { productId: produto.id, ingredientId: velaMetalizada.id, qty: 1 }
      });
    }
  }

  console.log('✅ Produtos e receitas criados');

  // Criar movimentações de estoque de exemplo
  const ingredientesParaMovimentacao = [farinha, acucar, ovos, manteiga, chocolate];
  
  for (const ingrediente of ingredientesParaMovimentacao) {
    // Movimentação de entrada (compra)
    await prisma.stockMovement.create({
      data: {
        ingredientId: ingrediente.id,
        type: 'IN',
        quantity: ingrediente.currentStock,
        reason: 'Estoque inicial',
        notes: 'Criação do estoque inicial do sistema',
        date: new Date('2025-07-01')
      }
    });

    // Algumas saídas para produção
    if (ingrediente.name === 'Farinha de Trigo') {
      await prisma.stockMovement.create({
        data: {
          ingredientId: ingrediente.id,
          type: 'OUT',
          quantity: 800,
          reason: 'Produção de cookies',
          notes: 'Lote de 48 cookies tradicionais',
          date: new Date('2025-07-20')
        }
      });
    }

    if (ingrediente.name === 'Chocolate em Pó') {
      await prisma.stockMovement.create({
        data: {
          ingredientId: ingrediente.id,
          type: 'OUT',
          quantity: 200,
          reason: 'Produção de brownies',
          notes: 'Lote de 12 marmitinhas de brownie',
          date: new Date('2025-07-22')
        }
      });
    }

    if (ingrediente.name === 'Ovos') {
      await prisma.stockMovement.create({
        data: {
          ingredientId: ingrediente.id,
          type: 'OUT',
          quantity: 12,
          reason: 'Produção mista',
          notes: 'Diversos produtos do dia',
          date: new Date('2025-07-23')
        }
      });
    }
  }

  // Criar alguns ajustes de estoque
  await prisma.stockMovement.create({
    data: {
      ingredientId: corante.id,
      type: 'ADJUSTMENT',
      quantity: 95, // Ajuste para 95ml
      reason: 'Contagem de estoque',
      notes: 'Diferença encontrada na contagem mensal',
      date: new Date('2025-07-25')
    }
  });

  // Simular estoque baixo
  await prisma.stockMovement.create({
    data: {
      ingredientId: pistache.id,
      type: 'OUT',
      quantity: 450,
      reason: 'Produção especial',
      notes: 'Grande pedido de cookies de pistache',
      date: new Date('2025-07-26')
    }
  });

  // Atualizar estoques dos ingredientes baseado nas movimentações
  await prisma.ingredient.update({
    where: { id: farinha.id },
    data: { currentStock: 5000 - 800 } // 4200g
  });

  await prisma.ingredient.update({
    where: { id: chocolate.id },
    data: { currentStock: 1500 - 200 } // 1300g
  });

  await prisma.ingredient.update({
    where: { id: ovos.id },
    data: { currentStock: 60 - 12 } // 48 ovos
  });

  await prisma.ingredient.update({
    where: { id: corante.id },
    data: { currentStock: 95 } // Ajuste para 95ml
  });

  await prisma.ingredient.update({
    where: { id: pistache.id },
    data: { currentStock: 500 - 450 } // 50g (estoque baixo)
  });

  console.log('✅ Movimentações de estoque criadas');

  // Criar vendas de exemplo
  const cookiesTradicional = await prisma.product.findFirst({ where: { name: 'Cookies Tradicional' } });
  const cookiesChocolate = await prisma.product.findFirst({ where: { name: 'Cookies Chocolate' } });
  const cookiesRedVelvet = await prisma.product.findFirst({ where: { name: 'Cookies Red Velvet' } });
  const marmitinhaBrownie = await prisma.product.findFirst({ where: { name: 'Marmitinha Brownie' } });
  const bentoCenoura = await prisma.product.findFirst({ where: { name: 'Bentô Cenoura' } });
  const fatiaBolo = await prisma.product.findFirst({ where: { name: 'Fatia de Bolo' } });

  // Venda 1: 23/07/2025 (iFood)
  if (cookiesTradicional && cookiesChocolate && marmitinhaBrownie && bentoCenoura && fatiaBolo) {
    const venda1 = await prisma.saleOrder.create({
      data: {
        date: new Date('2025-07-23'),
        channel: 'IFOOD',
        grossAmount: 0, // Será calculado
        discounts: 0,
        platformFees: 0, // Será calculado
        costs: 0,
        netAmount: 0, // Será calculado
        items: {
          create: [
            { productId: cookiesTradicional.id, qty: 3, unitPrice: 13.90, lineGross: 41.70, lineDiscount: 0, lineNet: 41.70 },
            { productId: cookiesChocolate.id, qty: 2, unitPrice: 13.90, lineGross: 27.80, lineDiscount: 0, lineNet: 27.80 },
            { productId: marmitinhaBrownie.id, qty: 2, unitPrice: 27.90, lineGross: 55.80, lineDiscount: 0, lineNet: 55.80 },
            { productId: bentoCenoura.id, qty: 4, unitPrice: 24.90, lineGross: 99.60, lineDiscount: 0, lineNet: 99.60 },
            { productId: fatiaBolo.id, qty: 1, unitPrice: 27.90, lineGross: 27.90, lineDiscount: 0, lineNet: 27.90 }
          ]
        }
      }
    });

    const grossAmount1 = 252.80;
    const platformFees1 = grossAmount1 * 0.25;
    const netAmount1 = grossAmount1 - platformFees1;

    await prisma.saleOrder.update({
      where: { id: venda1.id },
      data: {
        grossAmount: grossAmount1,
        platformFees: platformFees1,
        netAmount: netAmount1
      }
    });
  }

  // Venda 2: 24/07/2025 (iFood)
  if (cookiesRedVelvet) {
    const venda2 = await prisma.saleOrder.create({
      data: {
        date: new Date('2025-07-24'),
        channel: 'IFOOD',
        grossAmount: 13.90,
        discounts: 0,
        platformFees: 13.90 * 0.25,
        costs: 0,
        netAmount: 13.90 * 0.75,
        items: {
          create: [
            { productId: cookiesRedVelvet.id, qty: 1, unitPrice: 13.90, lineGross: 13.90, lineDiscount: 0, lineNet: 13.90 }
          ]
        }
      }
    });
  }

  // Venda 3: 26/07/2025 (Direto) - vazio para teste
  await prisma.saleOrder.create({
    data: {
      date: new Date('2025-07-26'),
      channel: 'DIRECT',
      grossAmount: 0,
      discounts: 0,
      platformFees: 0,
      costs: 0,
      netAmount: 0,
      notes: 'Dia sem vendas - registro para controle'
    }
  });

  console.log('✅ Vendas de exemplo criadas');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('👤 Usuários criados:');
  console.log('   Admin: admin@marianaDoces.com / admin123');
  console.log('   Operador: operador@marianaDoces.com / operador123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
