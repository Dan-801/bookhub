// ==========================================================
// STAYVILE — interações da página inicial
// Os jogos ficam só na memória: ao recarregar a página,
// a lista volta para os exemplos iniciais.
// ==========================================================

// ---------- Dados ----------

let proximoId = 1;

const jogos = [
  criarJogo("Hollow Knight", "Metroidvania", 3, 9.9),
  criarJogo("Stardew Valley", "Simulação", 2, 7.5),
  criarJogo("Celeste", "Plataforma", 1, 6.0),
];

function criarJogo(nome, genero, quantidade, valor) {
  return {
    id: proximoId++,
    nome: nome,
    genero: genero,
    quantidade: quantidade,
    valor: valor,
  };
}

// ---------- Elementos da página ----------

const formulario = document.getElementById("form-jogo");
const campoNome = document.getElementById("nome");
const campoGenero = document.getElementById("genero");
const campoQuantidade = document.getElementById("quantidade");
const campoValor = document.getElementById("valor");
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

  const nome = document.createElement("h3");
  nome.className = "jogo__nome";
  nome.textContent = jogo.nome;

  const genero = document.createElement("p");
  genero.className = "jogo__genero";
  genero.textContent = jogo.genero;

  const detalhes = document.createElement("p");
  detalhes.className = "jogo__detalhes";

  const quantidade = document.createElement("span");
  quantidade.textContent =
    jogo.quantidade + (jogo.quantidade === 1 ? " disponível" : " disponíveis");

  const valor = document.createElement("strong");
  valor.textContent = formatarReais.format(jogo.valor);

  detalhes.append(quantidade, valor);

  const acoes = document.createElement("div");
  acoes.className = "jogo__acoes";

  const botaoRemover = document.createElement("button");
  botaoRemover.type = "button";
  botaoRemover.className = "botao botao--perigo";
  botaoRemover.textContent = "Remover";
  botaoRemover.addEventListener("click", function () {
    removerJogo(jogo.id);
  });

  acoes.appendChild(botaoRemover);
  item.append(nome, genero, detalhes, acoes);
  return item;
}

function removerJogo(id) {
  const posicao = jogos.findIndex(function (jogo) {
    return jogo.id === id;
  });

  if (posicao !== -1) {
    jogos.splice(posicao, 1);
    renderizarLista();
  }
}

// ---------- Formulário ----------

function validarFormulario() {
  const nome = campoNome.value.trim();
  const genero = campoGenero.value.trim();
  const quantidade = Number(campoQuantidade.value);
  const valor = Number(campoValor.value);

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
  if (campoValor.value === "" || !(valor > 0)) {
    return mostrarErro(campoValor, "O valor do aluguel deve ser maior que zero.");
  }

  return { nome: nome, genero: genero, quantidade: quantidade, valor: valor };
}

function mostrarErro(campo, texto) {
  campo.classList.add("invalido");
  campo.focus();
  mensagemErro.textContent = texto;
  return null;
}

function limparErros() {
  mensagemErro.textContent = "";
  [campoNome, campoGenero, campoQuantidade, campoValor].forEach(function (campo) {
    campo.classList.remove("invalido");
  });
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const dados = validarFormulario();
  if (!dados) {
    return;
  }

  jogos.push(criarJogo(dados.nome, dados.genero, dados.quantidade, dados.valor));
  formulario.reset();
  campoNome.focus();
  renderizarLista();
});

// ---------- Início ----------

renderizarLista();
