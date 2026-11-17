// ==========================================================
// STAYVILE — interações da página inicial
// Os jogos ficam só na memória: ao recarregar a página,
// a lista volta para os exemplos iniciais.
//
// Modalidades: o dono do jogo pode oferecer ALUGUEL (valor mensal,
// por 30 dias a partir do aluguel, depois devolve) e/ou VENDA
// (valor maior, o jogo fica com o jogador para sempre). Com as
// duas, a venda custa mais.
//
// Os jogos são digitais: não há limite de cópias. A única regra é
// uma cópia em aberto por jogo para cada usuário.
//
// Ainda não há login: a página mostra a visão de UM usuário.
// "Alugado por você" e "Seu (vitalício)" aparecem só para quem
// alugou ou comprou; para os outros, o jogo segue disponível.
//
// A capa é obrigatória no cadastro: um arquivo .jpg, .jpeg, .png
// ou .webp de até 2 MB, enviado do computador. Ela fica só na memória do
// navegador. Se a imagem não carregar, o cartão mostra um degradê
// com a inicial do jogo.
// ==========================================================

// ---------- Dados ----------

const PRAZO_ALUGUEL_DIAS = 30; // contados a partir do aluguel
const TAMANHO_MAXIMO_CAPA = 2 * 1024 * 1024; // 2 MB

// Formatos aceitos para a capa: extensão do arquivo -> tipo de imagem.
const FORMATOS_CAPA = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Situação do usuário da página em relação a cada jogo.
const SITUACAO = {
  NENHUMA: "nenhuma",
  ALUGADO: "alugado",
  COMPRADO: "comprado",
};

let proximoId = 1;

const jogos = [
  criarJogo({ nome: "Hollow Knight", genero: "Metroidvania", valorAluguel: 9.9, valorVenda: 79.9, capa: "" }),
  criarJogo({ nome: "Stardew Valley", genero: "Simulação", valorAluguel: 7.5, valorVenda: null, capa: "" }),
  criarJogo({ nome: "Celeste", genero: "Plataforma", valorAluguel: null, valorVenda: 59.9, capa: "" }),
];

// valorAluguel ou valorVenda = null quando a modalidade não é oferecida.
function criarJogo(dados) {
  return {
    id: proximoId++,
    nome: dados.nome,
    genero: dados.genero,
    capa: dados.capa, // endereço da imagem enviada (vazio = capa reserva)
    valorAluguel: dados.valorAluguel,
    valorVenda: dados.valorVenda,
    situacao: SITUACAO.NENHUMA,
  };
}

function ofereceAluguel(jogo) {
  return jogo.valorAluguel !== null;
}

function ofereceVenda(jogo) {
  return jogo.valorVenda !== null;
}

// ---------- Elementos da página ----------

const formulario = document.getElementById("form-jogo");
const campoNome = document.getElementById("nome");
const campoGenero = document.getElementById("genero");
const caixaAluguel = document.getElementById("oferecer-aluguel");
const campoValorAluguel = document.getElementById("valor-aluguel");
const caixaVenda = document.getElementById("oferecer-venda");
const campoValorVenda = document.getElementById("valor-venda");
const campoCapa = document.getElementById("capa");
const previaCapa = document.getElementById("previa-capa");
const mensagemErro = document.getElementById("mensagem-erro");
const listaJogos = document.getElementById("lista-jogos");
const listaVazia = document.getElementById("lista-vazia");
const contador = document.getElementById("contador");

const formatarReais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// ---------- Listagem ----------

function renderizarLista() {
  listaJogos.innerHTML = "";

  jogos.forEach(function (jogo) {
    listaJogos.appendChild(criarItemJogo(jogo));
  });

  listaVazia.hidden = jogos.length > 0;
  contador.textContent =
    jogos.length === 1 ? "1 jogo" : jogos.length + " jogos";
}

