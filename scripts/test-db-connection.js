const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

async function testConnection() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Testando conexão com o banco de dados...');
  console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@')}`);
  
  try {
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida com sucesso!');
    
    // Testar query simples
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('📊 Versão do PostgreSQL:', result[0].version);
    
    // Listar tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 Tabelas encontradas:', tables.length);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Testar tabela de usuários (se existir)
    try {
      const userCount = await prisma.user.count();
      console.log(`👤 Total de usuários: ${userCount}`);
    } catch (error) {
      console.log('⚠️  Tabela "user" não encontrada. Execute as migrações primeiro.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:');
    console.error(error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Verifique se a senha na DATABASE_URL está correta');
    }
    
    if (error.message.includes('could not connect to server')) {
      console.log('💡 Verifique se o servidor Supabase está acessível');
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 Verifique se o nome do banco na DATABASE_URL está correto');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada.');
  }
}

// Executar teste
testConnection()
  .then(() => {
    console.log('\n✨ Teste concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro durante o teste:', error);
    process.exit(1);
  });
