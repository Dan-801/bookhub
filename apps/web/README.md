# apps/web/

Frontend do STAYVILE: a página onde o usuário busca um jogo, guarda a ficha, empresta, devolve e vê os atrasados.

## Versão atual: HTML, CSS e JavaScript puros

A primeira versão visual é uma página única, sem framework e sem API, no estilo de vitrine de jogos: tema escuro com destaque em azul.

- **Barra do topo** com o nome do projeto e o total de jogos.
- **Formulário "Cadastrar jogo"**, numa coluna lateral, com nome, gênero, modalidades (alugar e/ou vender, cada uma com seu valor) e link da capa. Todos os campos são obrigatórios e validados antes de o jogo entrar na lista.
- **Acervo** em grade de cartões. Cada cartão mostra a capa, o nome, o gênero, o preço de cada modalidade, o status e os botões **Alugar**, **Comprar**, **Devolver** e **Remover**, conforme o caso.

### Modalidades

| Modalidade | Como funciona |
|---|---|
| **Alugar** | Valor mensal, por 30 dias a partir do aluguel. Depois, o jogo é devolvido |
| **Vender** | Valor maior. O jogo passa a ser do jogador para sempre |

O dono pode oferecer uma das modalidades ou as duas. Com as duas, o valor da venda precisa ser maior que o do aluguel.

Os jogos são digitais, então não há limite de cópias nem de aluguéis por mês.

### Regras já aplicadas na página

- "Alugado por você" e "Seu (vitalício)" aparecem só para quem alugou ou comprou o jogo. Para os outros usuários, o jogo continua disponível.
- Cada usuário pode ter no máximo uma cópia em aberto por jogo.
- Quem está alugando pode comprar o jogo: o aluguel vira compra.
- Quem já comprou não vê mais os botões Alugar e Comprar daquele jogo.
- Um jogo alugado ou comprado pelo usuário não pode ser removido.
- Se o link da capa não carregar, o cartão mostra um degradê azul com a inicial do jogo.

Limites desta versão:

- Ainda não há login, então a página mostra a visão de um único usuário. Ela ainda não separa o dono do anúncio de quem aluga ou compra: na API, o dono não pode alugar nem comprar o próprio jogo (ver [rotas da API](../../docs/api/rotas.md)).
- Não há pagamento: clicar em Comprar já marca o jogo como seu.
- O prazo de 30 dias aparece no status, mas a página ainda não conta os dias nem marca atrasos.
- Os jogos ficam só na memória e voltam para os 3 exemplos ao recarregar a página. Os exemplos usam a capa reserva (degradê com a inicial).
- A busca no RAWG fica para a API, para não expor a chave no navegador.

## Organização dos arquivos

| Arquivo | Para que serve |
|---|---|
| [index.html](index.html) | Estrutura da página: cabeçalho, formulário e listagem |
| [css/styles.css](css/styles.css) | Estilização, com cores e espaçamentos em variáveis no `:root` |
| [js/app.js](js/app.js) | Interações: validação, cadastro, aluguel, devolução, compra e remoção |

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