function criarItemJogo(jogo) {
  const item = document.createElement("li");
  item.className = "jogo";

  const capa = criarCapa(jogo);

  const corpo = document.createElement("div");
  corpo.className = "jogo__corpo";

  // Nome e gênero
  const nome = document.createElement("h3");
  nome.className = "jogo__nome";
  nome.textContent = jogo.nome;
  nome.title = jogo.nome;

  const genero = document.createElement("p");
  genero.className = "jogo__genero";
  genero.textContent = jogo.genero;

  // Preços de cada modalidade oferecida
  const precos = document.createElement("div");
  precos.className = "jogo__precos";

  if (ofereceAluguel(jogo)) {
    precos.appendChild(
      criarPreco("Alugar", formatarReais.format(jogo.valorAluguel) + " / mês", "preco--aluguel")
    );
  }
  if (ofereceVenda(jogo)) {
    precos.appendChild(
      criarPreco("Comprar", formatarReais.format(jogo.valorVenda), "preco--venda")
    );
  }

  corpo.append(nome, genero, precos, criarStatus(jogo), criarAcoes(jogo));
  item.append(capa, corpo);
  return item;
}

function criarPreco(rotulo, valor, modificador) {
  const preco = document.createElement("span");
  preco.className = "preco " + modificador;

  const textoRotulo = document.createElement("span");
  textoRotulo.className = "preco__rotulo";
  textoRotulo.textContent = rotulo;

  const textoValor = document.createElement("strong");
  textoValor.textContent = valor;

  preco.append(textoRotulo, textoValor);
  return preco;
}

function criarStatus(jogo) {
  const status = document.createElement("span");
  status.className = "status";

  if (jogo.situacao === SITUACAO.COMPRADO) {
    status.classList.add("status--comprado");
    status.textContent = "Seu (vitalício)";
  } else if (jogo.situacao === SITUACAO.ALUGADO) {
    status.classList.add("status--alugado");
    status.textContent = "Alugado por você · " + PRAZO_ALUGUEL_DIAS + " dias";
  } else {
    status.classList.add("status--disponivel");
    status.textContent = "Disponível";
  }

  return status;
}

// ---------- Botões do cartão ----------

function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao " + classe;
  botao.textContent = texto;
  botao.addEventListener("click", aoClicar);
  return botao;
}

function criarAcoes(jogo) {
  const acoes = document.createElement("div");
  acoes.className = "jogo__acoes";

  if (jogo.situacao === SITUACAO.NENHUMA) {
    if (ofereceAluguel(jogo)) {
      acoes.appendChild(
        criarBotao("Alugar", "botao--secundario", function () {
          alugarJogo(jogo.id);
        })
      );
    }
    if (ofereceVenda(jogo)) {
      acoes.appendChild(
        criarBotao("Comprar", "botao--compra", function () {
          comprarJogo(jogo.id);
        })
      );
    }
  }

  if (jogo.situacao === SITUACAO.ALUGADO) {
    acoes.appendChild(
      criarBotao("Devolver", "botao--secundario", function () {
        devolverJogo(jogo.id);
      })
    );
    // Quem está alugando pode comprar a mesma cópia.
    if (ofereceVenda(jogo)) {
      const botaoComprar = criarBotao("Comprar", "botao--compra", function () {
        comprarJogo(jogo.id);
      });
      botaoComprar.title = "O jogo alugado passa a ser seu.";
      acoes.appendChild(botaoComprar);
    }
  }

  const botaoRemover = criarBotao("Remover", "botao--perigo", function () {
    removerJogo(jogo.id);
  });
  if (jogo.situacao === SITUACAO.ALUGADO) {
    botaoRemover.disabled = true;
    botaoRemover.title = "Devolva o jogo antes de removê-lo.";
  }
  if (jogo.situacao === SITUACAO.COMPRADO) {
    botaoRemover.disabled = true;
    botaoRemover.title = "Você comprou este jogo.";
  }
  acoes.appendChild(botaoRemover);

  return acoes;
}

// ---------- Capa ----------

