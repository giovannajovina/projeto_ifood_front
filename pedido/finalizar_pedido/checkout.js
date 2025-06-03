document.addEventListener("DOMContentLoaded", async () => {

  async function enviarPedido() {
    const user = JSON.parse(localStorage.getItem("user"));
    const loja = JSON.parse(localStorage.getItem("detalhes_loja"));
    const endereco = JSON.parse(localStorage.getItem("endereco_selecionado"));
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const resumo = JSON.parse(localStorage.getItem("resumoCarrinho"));
    const cartaoId = localStorage.getItem("cartao_id");
    const tipoPagamento = localStorage.getItem("tipo_cartao");
    const cpfNota = document.getElementById("cpf")?.value;
    const token = localStorage.getItem("token");

    const payload = {
      loja_id: loja.id,
      valor_total: parseFloat(localStorage.getItem("subtotal")) + 0.99 + 5.99,
      pagamento_metodo_id: tipoPagamento === "credito" ? 1 : 2,
      dados_cartao_id: parseInt(cartaoId),
      cpf_nota: cpfNota,
      endereco_id: endereco?.id, // ✅ aqui adicionamos
      itens: carrinho.map(item => ({
        produto_id: item.id, // ✅ usando o ID
        quantidade: item.quantidade
      }))

    };


    try {
      const response = await fetch("http://127.0.0.1:8000/api/pedido/finalizar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Erro ao enviar pedido");

      const data = await response.json();
      alert("Pedido realizado com sucesso! ID: " + data.pedido_id);
      localStorage.removeItem("carrinho");
      localStorage.removeItem("resumoCarrinho");
      localStorage.setItem("ultimo_pedido_id", data.pedido_id);
      window.location.href = "../confirmacao/pedido_confirmacao.html";
    } catch (e) {
      console.error(e);
      alert("Falha ao finalizar pedido.");
    }
  }

  const endereco = JSON.parse(localStorage.getItem("endereco_selecionado"));
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;


  //nome da loja
  loja = JSON.parse(localStorage.getItem("detalhes_loja"))
  const lojaItens = document.getElementById("loja-carrinho");
  lojaItens.innerHTML = "";
  lojaItens.innerHTML = loja.nome_fantasia;

  //subtotal e total
  taxaServico = 0.99;
  taxaEntrega = 5.99;

  const subtotalElement = document.getElementById("subtotal-carrinho");
  subtotalLocalStorge = localStorage.getItem("subtotal")
  const subtotalNumerico = parseFloat(subtotalLocalStorge.replace(",", "."));
  subtotalElement.innerText = `R$ ${subtotalNumerico.toFixed(2)}`;

  const totalElement = document.getElementById("total-carrinho");
  const total = subtotalNumerico + taxaServico + taxaEntrega;
  totalElement.innerText = `R$ ${total.toFixed(2)}`;


  //montar itens carrinho

  // Recuperar os dados do localStorage
  const resumoCarrinho = JSON.parse(localStorage.getItem('resumoCarrinho'));

  // Seleciona o container HTML
  containerItens = document.getElementById('itens-carrinho');
  containerItens.innerHTML = "";

  // Exibir os itens
  resumoCarrinho.itens.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.innerHTML = `
        <p>${item.quantidade}x ${item.nome}  - R$${item.total.toFixed(2)}</p>
    `;
    containerItens.appendChild(itemElement);
  });


  // 1. Endereço do localStorage
  if (endereco) {
    document.getElementById("endereco-entrega").innerText =
      `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}`;
  } else {
    document.getElementById("endereco-entrega").innerText = "Endereço não encontrado.";
  }

  // 2. Buscar CPF do usuário pela API
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/usuario/list/${userId}`);
    let data = await response.json();
    let dataU = data[0]
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

  document.getElementById("btn-finalizar").addEventListener("click", () => {
    enviarPedido();
  });



  const token = localStorage.getItem("token");
  const container = document.getElementById("cartao-container");
  const btnAdd = document.getElementById("btn-adicionar-cartao");

  // Recupera o ID e tipo do cartão salvos na sessão
  const cartaoId = sessionStorage.getItem('cartao_id');
  const tipoCartao = sessionStorage.getItem('tipo_cartao');

  if (cartaoId && tipoCartao) {
    // Exibe as informações na tela
    container.innerHTML = `
              <p>Cartão selecionado: ${tipoCartao.charAt(0).toUpperCase() + tipoCartao.slice(1)}</p>
              <p>ID do Cartão: ${cartaoId}</p>
          `;
  } else {
    container.innerText = 'Nenhum cartão selecionado.';
  }




  exibirCartoes();
});
async function exibirCartoes() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("cartao-container");
  const btnAdd = document.getElementById("btn-adicionar-cartao");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/cartao/list", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const cartoes = await response.json();
    const selecionadoId = localStorage.getItem("cartao_id");

    container.innerHTML = "";

    if (cartoes.length > 0) {
      cartoes.forEach(cartao => {
        const isSelecionado = cartao.id == selecionadoId;

        const item = document.createElement("div");
        item.classList.add("cartao-item");
        item.style = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 2px solid ${isSelecionado ? '#EA1D2C' : '#ccc'};
          background-color: ${isSelecionado ? '#fff4f4' : '#fff'};
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 10px;
        `;

        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="https://img.icons8.com/color/48/000000/${cartao.bandeira === 'visa' ? 'visa' : 'mastercard'}-logo.png" width="30" alt="Bandeira">
            <div>
              <strong>${cartao.apelido || 'Cartão'} • ${cartao.bandeira}</strong><br>
              .... ${cartao.ultimos_digitos}
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="selecionarCartao(${cartao.id}, '${cartao.tipo}')" title="Selecionar">✅</button>
            <button onclick="editarCartao(${cartao.id})" title="Editar">✏️</button>
            <button onclick="deletarCartao(${cartao.id})" title="Excluir">🗑️</button>
          </div>
        `;
        container.appendChild(item);
      });
    } else {
      container.innerHTML = "<p>Nenhum cartão cadastrado.</p>";
    }

    btnAdd.style.display = "block";
  } catch (e) {
    console.error("Erro ao carregar cartões:", e);
    container.innerHTML = "<p>Erro ao carregar dados do cartão</p>";
  }
}
window.selecionarCartao = function (id, tipo) {
  localStorage.setItem("cartao_id", id);
  localStorage.setItem("tipo_cartao", tipo);
  exibirCartoes(); // atualiza sem reload
};