const bcrypt = require('bcryptjs');

// Testar o hash que está no banco
const hashFromDB = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
const password = 'admin123';

console.log('🔍 Testando hash da senha...');
console.log('Hash do banco:', hashFromDB);
console.log('Senha testada:', password);

bcrypt.compare(password, hashFromDB)
  .then(result => {
    console.log('✅ Resultado da comparação:', result);
    if (result) {
      console.log('🎉 Hash está correto!');
    } else {
      console.log('❌ Hash está incorreto!');
      console.log('🔧 Gerando novo hash...');
      return bcrypt.hash(password, 12);
    }
  })
  .then(newHash => {
    if (newHash) {
      console.log('🆕 Novo hash gerado:', newHash);
      console.log('📝 Use este hash no banco de dados');
    }
  })
  .catch(err => {
    console.error('❌ Erro:', err);
  });