function criarCapa(jogo) {
  if (!jogo.capa) {
    return criarCapaReserva(jogo.nome);
  }

  const imagem = document.createElement("img");
  imagem.className = "capa";
  imagem.src = jogo.capa;
  imagem.alt = "Capa de " + jogo.nome;
  imagem.loading = "lazy";

  // Se a imagem não carregar, troca pela capa reserva.
  imagem.addEventListener("error", function () {
    imagem.replaceWith(criarCapaReserva(jogo.nome));
  });

  return imagem;
}

function criarCapaReserva(nome) {
  const reserva = document.createElement("div");
  reserva.className = "capa capa--reserva";
  reserva.setAttribute("role", "img");
  reserva.setAttribute("aria-label", "Capa de " + nome);
  reserva.textContent = nome.charAt(0).toUpperCase();

  // A cor sai do próprio nome: o mesmo jogo tem sempre o mesmo tom de azul.
  const tom = 195 + (somarLetras(nome) % 50);
  reserva.style.background =
    "linear-gradient(135deg, hsl(" + tom + ", 80%, 55%), hsl(" + (tom + 25) + ", 70%, 25%))";

  return reserva;
}

function somarLetras(texto) {
  let soma = 0;
  for (let i = 0; i < texto.length; i++) {
    soma += texto.charCodeAt(i);
  }
  return soma;
}

// ---------- Upload da capa ----------

// Endereço temporário da imagem escolhida no formulário.
let enderecoCapaEscolhida = null;

// Devolve a mensagem de erro, ou "" se o arquivo estiver certo.
function verificarArquivoCapa(arquivo) {
  const nome = arquivo.name.toLowerCase();
  const ponto = nome.lastIndexOf(".");
  const extensao = ponto === -1 ? "" : nome.slice(ponto);
  const tipoEsperado = FORMATOS_CAPA[extensao];

  // A extensão precisa estar na lista e combinar com o tipo do arquivo.
  if (!tipoEsperado || (arquivo.type !== "" && arquivo.type !== tipoEsperado)) {
    return "A capa precisa ser um arquivo .jpg, .jpeg, .png ou .webp.";
  }
  if (arquivo.size > TAMANHO_MAXIMO_CAPA) {
    return "A capa deve ter no máximo 2 MB.";
  }
  return "";
}

function limparPreviaCapa() {
  if (enderecoCapaEscolhida) {
    URL.revokeObjectURL(enderecoCapaEscolhida);
    enderecoCapaEscolhida = null;
  }
  previaCapa.hidden = true;
  previaCapa.removeAttribute("src");
}

campoCapa.addEventListener("change", function () {
  limparPreviaCapa();
  campoCapa.classList.remove("invalido");
  mensagemErro.textContent = "";

  const arquivo = campoCapa.files[0];
  if (!arquivo) {
    return;
  }

  const erro = verificarArquivoCapa(arquivo);
  if (erro) {
    mostrarErro(campoCapa, erro);
    return;
  }

  enderecoCapaEscolhida = URL.createObjectURL(arquivo);
  previaCapa.src = enderecoCapaEscolhida;
  previaCapa.hidden = false;
});

// ---------- Aluguel, devolução e compra ----------

function buscarJogo(id) {
  return jogos.find(function (jogo) {
    return jogo.id === id;
  });
}

function alugarJogo(id) {
  const jogo = buscarJogo(id);

  // Uma cópia em aberto por jogo para cada usuário.
  if (!jogo || !ofereceAluguel(jogo) || jogo.situacao !== SITUACAO.NENHUMA) {
    return;
  }

  jogo.situacao = SITUACAO.ALUGADO;
  renderizarLista();
}

function devolverJogo(id) {
  const jogo = buscarJogo(id);

  if (!jogo || jogo.situacao !== SITUACAO.ALUGADO) {
    return;
  }

  jogo.situacao = SITUACAO.NENHUMA;
  renderizarLista();
}

