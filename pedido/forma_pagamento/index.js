function escolherPagamento(tipo) {
    // Redireciona para a tela de cadastro do cartão com o tipo na query string
    window.location.href = `../forma_pagamento/cadastro_cartao/index.html?tipo=${tipo}`;
    // ,./cadastro_cartao/index.html
  }
  