document.addEventListener("DOMContentLoaded", async () => {
  const headerPlaceholder = document.getElementById("header-placeholder");

  if (headerPlaceholder) {
    try {
      const depth = window.location.pathname
        .replace(/\/$/, "")
        .split("/")
        .filter(Boolean).length;

      const pathToRoot = "../".repeat(depth - 1);
      const headerPath = `${pathToRoot}pagina_inicial/header_component/header.html`;

      const response = await fetch(headerPath);
      const html = await response.text();

      // Cria um elemento temporário pra parsear os scripts e estilos
      const temp = document.createElement("div");
      temp.innerHTML = html;

      // Carrega os <link rel="stylesheet">
      temp.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.href = link.href;
        document.head.appendChild(newLink);
      });

      // Carrega os <script src="...">
      temp.querySelectorAll('script[src]').forEach(script => {
        const newScript = document.createElement("script");
        newScript.src = script.src;
        newScript.defer = true;
        document.body.appendChild(newScript);
      });

      // Remove os <script> e <link> do HTML para não duplicar
      temp.querySelectorAll('script, link[rel="stylesheet"]').forEach(el => el.remove());

      // Insere só o conteúdo visual no DOM
      headerPlaceholder.innerHTML = temp.innerHTML;

      // Emite evento customizado
      window.dispatchEvent(new Event("headerLoaded"));

      console.log("✅ Header carregado de:", headerPath);
    } catch (error) {
      console.error("❌ Erro ao carregar o header:", error);
    }
  }
});
