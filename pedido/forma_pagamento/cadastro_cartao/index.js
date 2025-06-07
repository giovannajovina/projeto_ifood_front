document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo"); // Recupera o tipo (credito ou debito)

  document.getElementById("tipo-cartao").value = tipo;

  const titulo = document.getElementById("titulo-cartao");
  if (tipo) {
    let nome = tipo.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
    titulo.innerText = `Adicionar cartão de ${nome}`;
  }

  document.getElementById("formCartao").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Captura os valores do formulário
    const numeroCartao = document.getElementById("numero-cartao").value;
    const nome = document.getElementById("nome-cartao").value;
    const validade = document.getElementById("validade-cartao").value;
    const cvv = document.getElementById("cvv-cartao").value;
    const apelido = document.getElementById("apelido-cartao").value;
    const cpf = document.getElementById("cpf-cartao").value;
    const tipo = document.getElementById("tipo-cartao").value;

    // if (!validarCartao(numeroCartao)) {
    //   alert("Número do cartão inválido!");
    //   return;
    // }

    // // 🔎 Identificação da bandeira
    const bandeira = identificarBandeira(numeroCartao).nome;


    // Exibir para o usuário
    // alert(`Cartão válido! Bandeira: ${bandeira}, Tipo: ${tipo}`);
    // 🔄 Enviar para o Backend
    const dadosCartao = {
      numero: numeroCartao,
      nome: nome,
      validade: validade,
      cvv: cvv,
      apelido: apelido,
      cpf: cpf,
      bandeira: bandeira,
      tipo: tipo
    };
    
    token = localStorage.getItem("token")
    try {
      const response = await fetch('https://clickfood.shop/api/cartao/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'XSRF-TOKEN':token
        },
        body: JSON.stringify(dadosCartao)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Cartão salvo com sucesso!");
        sessionStorage.setItem('cartao_id', data.cartao_id);
        sessionStorage.setItem('tipo_cartao', tipo);
        window.location.href = "checkout.html";
      } else {
        alert("Erro ao salvar cartão: " + data.message);
      }
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
    }
  });
  // Mapeamento das bandeiras e seus respectivos regex
  const bandeiras = {
    'Visa': {
      regex: /^4[0-9]{12}(?:[0-9]{3})?$/,
      imagem: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
    },
    'Mastercard': {
      regex: /^5[1-5][0-9]{14}$/,
      imagem: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Mastercard-logo.png"
    },
    "American Express": {
      regex: /^3[47][0-9]{13}$/,
      imagem: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.png"
    },
    "Diners Club": {
      regex: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
      imagem: "https://upload.wikimedia.org/wikipedia/commons/0/04/Diners_Club_Logo.png"
    },
    'Discover': {
      regex: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      imagem: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Discover_Card_logo.png"
    },
    'JCB': {
      regex: /^(?:2131|1800|35\d{3})\d{11}$/,
      imagem: "https://upload.wikimedia.org/wikipedia/commons/0/0d/JCB_logo.png"
    },
    'Elo': {
      regex: /^3(?:6[0-9]|5[0-9])[0-9]{11}$/,
      imagem: "https://logospng.org/download/elo/logo-elo-icon-512.png"
    }
  };

  // Seleciona o input e a imagem
  const inputNumeroCartao = document.getElementById("numero-cartao");
  const imgBandeira = document.getElementById("bandeira-cartao");