function comprarJogo(id) {
  const jogo = buscarJogo(id);

  if (!jogo || !ofereceVenda(jogo) || jogo.situacao === SITUACAO.COMPRADO) {
    return;
  }

  // Vale também para quem está alugando: o aluguel vira compra.
  jogo.situacao = SITUACAO.COMPRADO;
  renderizarLista();
}

function removerJogo(id) {
  const posicao = jogos.findIndex(function (jogo) {
    return jogo.id === id;
  });

  if (posicao !== -1 && jogos[posicao].situacao === SITUACAO.NENHUMA) {
    // Libera da memória a imagem enviada para esse jogo.
    if (jogos[posicao].capa.startsWith("blob:")) {
      URL.revokeObjectURL(jogos[posicao].capa);
    }
    jogos.splice(posicao, 1);
    renderizarLista();
  }
}

// ---------- Formulário ----------

// O campo de valor só fica ativo quando a modalidade está marcada.
function sincronizarModalidades() {
  campoValorAluguel.disabled = !caixaAluguel.checked;
  campoValorVenda.disabled = !caixaVenda.checked;
  if (!caixaAluguel.checked) {
    campoValorAluguel.value = "";
  }
  if (!caixaVenda.checked) {
    campoValorVenda.value = "";
  }
}

caixaAluguel.addEventListener("change", sincronizarModalidades);
caixaVenda.addEventListener("change", sincronizarModalidades);

function validarFormulario() {
  const nome = campoNome.value.trim();
  const genero = campoGenero.value.trim();
  const valorAluguel = Number(campoValorAluguel.value);
  const valorVenda = Number(campoValorVenda.value);
  const arquivoCapa = campoCapa.files[0];

  limparErros();

  if (nome === "") {
    return mostrarErro(campoNome, "Informe o nome do jogo.");
  }
  if (genero === "") {
    return mostrarErro(campoGenero, "Informe o gênero do jogo.");
  }
  if (!caixaAluguel.checked && !caixaVenda.checked) {
    return mostrarErro(caixaAluguel, "Marque pelo menos uma modalidade: alugar ou vender.");
  }
  if (caixaAluguel.checked && (campoValorAluguel.value === "" || !(valorAluguel > 0))) {
    return mostrarErro(campoValorAluguel, "O valor do aluguel deve ser maior que zero.");
  }
  if (caixaVenda.checked && (campoValorVenda.value === "" || !(valorVenda > 0))) {
    return mostrarErro(campoValorVenda, "O valor da venda deve ser maior que zero.");
  }
  if (caixaAluguel.checked && caixaVenda.checked && valorVenda <= valorAluguel) {
    return mostrarErro(campoValorVenda, "O valor da venda deve ser maior que o do aluguel.");
  }
  if (!arquivoCapa) {
    return mostrarErro(campoCapa, "Escolha a imagem de capa.");
  }
  const erroCapa = verificarArquivoCapa(arquivoCapa);
  if (erroCapa) {
    return mostrarErro(campoCapa, erroCapa);
  }

  return {
    nome: nome,
    genero: genero,
    valorAluguel: caixaAluguel.checked ? valorAluguel : null,
    valorVenda: caixaVenda.checked ? valorVenda : null,
    capa: enderecoCapaEscolhida,
  };
}

function mostrarErro(campo, texto) {
  campo.classList.add("invalido");
  campo.focus();
  mensagemErro.textContent = texto;
  return null;
}

function limparErros() {
  mensagemErro.textContent = "";
  [campoNome, campoGenero, caixaAluguel, campoValorAluguel, campoValorVenda, campoCapa].forEach(function (campo) {
    campo.classList.remove("invalido");
  });
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const dados = validarFormulario();
  if (!dados) {
    return;
  }

  jogos.push(criarJogo(dados));

  // A imagem agora pertence ao cartão: não pode ser liberada da memória.
  enderecoCapaEscolhida = null;
  limparPreviaCapa();

  formulario.reset();
  sincronizarModalidades();
  campoNome.focus();
  renderizarLista();
});

// ---------- Início ----------

sincronizarModalidades();
renderizarLista();
