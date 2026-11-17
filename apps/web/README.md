# apps/web/

Frontend do STAYVILE: a página onde o usuário busca um jogo, guarda a ficha, empresta, devolve e vê os atrasados.

## Versão atual: HTML, CSS e JavaScript puros

A primeira versão visual é uma página única, sem framework e sem API:

- **Título** com o nome do projeto.
- **Formulário "Cadastrar jogo"** com nome, gênero, quantidade disponível e valor do aluguel. Os campos são validados antes de entrar na lista.
- **Acervo** com um cartão por jogo, mostrando status, cópias disponíveis, valor e os botões **Emprestar/Devolver** e **Remover**.

Regras já aplicadas na página:

- "Emprestado por você" aparece só para quem está com o jogo. Para os outros usuários, o jogo continua disponível enquanto houver cópias.
- Cada usuário pode ter no máximo uma cópia em aberto por jogo.
- Um jogo emprestado não pode ser removido antes da devolução.

Limites desta versão:

- Ainda não há login, então a página mostra a visão de um único usuário.
- Os jogos ficam só na memória e voltam para os 3 exemplos ao recarregar a página.
- A busca no RAWG fica para a API, para não expor a chave no navegador.

## Organização dos arquivos

| Arquivo | Para que serve |
|---|---|
| [index.html](index.html) | Estrutura da página: cabeçalho, formulário e listagem |
| [css/styles.css](css/styles.css) | Estilização, com cores e espaçamentos em variáveis no `:root` |
| [js/app.js](js/app.js) | Interações: validação, cadastro, empréstimo, devolução e remoção |

As pastas abaixo continuam reservadas para quando o frontend passar a usar um framework:

| Pasta | Para que serve |
|---|---|
| [src/components/](src/components/) | Componentes de apresentação |
| [src/pages/](src/pages/) | Páginas que buscam dados e controlam o estado |
| [src/services/](src/services/) | Chamadas HTTP para a API |
| [src/hooks/](src/hooks/) | Lógica reaproveitável entre componentes |
| [tests/](tests/) | Testes automatizados do frontend |

## Como rodar

Não precisa instalar nada. Abra o arquivo `index.html` no navegador, com dois cliques.

Se preferir abrir por um servidor local, rode a partir desta pasta:

```bash
python -m http.server 5500
```

Depois, acesse `http://localhost:5500`.
