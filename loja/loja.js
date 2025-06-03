document.addEventListener("DOMContentLoaded", async () => {
    const lojaId = localStorage.getItem("loja_id");

    if (!lojaId) {
        alert("Loja não selecionada.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response_loja = await fetch(`http://127.0.0.1:8000/api/loja/${lojaId}`);
        const data = await response_loja.json();
        localStorage.setItem("detalhes_loja", JSON.stringify(data));


        document.getElementById("logo-loja").src = data.logo || "https://via.placeholder.com/60";
        document.getElementById("nome-loja").textContent = data.nome_fantasia;
        document.getElementById("nota-loja").textContent = data.nota || "4.5"; // substitua se você tiver esse campo


        const response_produtos_loja = await fetch(`http://127.0.0.1:8000/api/lojas/${lojaId}/produtos`);
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

            const chave = itemCarrinho.id + "|" + (itemCarrinho.observacao || "");
            let itemExistente = carrinho.find(item => (item.id + "|" + (item.observacao || "")) === chave);

            if (itemExistente) {
                itemExistente.quantidade += quantidadeSelecionada;
            } else {
                carrinho.push(itemCarrinho);
            }

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
        Object.entries(agrupado).forEach(([chave, item]) => {
            const totalItem = item.preco * item.quantidade;
            subtotal += totalItem;

            const div = document.createElement("div");
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                    <p style="margin: 0;"><strong>${item.nome}</strong></p>
                    ${item.observacao ? `<small>${item.observacao}</small><br>` : ""}
                    <small>Valor unitário: R$ ${item.preco.toFixed(2)}</small>
                    </div>
                    <div style="text-align: right;">
                    <p style="margin: 0;"><strong>R$ ${(item.preco * item.quantidade).toFixed(2)}</strong></p>
                    <div class="acoes-carrinho">
                        <button onclick="alterarQuantidadeItem('${chave}', -1)">−</button>
                        <span>${item.quantidade}x</span>
                        <button onclick="alterarQuantidadeItem('${chave}', 1)">+</button>
                        <button class="remover" onclick="removerItemCarrinho('${chave}')">🗑️</button>
                    </div>
                    </div>
                </div>
                <hr>
                `;


            container.appendChild(div);
        });

        const taxaServico = 0.99;
        const taxaEntrega = 5.99;
        const total = subtotal + taxaServico + taxaEntrega;

        subtotalElement.innerText = `R$ ${subtotal.toFixed(2)}`;
        totalElement.innerText = `R$ ${total.toFixed(2)}`;
        if (qtdElement) {
            qtdElement.innerText = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
        }
        document.getElementById("loja-carrinho").innerText = loja?.nome_fantasia || "";
    };



    // let subtotal = 0;
    // Object.entries(agrupado).forEach(([chave, item]) => {
    //     const totalItem = item.preco * item.quantidade;
    //     subtotal += totalItem;

    //     const div = document.createElement("div");
    //     div.innerHTML = `
    //     <p>
    //         <strong>${item.nome}</strong><br>
    //         ${item.observacao ? `<small>${item.observacao}</small><br>` : ""}
    //         <button onclick="alterarQuantidadeItem('${chave}', -1)">−</button>
    //         <span>${item.quantidade}x</span>
    //         <button onclick="alterarQuantidadeItem('${chave}', 1)">+</button>
    //         <button onclick="removerItemCarrinho('${chave}')">🗑️</button>
    //     </p>
    //     <p>Subtotal: R$ ${totalItem.toFixed(2)}</p>
    //     <hr>
    // `;
    //     container.appendChild(div);
    // });




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
        const subtotal = document.getElementById('subtotal-carrinho');
        const valorTexto = subtotal.textContent.trim(); // Remove espaços extras
        const valorSomenteNumero = valorTexto.replace("R$", "").trim();
        // console.log(valorSomenteNumero);
        const valorNumerico = parseFloat(valorSomenteNumero.replace(",", "."));
        // console.log(valorNumerico);

        localStorage.setItem("subtotal", valorNumerico);
        gerarResumoCarrinho();
    };

    // Função para gerar o resumo do carrinho
    function gerarResumoCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');

        const resumoMap = {};

        carrinho.forEach(item => {
            const chave = item.id + '|' + (item.observacao || '');

            if (!resumoMap[chave]) {
                resumoMap[chave] = {
                    produto_id: item.id, // ✅ adicionando o id real
                    nome: item.nome,
                    preco: parseFloat(item.preco),
                    quantidade: item.quantidade,
                    observacao: item.observacao,
                    total: parseFloat(item.preco) * item.quantidade
                };
            } else {
                resumoMap[chave].quantidade += item.quantidade;
                resumoMap[chave].total += parseFloat(item.preco) * item.quantidade;
            }
        });

        const resumoArray = Object.values(resumoMap);
        const valorTotal = resumoArray.reduce((acc, item) => acc + item.total, 0);

        localStorage.setItem('resumoCarrinho', JSON.stringify({
            itens: resumoArray,
            valorTotal: valorTotal.toFixed(2)
        }));
    }

    window.alterarQuantidadeItem = function (chave, delta) {
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        let index = carrinho.findIndex(item => (item.id + "|" + (item.observacao || "")) === chave);

        if (index !== -1) {
            carrinho[index].quantidade += delta;
            if (carrinho[index].quantidade <= 0) {
                carrinho.splice(index, 1);
            }
        }

        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        atualizarCarrinho();
    };

    window.removerItemCarrinho = function (chave) {
        let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        carrinho = carrinho.filter(item => (item.id + "|" + (item.observacao || "")) !== chave);
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        atualizarCarrinho();
    };



    atualizarCarrinho();
});
