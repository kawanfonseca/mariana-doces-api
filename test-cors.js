// Script para testar CORS
const https = require('https');

const testCORS = () => {
  console.log('🧪 Testando configuração de CORS...\n');
  
  const options = {
    hostname: 'mariana-doces-api.vercel.app',
    port: 443,
    path: '/health',
    method: 'GET',
    headers: {
      'Origin': 'https://mariana-doces-app.vercel.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    console.log(`📋 Headers CORS:`);
    console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NÃO DEFINIDO'}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📄 Response: ${data}`);
      
      if (res.headers['access-control-allow-origin'] === 'https://mariana-doces-app.vercel.app') {
        console.log('\n🎉 CORS configurado corretamente!');
      } else {
        console.log('\n❌ CORS não está configurado corretamente.');
        console.log('💡 Faça um novo deploy da API para aplicar as mudanças.');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Erro na requisição: ${e.message}`);
  });

  req.end();
};

// Testar também o endpoint de login
const testLoginCORS = () => {
  console.log('\n🔐 Testando CORS no endpoint de login...\n');
  
  const options = {
    hostname: 'mariana-doces-api.vercel.app',
    port: 443,
    path: '/api/auth/login',
    method: 'OPTIONS', // Preflight request
    headers: {
      'Origin': 'https://mariana-doces-app.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Status OPTIONS: ${res.statusCode}`);
    console.log(`📋 Headers CORS:`);
    console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NÃO DEFINIDO'}`);
    console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NÃO DEFINIDO'}`);
    
    if (res.statusCode === 200 && res.headers['access-control-allow-origin']) {
      console.log('\n🎉 Preflight request funcionando!');
    } else {
      console.log('\n❌ Preflight request falhou.');
    }
  });

  req.on('error', (e) => {
    console.error(`❌ Erro na requisição OPTIONS: ${e.message}`);
  });

  req.end();
};

// Executar testes
testCORS();
setTimeout(testLoginCORS, 2000);
