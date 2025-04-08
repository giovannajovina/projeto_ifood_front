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

    
    const token = localStorage.getItem("token");
  const container = document.getElementById("cartao-container");
  const btnAdd = document.getElementById("btn-adicionar-cartao");

  try {
    const response = await fetch("http://localhost:8000/api/cartao", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartoes = await response.json();

    if (cartoes.length > 0) {
      const cartao = cartoes[0]; // Pegamos o primeiro

      container.innerHTML = `
        <div class="cartao-item">
          <img src="https://img.icons8.com/color/48/000000/mastercard.png" width="32" />
          <div>
            <strong>${cartao.nome} • ${cartao.bandeira}</strong><br>
            .... ${cartao.ultimos_digitos}
          </div>
          <div class="icones">
            <button class="icon-btn" onclick="editarCartao(${cartao.id})">
              ✏️
            </button>
            <button class="icon-btn" onclick="deletarCartao(${cartao.id})">
              🗑️
            </button>
          </div>
        </div>
      `;

      // Esconde o botão adicionar
      btnAdd.style.display = "none";
    } else {
      container.innerHTML = "";
      btnAdd.style.display = "block";
    }
  } catch (e) {
    console.error("Erro ao carregar cartão:", e);
    container.innerHTML = "<p>Erro ao carregar dados do cartão</p>";
  }

  });
  