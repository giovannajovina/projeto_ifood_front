document.addEventListener("DOMContentLoaded", async () => {
    const lojaId = localStorage.getItem("loja_id");

    if (!lojaId) {
        alert("Loja não selecionada.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response_loja = await fetch(`https://clickfood.shop/api/loja/${lojaId}`);
        const data = await response_loja.json();
        localStorage.setItem("detalhes_loja", JSON.stringify(data));


        document.getElementById("logo-loja").src = data.logo || "https://via.placeholder.com/60";
        document.getElementById("nome-loja").textContent = data.nome_fantasia;
        document.getElementById("nota-loja").textContent = data.nota || "4.5"; // substitua se você tiver esse campo


        const response_produtos_loja = await fetch(`https://clickfood.shop/api/lojas/${lojaId}/produtos`);
        const produtos = await response_produtos_loja.json();

        console.log(produtos); // Confirma o retorno

        if (!Array.isArray(produtos) || produtos.length === 0) {
            alert("Nenhum produto encontrado.");
            return;
        }

        const container = document.getElementById("produtos-destaque");
        container.innerHTML = "";

        produtos.forEach(produto => {
            const div = document.createElement("div");
            div.classList.add("produto-card");
          
            div.innerHTML = `
              <img src="${produto.imagem}" alt="${produto.nome}">
              <h3>${produto.nome}</h3>
              <p>${produto.descricao || ''}</p>
              <strong>R$ ${parseFloat(produto.valor_unitario).toFixed(2)}</strong>
            `;
          
            div.addEventListener("click", () => abrirModalProduto(produto));
            container.appendChild(div);
          });
          

    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        alert("Falha ao carregar dados da loja.");
    }
    document.getElementById("btn-ver-mais").addEventListener("click", () => {
        document.getElementById("modal-detalhes-loja").classList.add("ativo");
    
        const dataLoja = localStorage.getItem("detalhes_loja");
        if (dataLoja) {
            const loja = JSON.parse(dataLoja);
            document.getElementById("aba-sobre").innerHTML = `
                ${loja.descricao || "Descrição não disponível"}<br><br>
                <strong>Endereço:</strong><br>
                ${loja.endereco || "Endereço não informado"}<br>
                ${loja.cidade || "Cidade não informada"} - ${loja.estado || "UF"}, CEP: ${loja.cep || "00000-000"}<br><br>
                <strong>CNPJ:</strong><br>${loja.cnpj || "Não disponível"}
            `;
        }
    });
    
    // 🔥 Agora tornamos as funções globais:
    window.fecharModal = function () {
        document.getElementById("modal-detalhes-loja").classList.remove("ativo");
    };
    
    window.mudarAba = function (aba) {
        document.querySelectorAll('.aba-conteudo').forEach(e => e.classList.remove('ativo'));
        document.querySelectorAll('.abas li').forEach(e => e.classList.remove('ativo'));
    
        document.getElementById(`aba-${aba}`).classList.add('ativo');
        document.querySelector(`.abas li[onclick="mudarAba('${aba}')"]`).classList.add('ativo');
    };


let quantidadeSelecionada = 1;
let precoAtual = 0;

window.abrirModalProduto = function (produto) {
    quantidadeSelecionada = 1;
    precoAtual = parseFloat(produto.valor_unitario);

    document.getElementById("modal-img-produto").src = produto.imagem;
    document.getElementById("modal-nome-produto").innerText = produto.nome;
    document.getElementById("modal-descricao-produto").innerText = produto.descricao || "";
    document.getElementById("modal-preco-produto").innerText = `R$ ${precoAtual.toFixed(2)}`;

    const loja = JSON.parse(localStorage.getItem("detalhes_loja"));
    document.getElementById("modal-loja-nome").innerText = loja?.nome_fantasia || "";
    document.getElementById("modal-loja-avaliacao").innerText = `⭐ ${loja?.nota || "4.5"}`;

    document.getElementById("comentario").value = "";
    document.getElementById("quantidade-produto").innerText = quantidadeSelecionada;
    document.getElementById("modal-total-produto").innerText = `R$ ${(precoAtual * quantidadeSelecionada).toFixed(2)}`;

    document.getElementById("btn-adicionar").onclick = () => {
        const observacao = document.getElementById("comentario").value;
        const itemCarrinho = {
            id: produto.id,
            nome: produto.nome,
            preco: precoAtual,
            imagem: produto.imagem,
            quantidade: quantidadeSelecionada,
            observacao: observacao
        };

        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho.push(itemCarrinho);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));

        atualizarCarrinho();
        fecharModalProduto();
    };

    document.getElementById("modal-produto").classList.add("ativo");
};
window.abrirCarrinho = function () {
    document.getElementById("modal-carrinho").classList.add("ativo");
    atualizarCarrinho();
  };
  
  window.fecharCarrinho = function () {
    document.getElementById("modal-carrinho").classList.remove("ativo");
  };
  window.atualizarCarrinho = function () {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    const container = document.getElementById("itens-carrinho");
    const subtotalElement = document.getElementById("subtotal-carrinho");
    const totalElement = document.getElementById("total-carrinho");
    const qtdElement = document.getElementById("qtd-carrinho");
    const loja = JSON.parse(localStorage.getItem("detalhes_loja"));

    container.innerHTML = "";

    const agrupado = {};
    carrinho.forEach(item => {
        const chave = item.id + "|" + (item.observacao || "");
        if (!agrupado[chave]) {
            agrupado[chave] = { ...item };
        } else {
            agrupado[chave].quantidade += item.quantidade;
        }
    });

    let subtotal = 0;
    Object.values(agrupado).forEach(item => {
        const totalItem = item.preco * item.quantidade;
        subtotal += totalItem;

        const div = document.createElement("div");
        div.innerHTML = `
            <p><strong>${item.quantidade}x</strong> ${item.nome} — R$ ${totalItem.toFixed(2)}</p>
            ${item.observacao ? `<small>${item.observacao}</small>` : ""}
            <hr>
        `;
        container.appendChild(div);
    });

    const taxaServico = 0.99;
    const taxaEntrega = 10.99;
    const total = subtotal + taxaServico + taxaEntrega;

    subtotalElement.innerText = `R$ ${subtotal.toFixed(2)}`;
    totalElement.innerText = `R$ ${total.toFixed(2)}`;
    qtdElement.innerText = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    document.getElementById("loja-carrinho").innerText = loja?.nome_fantasia || "";
};


  

window.fecharModalProduto = function () {
    document.getElementById("modal-produto").classList.remove("ativo");
}

window.alterarQuantidade = function (delta) {
    quantidadeSelecionada = Math.max(1, quantidadeSelecionada + delta);
    document.getElementById("quantidade-produto").innerText = quantidadeSelecionada;
    document.getElementById("modal-total-produto").innerText = `R$ ${(precoAtual * quantidadeSelecionada).toFixed(2)}`;
};
window.finalizarPedido = function () {
    window.location.href = "../pedido/finalizar_pedido/checkout.html";
};
    
});
