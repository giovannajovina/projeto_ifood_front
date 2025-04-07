document.addEventListener("DOMContentLoaded", async () => {
    const endereco = JSON.parse(localStorage.getItem("endereco_selecionado"));
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;
    
    
  
    // 1. Endereço do localStorage
    if (endereco) {
      document.getElementById("endereco-entrega").innerText =
        `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}`;
    } else {
      document.getElementById("endereco-entrega").innerText = "Endereço não encontrado.";
    }
  
    // 2. Buscar CPF do usuário pela API
    try {
      const response = await fetch(`https://clickfood.shop/api/usuario/list/${userId}`);
      let data = await response.json();
      let dataU=data[0]
      console.log(dataU.cpf);
      
  
      const inputCpf = document.getElementById("cpf");
      if (dataU?.cpf) {
        inputCpf.value = dataU.cpf;
      } else {
        inputCpf.placeholder = "Informe o CPF manualmente";
      }
    } catch (e) {
      console.error("Erro ao buscar CPF do usuário:", e);
    }
  
    // (opcional) evento para botão "Fazer pedido"
    document.getElementById("btn-finalizar").addEventListener("click", () => {
      alert("Pedido pronto para ser enviado com os dados acima!");
    });
  });
  