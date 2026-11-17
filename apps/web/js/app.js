// ==========================================================
// STAYVILE — interações da página inicial
// Os jogos ficam só na memória: ao recarregar a página,
// a lista volta para os exemplos iniciais.
//
// Ainda não há login: a página mostra a visão de UM usuário.
// "Emprestado por você" aparece só para quem está com o jogo;
// para os outros, o jogo segue disponível enquanto houver cópias.
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
    quantidade: quantidade, // cópias livres para empréstimo
    valor: valor,
    emprestadoPorVoce: false, // o usuário da página está com uma cópia?
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

  const status = criarStatus(jogo);

  const acoes = document.createElement("div");
  acoes.className = "jogo__acoes";

  const botaoEmprestimo = document.createElement("button");
  botaoEmprestimo.type = "button";
  botaoEmprestimo.className = "botao botao--secundario";

  if (jogo.emprestadoPorVoce) {
    botaoEmprestimo.textContent = "Devolver";
    botaoEmprestimo.addEventListener("click", function () {
      devolverJogo(jogo.id);
    });
  } else {
    botaoEmprestimo.textContent = "Emprestar";
    botaoEmprestimo.disabled = jogo.quantidade === 0;
    botaoEmprestimo.addEventListener("click", function () {
      emprestarJogo(jogo.id);
    });
  }

  const botaoRemover = document.createElement("button");
  botaoRemover.type = "button";
  botaoRemover.className = "botao botao--perigo";
  botaoRemover.textContent = "Remover";
  if (jogo.emprestadoPorVoce) {
    botaoRemover.disabled = true;
    botaoRemover.title = "Devolva o jogo antes de removê-lo.";
  }
  botaoRemover.addEventListener("click", function () {
    removerJogo(jogo.id);
  });

  acoes.append(botaoEmprestimo, botaoRemover);
  item.append(nome, genero, status, detalhes, acoes);
  return item;
}

function criarStatus(jogo) {
  const status = document.createElement("span");
  status.className = "status";

  if (jogo.emprestadoPorVoce) {
    status.classList.add("status--emprestado");
    status.textContent = "Emprestado por você";
  } else if (jogo.quantidade > 0) {
    status.classList.add("status--disponivel");
    status.textContent = "Disponível";
  } else {
    status.classList.add("status--indisponivel");
    status.textContent = "Indisponível";
  }

  return status;
}

// ---------- Empréstimo e devolução ----------

function buscarJogo(id) {
  return jogos.find(function (jogo) {
    return jogo.id === id;
  });
}

function emprestarJogo(id) {
  const jogo = buscarJogo(id);

  // Uma cópia em aberto por jogo para cada usuário.
  if (!jogo || jogo.emprestadoPorVoce || jogo.quantidade === 0) {
    return;
  }

  jogo.quantidade -= 1;
  jogo.emprestadoPorVoce = true;
  renderizarLista();
}

function devolverJogo(id) {
  const jogo = buscarJogo(id);

  if (!jogo || !jogo.emprestadoPorVoce) {
    return;
  }

  jogo.quantidade += 1;
  jogo.emprestadoPorVoce = false;
  renderizarLista();
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
