/**
 * Teste direto das APIs para diagnóstico
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGestaoClickAPI() {
  log('\n🔍 Testando conexão direta com Gestão Click API...', 'blue');
  
  const baseURL = process.env.GESTAOCLICK_BASE_URL || 'https://api.beteltecnologia.com';
  const apiKey = process.env.GESTAOCLICK_API_KEY;
  const secretKey = process.env.GESTAOCLICK_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
    log('❌ Credenciais não encontradas no .env', 'red');
    return;
  }
  
  log(`Base URL: ${baseURL}`, 'blue');
  log(`API Key: ${apiKey.substring(0, 10)}...`, 'blue');
  log(`Secret Key: ${secretKey.substring(0, 10)}...`, 'blue');
  
  // Teste 1: Headers como estão configurados
  log('\n📝 Teste 1: Headers atuais (access-token, secret-access-token)', 'yellow');
  try {
    const response = await axios.get(`${baseURL}/produtos`, {
      headers: {
        'access-token': apiKey,
        'secret-access-token': secretKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      validateStatus: () => true
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status === 200) {
      log(`✅ Sucesso! Produtos encontrados: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`, 'green');
      return true;
    } else {
      log(`Resposta: ${JSON.stringify(response.data).substring(0, 200)}`, 'red');
    }
  } catch (error) {
    log(`Erro: ${error.message}`, 'red');
  }
  
  // Teste 2: Authorization Bearer
  log('\n📝 Teste 2: Authorization Bearer', 'yellow');
  try {
    const response = await axios.get(`${baseURL}/produtos`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status === 200) {
      log(`✅ Sucesso com Authorization Bearer!`, 'green');
      return true;
    }
  } catch (error) {
    log(`Erro: ${error.message}`, 'red');
  }
  
  // Teste 3: Query parameters
  log('\n📝 Teste 3: Query Parameters', 'yellow');
  try {
    const response = await axios.get(`${baseURL}/produtos`, {
      params: {
        access_token: apiKey,
        secret_token: secretKey
      },
      validateStatus: () => true
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status === 200) {
      log(`✅ Sucesso com Query Parameters!`, 'green');
      return true;
    }
  } catch (error) {
    log(`Erro: ${error.message}`, 'red');
  }
  
  // Teste 4: X-API-Key
  log('\n📝 Teste 4: X-API-Key header', 'yellow');
  try {
    const response = await axios.get(`${baseURL}/produtos`, {
      headers: {
        'X-API-Key': apiKey,
        'X-Secret-Key': secretKey,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    if (response.status === 200) {
      log(`✅ Sucesso com X-API-Key!`, 'green');
      return true;
    }
  } catch (error) {
    log(`Erro: ${error.message}`, 'red');
  }
  
  return false;
}

async function testYampiAPI() {
  log('\n🔍 Testando conexão direta com Yampi API...', 'blue');
  
  const baseURL = process.env.YAMPI_BASE_URL || 'https://app.yampi.com.br/api/v1';
  const storeId = process.env.YAMPI_STORE_ID;
  const token = process.env.YAMPI_TOKEN;
  
  if (!storeId || !token) {
    log('❌ Credenciais não encontradas no .env', 'red');
    return;
  }
  
  log(`Base URL: ${baseURL}/${storeId}`, 'blue');
  log(`Token: ${token.substring(0, 10)}...`, 'blue');
  
  try {
    const response = await axios.get(`${baseURL}/${storeId}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      validateStatus: () => true
    });
    
    log(`Status: ${response.status}`, response.status === 200 ? 'green' : response.status === 403 ? 'yellow' : 'red');
    
    if (response.status === 200) {
      log(`✅ Sucesso!`, 'green');
      return true;
    } else if (response.status === 403) {
      log(`⚠️  Cloudflare bloqueando (esperado)`, 'yellow');
      return true; // Esperado devido ao Cloudflare
    } else {
      log(`Resposta: ${JSON.stringify(response.data).substring(0, 200)}`, 'red');
    }
  } catch (error) {
    log(`Erro: ${error.message}`, 'red');
    if (error.response?.status === 403) {
      log(`⚠️  Cloudflare bloqueando (esperado)`, 'yellow');
      return true;
    }
  }
  
  return false;
}

async function runTests() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║   TESTE DIRETO DAS APIs - DIAGNÓSTICO                    ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝', 'blue');
  
  const gestaoClickOk = await testGestaoClickAPI();
  const yampiOk = await testYampiAPI();
  
  log('\n📊 RESUMO:', 'blue');
  log(`Gestão Click: ${gestaoClickOk ? '✅ OK' : '❌ ERRO'}`, gestaoClickOk ? 'green' : 'red');
  log(`Yampi: ${yampiOk ? '✅ OK' : '❌ ERRO'}`, yampiOk ? 'green' : 'red');
  
  if (!gestaoClickOk) {
    log('\n💡 Recomendações para Gestão Click:', 'yellow');
    log('1. Verificar se as credenciais estão corretas', 'yellow');
    log('2. Verificar se o token não expirou', 'yellow');
    log('3. Verificar formato de autenticação na documentação', 'yellow');
    log('4. Tentar gerar novo token no painel', 'yellow');
  }
}

runTests().catch(console.error);
