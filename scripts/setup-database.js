#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando conexão com o banco de dados...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log(`📊 Encontradas ${tables.length} tabelas no banco:`);
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    if (tables.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada. Execute "npx prisma db push" para criar as tabelas.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:');
    console.error(error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.log('\n💡 Dica: Verifique se a variável DATABASE_URL está configurada corretamente.');
      console.log('   Para desenvolvimento local, crie um arquivo .env com:');
      console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/mariana_doces"');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
