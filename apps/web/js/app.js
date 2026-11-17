// ==========================================================
// STAYVILE — interações da página inicial
// Os jogos ficam só na memória: ao recarregar a página,
// a lista volta para os exemplos iniciais.
//
// Ainda não há login: a página mostra a visão de UM usuário.
// "Emprestado por você" aparece só para quem está com o jogo;
// para os outros, o jogo segue disponível enquanto houver cópias.
//
// A capa é obrigatória no cadastro. Se a imagem não carregar,
// o cartão mostra um degradê com a inicial do jogo.
// ==========================================================

// ---------- Dados ----------

let proximoId = 1;

const jogos = [
  criarJogo("Hollow Knight", "Metroidvania", 3, 9.9, ""),
  criarJogo("Stardew Valley", "Simulação", 2, 7.5, ""),
  criarJogo("Celeste", "Plataforma", 1, 6.0, ""),
];

function criarJogo(nome, genero, quantidade, valor, capa) {
  return {
    id: proximoId++,
    nome: nome,
    genero: genero,
    capa: capa, // link da imagem de capa
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

  // Linha 1: nome + preço
  const linhaNome = document.createElement("div");
  linhaNome.className = "jogo__linha";

  const nome = document.createElement("h3");
  nome.className = "jogo__nome";
  nome.textContent = jogo.nome;
  nome.title = jogo.nome;

  const preco = document.createElement("span");
  preco.className = "preco";
  preco.textContent = formatarReais.format(jogo.valor);

  linhaNome.append(nome, preco);

  // Linha 2: gênero
  const genero = document.createElement("p");
  genero.className = "jogo__genero";
  genero.textContent = jogo.genero;

  // Linha 3: status + cópias disponíveis
  const linhaStatus = document.createElement("div");
  linhaStatus.className = "jogo__linha";

  const quantidade = document.createElement("span");
  quantidade.className = "jogo__quantidade";
  quantidade.textContent =
    jogo.quantidade + (jogo.quantidade === 1 ? " disponível" : " disponíveis");

  linhaStatus.append(criarStatus(jogo), quantidade);

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
  corpo.append(linhaNome, genero, linhaStatus, acoes);
  item.append(capa, corpo);
  return item;
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
  if (campoValor.value === "" || !(valor > 0)) {
    return mostrarErro(campoValor, "O valor do aluguel deve ser maior que zero.");
  }
  if (capa === "") {
    return mostrarErro(campoCapa, "Informe o link da capa.");
  }
  if (!linkValido(capa)) {
    return mostrarErro(campoCapa, "O link da capa deve começar com http:// ou https://.");
  }

  return { nome: nome, genero: genero, quantidade: quantidade, valor: valor, capa: capa };
}

function mostrarErro(campo, texto) {
  campo.classList.add("invalido");
  campo.focus();
  mensagemErro.textContent = texto;
  return null;
}

function limparErros() {
  mensagemErro.textContent = "";
  [campoNome, campoGenero, campoQuantidade, campoValor, campoCapa].forEach(function (campo) {
    campo.classList.remove("invalido");
  });
}

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const dados = validarFormulario();
  if (!dados) {
    return;
  }

  jogos.push(criarJogo(dados.nome, dados.genero, dados.quantidade, dados.valor, dados.capa));
  formulario.reset();
  campoNome.focus();
  renderizarLista();
});

// ---------- Início ----------

renderizarLista();