// Função para adicionar máscara de formatação e limitar a 16 dígitos
const adicionarMascaraCartao = (valor) => {
  valor = valor.replace(/\D/g, ''); // Remove caracteres não numéricos
  valor = valor.slice(0, 16); // Limita em 16 dígitos (puro, sem espaços)
  valor = valor.replace(/(\d{4})(?=\d)/g, '$1 '); // Adiciona espaço a cada 4 dígitos
  return valor;
};
// Função para identificar bandeira
const identificarBandeira = (numero) => {
  const valorLimpo = numero.replace(/\s+/g, ''); // Remove os espaços
  let bandeiraDetectada = null;


  for (const [nome, dados] of Object.entries(bandeiras)) {
    if (dados.regex.test(valorLimpo)) {
        bandeiraDetectada = { nome, ...dados };
        return bandeiraDetectada
        break;
    }
}

  if (bandeiraDetectada) {
      imgBandeira.src = bandeiraDetectada.imagem;
      imgBandeira.style.display = "block";
  } else {
      imgBandeira.src = "";
      imgBandeira.style.display = "none";
  }
  
};

  // Função para validar pelo algoritmo de Luhn
  const validarCartaoLuhn = (numero) => {
    const cartaoLimpo = numero.replace(/\D/g, '');
    let soma = 0;
    let alternar = false;

    for (let i = cartaoLimpo.length - 1; i >= 0; i--) {
      let digito = parseInt(cartaoLimpo.charAt(i));
      if (alternar) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      soma += digito;
      alternar = !alternar;
    }

    return (soma % 10) === 0;
  };

  // Evento de digitação para identificar a bandeira
  inputNumeroCartao.addEventListener("input", (event) => {
    const valorLimpo = event.target.value.replace(/\s+/g, '');

    // Adiciona a máscara
    event.target.value = adicionarMascaraCartao(valorLimpo);

    // Verifica qual bandeira corresponde
    let bandeiraIdentificada = null;

    for (const bandeira in bandeiras) {
      if (bandeiras[bandeira].regex.test(valorLimpo)) {
        bandeiraIdentificada = bandeiras[bandeira];
        break;
      }
    }

    // Se identificou, troca a imagem, caso contrário, remove
    if (bandeiraIdentificada) {
      imgBandeira.src = bandeiraIdentificada.imagem;
      imgBandeira.style.display = "block";
    } else {
      imgBandeira.src = "";
      imgBandeira.style.display = "none";
    }
    // Verifica a quantidade de dígitos
    if (valorLimpo.length === 16) {
      event.target.style.border = "2px solid green";
  } else {
      event.target.style.border = "1px solid #ccc";
  }
    // Verifica a validade do cartão
    // if (valorLimpo.length >= 13) {
    //   if (validarCartaoLuhn(valorLimpo)) {
    //     inputNumeroCartao.style.border = "2px solid green";
    //   } else {
    //     inputNumeroCartao.style.border = "2px solid red";
    //   }
    // } else {
    //   inputNumeroCartao.style.border = "1px solid #ccc";
    // }
  });

  // Seleciona o campo de validade
const inputValidadeCartao = document.getElementById("validade-cartao");

// Função para adicionar máscara de MM/AAAA
const adicionarMascaraValidade = (valor) => {
    // Remove caracteres não numéricos
    valor = valor.replace(/\D/g, '');

    if (valor.length > 2) {
        valor = valor.replace(/(\d{2})(\d{1,4})/, '$1/$2');
    }

    return valor;
};

// Função para validar a data de validade
const validarDataValidade = (data) => {
    // Remove a máscara e separa o mês e o ano
    const [mes, ano] = data.split('/').map(Number);

    if (mes > 12 || mes < 1) {
        return false;
    }

    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth() + 1;

    // Validação de ano e mês
    if (ano < anoAtual) return false;
    if (ano === anoAtual && mes < mesAtual) return false;

    return true;
};

// Evento de digitação para máscara e validação
inputValidadeCartao.addEventListener("input", (event) => {
    // Adiciona a máscara
    event.target.value = adicionarMascaraValidade(event.target.value);

    // Valida a data se estiver completa
    if (event.target.value.length === 7) {
        if (validarDataValidade(event.target.value)) {
            inputValidadeCartao.style.border = "2px solid green";
        } else {
            inputValidadeCartao.style.border = "2px solid red";
        }
    } else {
        inputValidadeCartao.style.border = "1px solid #ccc";
    }
});



});
