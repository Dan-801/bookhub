// ==========================================================
// STAYVILE — interações da página inicial
// Os jogos ficam só na memória: ao recarregar a página,
// a lista volta para os exemplos iniciais.
//
// Modalidades: o dono do jogo pode oferecer ALUGUEL (valor menor,
// por 72h, depois devolve) e/ou VENDA (valor maior, o jogo fica
// com o jogador para sempre). Com as duas, a venda custa mais.
//
// Ainda não há login: a página mostra a visão de UM usuário.
// "Alugado por você" e "Seu (vitalício)" aparecem só para quem
// alugou ou comprou; para os outros, o jogo segue disponível
// enquanto houver cópias.
//
// A capa é obrigatória no cadastro. Se a imagem não carregar,
// o cartão mostra um degradê com a inicial do jogo.
// ==========================================================

// ---------- Dados ----------

const PRAZO_ALUGUEL_HORAS = 72;

// Situação do usuário da página em relação a cada jogo.
const SITUACAO = {
  NENHUMA: "nenhuma",
  ALUGADO: "alugado",
  COMPRADO: "comprado",
};

let proximoId = 1;

const jogos = [
  criarJogo({ nome: "Hollow Knight", genero: "Metroidvania", quantidade: 3, valorAluguel: 9.9, valorVenda: 79.9, capa: "" }),
  criarJogo({ nome: "Stardew Valley", genero: "Simulação", quantidade: 2, valorAluguel: 7.5, valorVenda: null, capa: "" }),
  criarJogo({ nome: "Celeste", genero: "Plataforma", quantidade: 1, valorAluguel: null, valorVenda: 59.9, capa: "" }),
];

// valorAluguel ou valorVenda = null quando a modalidade não é oferecida.
function criarJogo(dados) {
  return {
    id: proximoId++,
    nome: dados.nome,
    genero: dados.genero,
    capa: dados.capa, // link da imagem de capa
    quantidade: dados.quantidade, // cópias livres para alugar ou comprar
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
const campoQuantidade = document.getElementById("quantidade");
const caixaAluguel = document.getElementById("oferecer-aluguel");
const campoValorAluguel = document.getElementById("valor-aluguel");
const caixaVenda = document.getElementById("oferecer-venda");
const campoValorVenda = document.getElementById("valor-venda");
const campoCapa = document.getElementById("capa");
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
      criarPreco("Alugar", formatarReais.format(jogo.valorAluguel) + " / " + PRAZO_ALUGUEL_HORAS + "h", "preco--aluguel")
    );
  }
  if (ofereceVenda(jogo)) {
    precos.appendChild(
      criarPreco("Comprar", formatarReais.format(jogo.valorVenda), "preco--venda")
    );
  }

  // Status + cópias disponíveis
  const linhaStatus = document.createElement("div");
  linhaStatus.className = "jogo__linha";

  const quantidade = document.createElement("span");
  quantidade.className = "jogo__quantidade";
  quantidade.textContent =
    jogo.quantidade + (jogo.quantidade === 1 ? " disponível" : " disponíveis");

  linhaStatus.append(criarStatus(jogo), quantidade);

  corpo.append(nome, genero, precos, linhaStatus, criarAcoes(jogo));
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
    status.textContent = "Alugado por você";
  } else if (jogo.quantidade > 0) {
    status.classList.add("status--disponivel");
    status.textContent = "Disponível";
  } else {
    status.classList.add("status--indisponivel");
    status.textContent = "Indisponível";
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
  const semCopias = jogo.quantidade === 0;

  if (jogo.situacao === SITUACAO.NENHUMA) {
    if (ofereceAluguel(jogo)) {
      const botaoAlugar = criarBotao("Alugar", "botao--secundario", function () {
        alugarJogo(jogo.id);
      });
      botaoAlugar.disabled = semCopias;
      acoes.appendChild(botaoAlugar);
    }
    if (ofereceVenda(jogo)) {
      const botaoComprar = criarBotao("Comprar", "botao--compra", function () {
        comprarJogo(jogo.id);
      });
      botaoComprar.disabled = semCopias;
      acoes.appendChild(botaoComprar);
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
      botaoComprar.title = "A cópia alugada passa a ser sua.";
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

  // Se o link estiver quebrado, troca pela capa reserva.
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

function linkValido(texto) {
  try {
    const link = new URL(texto);
    return link.protocol === "http:" || link.protocol === "https:";
  } catch (erro) {
    return false;
  }
}

// ---------- Aluguel, devolução e compra ----------

function buscarJogo(id) {
  return jogos.find(function (jogo) {
    return jogo.id === id;
  });
}

function alugarJogo(id) {
  const jogo = buscarJogo(id);

  // Uma cópia em aberto por jogo para cada usuário.
  if (!jogo || !ofereceAluguel(jogo) || jogo.situacao !== SITUACAO.NENHUMA || jogo.quantidade === 0) {
    return;
  }

  jogo.quantidade -= 1;
  jogo.situacao = SITUACAO.ALUGADO;
  renderizarLista();
}

function devolverJogo(id) {
  const jogo = buscarJogo(id);

  if (!jogo || jogo.situacao !== SITUACAO.ALUGADO) {
    return;
  }

  jogo.quantidade += 1;
  jogo.situacao = SITUACAO.NENHUMA;
  renderizarLista();
}

function comprarJogo(id) {
  const jogo = buscarJogo(id);

  if (!jogo || !ofereceVenda(jogo) || jogo.situacao === SITUACAO.COMPRADO) {
    return;
  }

  // Quem está alugando fica com a mesma cópia: não usa outra.
  if (jogo.situacao === SITUACAO.NENHUMA) {
    if (jogo.quantidade === 0) {
      return;
    }
    jogo.quantidade -= 1;
  }

  // A cópia vendida não volta para o acervo.
  jogo.situacao = SITUACAO.COMPRADO;
  renderizarLista();
}

function removerJogo(id) {
  const posicao = jogos.findIndex(function (jogo) {
    return jogo.id === id;
  });

  if (posicao !== -1 && jogos[posicao].situacao === SITUACAO.NENHUMA) {
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
  const quantidade = Number(campoQuantidade.value);
  const valorAluguel = Number(campoValorAluguel.value);
  const valorVenda = Number(campoValorVenda.value);
  const capa = campoCapa.value.trim();

  limparErros();

  if (nome === "") {
    return mostrarErro(campoNome, "Informe o nome do jogo.");
  }
  if (genero === "") {
    return mostrarErro(campoGenero, "Informe o gênero do jogo.");
  }
  if (campoQuantidade.value === "" || !Number.isInteger(quantidade) || quantidade < 1) {
    return mostrarErro(campoQuantidade, "A quantidade deve ser um número inteiro maior que zero.");
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
  if (capa === "") {
    return mostrarErro(campoCapa, "Informe o link da capa.");
  }
  if (!linkValido(capa)) {
    return mostrarErro(campoCapa, "O link da capa deve começar com http:// ou https://.");
  }

  return {
    nome: nome,
    genero: genero,
    quantidade: quantidade,
    valorAluguel: caixaAluguel.checked ? valorAluguel : null,
    valorVenda: caixaVenda.checked ? valorVenda : null,
    capa: capa,
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
  [campoNome, campoGenero, campoQuantidade, caixaAluguel, campoValorAluguel, campoValorVenda, campoCapa].forEach(function (campo) {
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
  formulario.reset();
  sincronizarModalidades();
  campoNome.focus();
  renderizarLista();
});

// ---------- Início ----------

sincronizarModalidades();
renderizarLista();
