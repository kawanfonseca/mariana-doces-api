const fs = require('fs');
const path = require('path');

console.log('📋 Setup do Supabase - Mariana Doces API');
console.log('=====================================');
console.log('');

const action = process.argv[2] || 'help';

if (action === 'full') {
    console.log('🔧 SETUP COMPLETO - Para banco novo:');
    console.log('');
    console.log('1. Acesse seu painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o seguinte SQL:');
    console.log('');
    console.log('=====================================');

    // Ler o arquivo de schema SQL completo
    const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log(schemaSQL);
    
} else if (action === 'migration') {
    console.log('🚀 MIGRAÇÃO - Para adicionar receitas e estoque ao banco existente:');
    console.log('');
    console.log('1. Acesse seu painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o seguinte SQL:');
    console.log('');
    console.log('=====================================');

    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'migrations', 'add_recipes_and_stock.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    
} else if (action === 'complete') {
    console.log('🎯 SISTEMA COMPLETO - Para implementar todas as funcionalidades de estoque:');
    console.log('');
    console.log('1. Acesse seu painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o seguinte SQL:');
    console.log('');
    console.log('=====================================');

    // Ler o arquivo do sistema completo
    const completePath = path.join(__dirname, '..', 'migrations', 'complete_inventory_system.sql');
    const completeSQL = fs.readFileSync(completePath, 'utf8');
    console.log(completeSQL);
    
} else if (action === 'safe') {
    console.log('🛡️ SISTEMA SEGURO - Para implementar funcionalidades de estoque sem dados de exemplo:');
    console.log('');
    console.log('1. Acesse seu painel do Supabase');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole e execute o seguinte SQL:');
    console.log('');
    console.log('=====================================');

    // Ler o arquivo do sistema seguro
    const safePath = path.join(__dirname, '..', 'migrations', 'complete_inventory_system_safe.sql');
    const safeSQL = fs.readFileSync(safePath, 'utf8');
    console.log(safeSQL);
    
} else {
    console.log('🎯 OPÇÕES DISPONÍVEIS:');
    console.log('');
    console.log('Para banco NOVO (setup completo):');
    console.log('  node scripts/setup-supabase.js full');
    console.log('');
    console.log('Para banco EXISTENTE (migração básica):');
    console.log('  node scripts/setup-supabase.js migration');
    console.log('');
    console.log('Para banco EXISTENTE (sistema completo):');
    console.log('  node scripts/setup-supabase.js complete');
    console.log('');
    console.log('Para banco EXISTENTE (sistema seguro - sem dados de exemplo):');
    console.log('  node scripts/setup-supabase.js safe');
    console.log('');
    console.log('Para ver esta ajuda:');
    console.log('  node scripts/setup-supabase.js help');
    console.log('');
    return;
}

console.log('=====================================');
console.log('');
console.log('4. Após executar o SQL, configure suas variáveis de ambiente:');
console.log('');
console.log('DATABASE_URL=sua_url_de_conexão_supabase');
console.log('DIRECT_URL=sua_url_direta_supabase');
console.log('');
console.log('5. Execute: npm run prisma:generate');
console.log('6. Teste a conexão: npm run db:test');
console.log('');
console.log('✅ Setup concluído! O banco estará pronto para uso.');
