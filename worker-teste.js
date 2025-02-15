//Adicionada rota /fingerprint.js para captura
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/fingerprint.js") {
      return serveFingerprintScript();
    }

    if (url.pathname === "/log") {
      return await logFingerprint(request, env);
    }

    if (url.pathname === "/view") {
      return await viewFingerprints(request, env);
    }

    return new Response("Rota não encontrada", { status: 404 });
  }
};

function serveFingerprintScript() {
  const scriptContent = `
    async function sendFingerprint() {
      const fingerprint = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: { width: screen.width, height: screen.height },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer
      };

      await fetch('/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fingerprint)
      });
    }

    sendFingerprint();
  `;

  return new Response(scriptContent, {
    headers: { "Content-Type": "application/javascript" }
  });
};
//Função para salvar os dados recebidos
async function logFingerprint(request, env) {
  if (request.method !== "POST") {
    return new Response("Método não permitido", { status: 405 });
  }

  const data = await request.json();

  const stmt = env.DB.prepare(
    `INSERT INTO fingerprints (user_agent, platform, language, screen_width, screen_height, timezone, referrer, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  await stmt
    .bind(
      data.userAgent,
      data.platform,
      data.language,
      data.screen.width,
      data.screen.height,
      data.timezone,
      data.referrer,
      request.headers.get("CF-Connecting-IP") || "Desconhecido"
    )
    .run();

  return new Response("Fingerprint registrado!", { status: 201 });
};
