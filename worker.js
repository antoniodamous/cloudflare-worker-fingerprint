export default {
  async fetch(request, env) {
    // Cria um objeto URL a partir da requisição recebida
    const url = new URL(request.url);
    
    // Verifica se a rota acessada é "/log" e chama a função correspondente
    if (url.pathname === "/log") {
      return await logFingerprint(request, env);
    }
    
    // Verifica se a rota acessada é "/view" e chama a função correspondente
    if (url.pathname === "/view") {
      return await viewFingerprints(request, env);
    }

    // Retorna um erro 404 caso a rota não seja reconhecida
    return new Response("Rota não encontrada", { status: 404 });
  }
};

async function logFingerprint(request, env) {
  // Obtém o User-Agent do cabeçalho da requisição
  const userAgent = request.headers.get("User-Agent");

  // Obtém o IP do usuário a partir do cabeçalho "CF-Connecting-IP" (caso use Cloudflare)
  // Se não for encontrado, define como "Desconhecido"
  const ip = request.headers.get("CF-Connecting-IP") || "Desconhecido";

  // Prepara a query para inserir o User-Agent e IP no banco de dados
  const stmt = env.DB.prepare("INSERT INTO fingerprints (user_agent, ip) VALUES (?, ?)");
  
  // Executa a query
  await stmt.bind(userAgent, ip).run();

  // Retorna uma resposta confirmando o registro
  return new Response("Fingerprint registrado!", { status: 201 });
}

async function viewFingerprints(request, env) {
  // Obtém o cabeçalho de autorização
  const authHeader = request.headers.get("Authorization");

  // Define a senha esperada para acesso (idealmente, isso deveria ser armazenado de forma segura)
  const expectedPassword = "testeworker";
  
  // Verifica se o token de autenticação está correto
  if (authHeader !== `Bearer ${expectedPassword}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  // Prepara a query para buscar todos os registros da tabela, ordenados por timestamp decrescente
  const stmt = env.DB.prepare("SELECT * FROM fingerprints ORDER BY timestamp DESC");
  
  // Executa a query e obtém os resultados
  const { results } = await stmt.all();

  // Retorna os registros no formato JSON
  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
}
