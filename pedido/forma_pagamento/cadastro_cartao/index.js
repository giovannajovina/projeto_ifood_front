document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo");
  
    const titulo = document.getElementById("titulo-cartao");
    if (tipo) {
      let nome = tipo.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
      titulo.innerText = `Adicionar cartão de ${nome}`;
    }
  
    document.getElementById("formCartao").addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Cartão salvo com sucesso!");
      // Aqui você poderia salvar os dados no localStorage ou enviar para uma API
      window.location.href = "checkout.html";
    });
  });
  