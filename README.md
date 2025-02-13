# Cloudflare Worker Fingerprint

Este projeto é um **Cloudflare Worker** que registra fingerprints de visitantes e armazena os dados em um **banco de dados D1**. Ele possui duas rotas principais:

- `/log` → Registra a fingerprint do navegador no banco de dados.
- `/view` → Exibe os registros armazenados (requer autenticação).


## 🚀 Funcionalidades
- **Captura de Fingerprint**: Salva User-Agent e IP no banco D1.
- **Autenticação na Rota de Visualização**: Apenas usuários autorizados podem acessar os logs.
- **Armazena dados no Cloudflare D1**: Banco de dados serverless.

## 🛠️ Tecnologias Utilizadas
- **Cloudflare Workers** (Servidor)
- **Cloudflare D1** (Banco de Dados SQLite)
- **Javascript**
- **GitHub Projects** (Gerenciador de Tarefas gerenciamento)

## 📌 Como Configurar o Projeto no Cloudflare

### **1️⃣ Criar uma Conta no Cloudflare (Gratuito)**
Acesse **[https://dash.cloudflare.com/](https://dash.cloudflare.com/)**

### **2️⃣ Criando um Worker**
1. Vá até **Compute (Workers)** → **Workers & Pages** → **Create** → **Workers** → **Create Worker**
2. Insira o nome do Worker e substitua pelo código abaixo.
3. Clique em **"Save and Deploy"**.

## 📜 Código do Worker

```javascript
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

  // Define a senha esperada para acesso. Inserir melhoria para armzenar de forma segura
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
```

### **3️⃣ Criando o Banco de Dados D1**
1. Vá até **Storage & Databases** → **D1 SQL Databases**.
2. Clique em **"Create"** e nomeie como `fingerprintdb`.
3. Copie o nome do banco para usar nos bindings.

### **4️⃣ Vinculando o D1 ao Worker**
1. No painel do Worker, vá até **Settings** → **Bindings**.
2. Em **D1 Databases**, clique em **"Add Binding"**.
3. Nomeie como `DB` e selecione o banco `fingerprintdb`.
4. Clique em **Save**.

### **5️⃣ Criando a Tabela no D1**
Vá até **D1 Databases** → **fingerprintdb** → **D1 Console** e execute:

## 📜 Banco de Dados

```sql
CREATE TABLE fingerprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_agent TEXT,
    ip TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠 Como Testar as Rotas

### **1️⃣ Testando a Rota `/log`**
Abra um navegador e acesse:
```
https://SEU-WORKER.workers.dev/log
```
Ele deve retornar `Fingerprint registrado!` e armazenar os dados no banco.
Para verificar se o Banco de dados está com registro, execute o comando abaixo no D1 Console.

## 📜 Código

```
SELECT * FROM fingerprints;
```


### **2️⃣ Testando a Rota `/view` (com Autenticação)**

#### **Via Terminal:**
```
curl -H "Authorization: Bearer meusupersegredoparaacesso" https://SEU-WORKER.workers.dev/view
```
Será retornado um JSON com os registros armazenados

#### **Via Postman:**
1. Crie uma requisição **GET** para `https://SEU-WORKER.workers.dev/view`
2. No cabeçalho (Headers), adicione:
   - **Key:** `Authorization`
   - **Value:** `testeworker`
3. Clique em **Send**.

## 🙇🏻‍♂️ Apredizado
- Documentação Cloudflare - https://developers.cloudflare.com/
- Documentação Javascript - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
- DOM - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model

## 📌 Melhorias Futuras
- Melhorar segurança do token de autenticação
- Criar um painel visual para monitoramento
- Adicionar filtros por data/IP

## 🔗 Links

<p align="center">
 
 <a href="https://www.linkedin.com/in/antoniodamous" alt="Linkedin">
  <img src="https://img.shields.io/badge/-Linkedin-0A66C2?style=for-the-badge&logo=Linkedin&logoColor=FFFFFF&link=https://www.linkedin.com/in/antoniodamous"/> 
 </a>

 </p>
 
## 💻 Autor<br>

<center>
      <a href="https://github.com/antoniodamous"> <center>
       <p align="center"><img src="https://github.com/antoniodamous.png" width="100px;" />
        </a> </p>

<h3 align="center"> Developed by <a href="https://www.linkedin.com/in/antoniodamous/">Antônio Damous</a> ☕</h3>



---


