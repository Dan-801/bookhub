# Rotas da API

Planejamento das rotas da API da STAYVILE antes da implementação.

O objetivo é deixar claro o que cada rota recebe, o que valida e o que responde, para servir de referência ao backend. Tudo aqui segue a [modelagem de dados](../architecture/modelagem-dados.md). Quando as rotas forem implementadas, o contrato detalhado vai para o `openapi.yaml`.

A STAYVILE funciona como um marketplace: qualquer usuário anuncia os próprios jogos e escolhe se oferece cada um para **alugar** (valor mensal, por 30 dias), para **vender** (valor maior, vitalício) ou as duas coisas. Os jogos são digitais, então não há controle de cópias. No texto, aluguel e empréstimo são a mesma coisa; o recurso continua se chamando `/loans`.

## Entidades da entrega e onde estão na STAYVILE

A STAYVILE é uma biblioteca de jogos, então algumas entidades do BookHub têm outro nome aqui.

| Entidade da entrega | Na STAYVILE | Recurso | Tabela |
|---|---|---|---|
| Usuários | Usuários | `/users`, `/auth` | `users` |
| Obras | Jogos | `/games` | `games` |
| Categorias | Gêneros | `/genres` | `genres`, `game_genres` |
| Empresas | Fora do MVP | — | — |
| Relação entre usuários e empresas | Fora do MVP | — | — |
| *(além da entrega)* | Aluguéis (empréstimos) | `/loans` | `loans` |
| *(além da entrega)* | Compras | `/purchases` | `purchases` |

- **Gêneros entram no MVP** por causa desta entrega. A modelagem ainda marca `genres` e `game_genres` como v2.
- **Aluguéis e compras** não estão na lista da entrega, mas são o centro do MVP (alugar, devolver, ver atrasados e comprar). Sem eles o backend não fica planejado.
- **Empresas** ficam de fora por enquanto. O motivo e o impacto de incluir depois estão em [Fora do escopo do MVP](#fora-do-escopo-do-mvp).

## Regras gerais

Valem para todas as rotas, salvo quando a rota disser outra coisa.

- **Formato:** corpo da requisição e da resposta em JSON. Datas em ISO 8601, em UTC (ex.: `2026-11-04T14:30:00Z`).
- **IDs:** UUID (ver [ADR 0001](../adr/0001-uuid-ou-serial-nas-chaves.md)). Um ID com formato inválido no caminho retorna `400`.
- **Registro inexistente:** um ID no caminho ou no body que não existe, ou que aponta para um registro desativado (`deleted_at` preenchido), retorna `404`.
- **Campos não aceitos:** campo desconhecido ou que a rota não permite alterar retorna `400`. A API não ignora em silêncio o que não vai usar.
- **Senha:** `password_hash` nunca aparece em resposta.
- **Campos calculados:** `status` (aluguéis) e `is_suspended` (usuários) aparecem nas respostas, mas não são gravados e não são aceitos no body. Ver [Decisões de modelagem](../architecture/modelagem-dados.md#decisões-de-modelagem).
- **Listas:** paginadas com `page` (padrão `1`) e `limit` (padrão `20`, máximo `100`). A resposta vem como `{ "data": [...], "page": 1, "limit": 20, "total": 57 }`.

### Autenticação e permissão

O login usa **sessão guardada no banco**:

- No `POST /auth/login`, o backend cria uma sessão e devolve o identificador dela em um cookie `HttpOnly`, `Secure` e `SameSite=Lax`. O JavaScript da página não consegue ler esse cookie, o que dificulta o roubo da sessão por script.
- A cada requisição, o backend procura a sessão do cookie. Sessão inexistente, expirada ou encerrada conta como sem login válido.
- No `POST /auth/logout`, a sessão é apagada no banco e o cookie é limpo.

Isso pede a tabela `sessions` ligada a `users` (1:N), já prevista nas pendências da modelagem.

Cada rota indica quem pode chamá-la:

| Nível | Quem |
|---|---|
| Pública | Qualquer pessoa, sem login |
| Membro | Qualquer usuário logado (`member` ou `admin`) |
| Dono ou admin | O usuário dono do registro, ou um `admin`. Cada rota diz quem é o dono: a própria conta, o jogo que o usuário anunciou, ou o aluguel ou a compra que ele fez |
| Admin | Só usuários com `role = admin` |

Em todas as rotas: **sem login válido → `401`; logado, mas sem permissão → `403`.**

### Status codes usados

| Status | Quando |
|---|---|
| `200 OK` | Consulta ou alteração feita, com corpo na resposta |
| `201 Created` | Registro criado |
| `204 No Content` | Operação feita, sem corpo na resposta (desativar, logout) |
| `400 Bad Request` | Campo obrigatório faltando, formato inválido ou campo não aceito |
| `401 Unauthorized` | Rota exige login e não há login válido, ou credenciais erradas no login |
| `403 Forbidden` | Usuário logado, mas sem permissão para a operação |
| `404 Not Found` | Registro não existe ou está desativado |
| `409 Conflict` | Dados válidos, mas que contrariam uma regra do negócio (e-mail repetido, jogo já comprado) |
| `502 Bad Gateway` | O RAWG não respondeu ou respondeu com erro |
| `500 Internal Server Error` | Erro inesperado no servidor |

### Formato de erro

Toda resposta de erro segue o mesmo formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos.",
    "details": [
      { "field": "email", "message": "Formato de e-mail inválido." }
    ]
  }
}
```

`details` só aparece em erros de validação (`400`).

## Resumo das rotas

| Método | Caminho | Objetivo | Acesso |
|---|---|---|---|
| `POST` | `/users` | Criar conta | Pública |
| `POST` | `/auth/login` | Entrar | Pública |
| `POST` | `/auth/logout` | Sair | Membro |
| `GET` | `/users/me` | Ver a própria conta | Membro |
| `GET` | `/users` | Listar usuários | Admin |
| `GET` | `/users/:id` | Ver um usuário | Dono ou admin |
| `PATCH` | `/users/:id` | Alterar dados da conta | Dono ou admin |
| `DELETE` | `/users/:id` | Desativar conta | Dono ou admin |
| `GET` | `/rawg/games` | Buscar jogos no RAWG | Membro |
| `GET` | `/games` | Listar jogos anunciados | Pública |
| `GET` | `/games/:id` | Ver a ficha de um jogo | Pública |
| `POST` | `/games` | Anunciar jogo a partir do RAWG | Membro |
| `PATCH` | `/games/:id` | Alterar preços de aluguel e venda | Dono ou admin |
| `PUT` | `/games/:id/genres` | Definir os gêneros de um jogo | Dono ou admin |
| `DELETE` | `/games/:id` | Retirar o anúncio | Dono ou admin |
| `GET` | `/genres` | Listar gêneros | Pública |
| `GET` | `/genres/:id` | Ver um gênero | Pública |
| `POST` | `/genres` | Cadastrar gênero a partir do RAWG | Admin |
| `PATCH` | `/genres/:id` | Renomear gênero | Admin |
| `DELETE` | `/genres/:id` | Excluir gênero | Admin |
| `POST` | `/loans` | Alugar um jogo | Membro |
| `GET` | `/loans` | Listar aluguéis | Membro |
| `GET` | `/loans/:id` | Ver um aluguel | Dono ou admin |
| `POST` | `/loans/:id/return` | Registrar devolução | Dono ou admin |
| `POST` | `/purchases` | Comprar um jogo | Membro |
| `GET` | `/purchases` | Listar compras | Membro |
| `GET` | `/purchases/:id` | Ver uma compra | Dono ou admin |

## Usuários

### `POST /users`

- **Objetivo:** criar uma conta. Toda conta nova é `member`.
- **Acesso:** pública.
- **Body:**

  ```json
  { "name": "Ana Souza", "email": "ana@email.com", "password": "senha-forte-123" }
  ```

- **Validações:**
  - `name`: obrigatório, texto, sem só espaços, até 100 caracteres.
  - `email`: obrigatório, formato de e-mail válido. É gravado em minúsculas e sem espaços nas pontas.
  - `password`: obrigatório, no mínimo 8 caracteres. É gravado só como hash.
  - `role` não é aceito: ninguém escolhe o próprio papel no cadastro.

| Status | Quando |
|---|---|
| `201` | Conta criada. Retorna o usuário (`id`, `name`, `email`, `role`, `created_at`) |
| `400` | Campo obrigatório faltando, formato inválido ou `role` enviado |
| `409` | Já existe conta com esse e-mail, inclusive conta desativada |

### `POST /auth/login`

- **Objetivo:** entrar na conta.
- **Acesso:** pública.
- **Body:** `email` e `password`.
- **Validações:**
  - `email` e `password` obrigatórios.
  - A mensagem de erro é a mesma para e-mail inexistente e senha errada, para não revelar quais e-mails têm conta.
  - Conta desativada não entra.

| Status | Quando |
|---|---|
| `200` | Login feito. Cria a sessão, devolve o cookie de sessão e retorna o usuário |
| `400` | `email` ou `password` faltando |
| `401` | E-mail ou senha errados, ou conta desativada |

### `POST /auth/logout`

- **Objetivo:** encerrar o login atual. Apaga a sessão no banco e limpa o cookie.
- **Acesso:** membro.
- **Entrada:** nenhuma.

| Status | Quando |
|---|---|
| `204` | Logout feito |
| `401` | Não há login válido |

### `GET /users/me`

- **Objetivo:** ver os dados da própria conta. É o que a página usa para saber quem está logado. A resposta traz `is_suspended`, para a página avisar quando o usuário está suspenso (ver [Regras dos aluguéis](#regras-dos-aluguéis)).
- **Acesso:** membro.
- **Entrada:** nenhuma.

| Status | Quando |
|---|---|
| `200` | Retorna o usuário logado |
| `401` | Não há login válido |

### `GET /users`

- **Objetivo:** listar os usuários.
- **Acesso:** admin.
- **Query:**
  - `search` (opcional): busca em `name` e `email`.
  - `role` (opcional): `member` ou `admin`.
  - `page` e `limit`.
- **Validações:** `role`, se enviado, só aceita `member` ou `admin`. Contas desativadas não aparecem.

| Status | Quando |
|---|---|
| `200` | Retorna a lista paginada |
| `400` | Filtro com valor inválido |
| `401` | Não há login válido |
| `403` | Usuário logado não é admin |

### `GET /users/:id`

- **Objetivo:** ver um usuário.
- **Acesso:** dono ou admin.
- **Parâmetro:** `id` do usuário.

| Status | Quando |
|---|---|
| `200` | Retorna o usuário |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Um membro tentando ver outro usuário |
| `404` | Usuário não existe ou está desativado |

### `PATCH /users/:id`

- **Objetivo:** alterar dados da conta. Só os campos enviados mudam.
- **Acesso:** dono ou admin.
- **Parâmetro:** `id` do usuário.
- **Body (todos opcionais, pelo menos um):** `name`, `email`, `password`, `current_password`, `role`.
- **Validações:**
  - `name`, `email` e `password` seguem as mesmas regras do `POST /users`.
  - Para trocar a própria senha, o dono precisa enviar também `current_password`, e ela precisa estar correta. Um admin trocando a senha de outro usuário não precisa dela.
  - Quando a senha muda, as outras sessões desse usuário são encerradas. A sessão de quem fez a troca continua ativa.
  - `role` só pode ser alterado por admin, e só aceita `member` ou `admin`.
  - Um admin não pode tirar o próprio papel de admin. Isso evita ficar sem nenhum admin.

| Status | Quando |
|---|---|
| `200` | Dados alterados. Retorna o usuário atualizado |
| `400` | Body vazio, formato inválido, campo não aceito ou `password` sem `current_password` |
| `401` | Não há login válido, ou `current_password` errada |
| `403` | Membro alterando outro usuário, membro enviando `role`, ou admin tirando o próprio papel de admin |
| `404` | Usuário não existe ou está desativado |
| `409` | O novo e-mail já pertence a outra conta |

### `DELETE /users/:id`

- **Objetivo:** desativar a conta. Preenche `deleted_at` e não apaga o registro, porque os aluguéis, as compras e os anúncios antigos continuam ligados a ele. Todas as sessões do usuário são encerradas, e os jogos que ele anuncia são retirados (`deleted_at`). As compras feitas por outras pessoas desses jogos continuam valendo.
- **Acesso:** dono ou admin.
- **Parâmetro:** `id` do usuário.
- **Validações:**
  - Não desativa conta com aluguel em aberto (`returned_at` vazio).
  - Não desativa conta de quem anuncia jogo que está alugado agora por outra pessoa.

| Status | Quando |
|---|---|
| `204` | Conta desativada |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Membro tentando desativar outro usuário |
| `404` | Usuário não existe ou já está desativado |
| `409` | O usuário tem aluguel em aberto, ou um jogo dele está alugado agora |

## Obras (jogos)

Qualquer membro pode anunciar jogos. O dono do anúncio é sempre o usuário logado que fez o cadastro (`owner_id`), e só ele ou um admin pode alterar ou retirar o anúncio.

Os dados de catálogo do jogo (`name`, `released_at`, `cover_url` e gêneros) vêm sempre do RAWG, buscados pelo backend. O body só traz o que é do anúncio: os preços de aluguel e de venda. Isso evita ficha com nome digitado errado e mantém a chave do RAWG fora do frontend.

**Regras de preço**, que valem no cadastro e na alteração:

- `rental_price` é o valor do aluguel **por mês** (30 dias). `sale_price` é o valor da venda.
- Preço vazio (`null`) quer dizer que a modalidade não é oferecida.
- Pelo menos um dos dois precisa estar preenchido.
- Os preços preenchidos precisam ser maiores que 0, com até 2 casas decimais.
- Com os dois preenchidos, `sale_price` precisa ser maior que `rental_price`.

### `GET /rawg/games`

- **Objetivo:** buscar jogos no RAWG pelo nome, para o usuário escolher qual anunciar. O backend repassa a busca ao RAWG com a chave guardada no servidor.
- **Acesso:** membro.
- **Query:** `search` (obrigatório), `page`.
- **Validações:** `search` obrigatório, com pelo menos 2 caracteres.
- **Resposta:** para cada jogo, `rawg_id`, `name`, `released_at`, `cover_url` e `already_listed` (se o usuário logado já anuncia esse jogo).

| Status | Quando |
|---|---|
| `200` | Retorna os resultados do RAWG (pode ser lista vazia) |
| `400` | `search` faltando ou curto demais |
| `401` | Não há login válido |
| `502` | O RAWG não respondeu ou respondeu com erro |

### `GET /games`

- **Objetivo:** listar os jogos anunciados.
- **Acesso:** pública.
- **Query:**
  - `search` (opcional): busca no nome.
  - `genre_id` (opcional): só jogos daquele gênero.
  - `offer` (opcional): `rental` mostra só jogos oferecidos para alugar; `sale`, só os oferecidos para vender.
  - `owner_id` (opcional): só os jogos de um dono.
  - `page` e `limit`.
- **Validações:** `genre_id` e `owner_id` precisam ser UUID; `offer` só aceita `rental` ou `sale`. Anúncios retirados não aparecem.
- **Resposta:** cada jogo traz o dono (`id` e `name`), `rental_price` e `sale_price`.

| Status | Quando |
|---|---|
| `200` | Retorna a lista paginada |
| `400` | Filtro com valor inválido |

### `GET /games/:id`

- **Objetivo:** ver a ficha completa de um jogo.
- **Acesso:** pública.
- **Parâmetro:** `id` do jogo.
- **Resposta:** dados do jogo, o dono (`id` e `name`), os dois preços e a lista de gêneros.

| Status | Quando |
|---|---|
| `200` | Retorna a ficha |
| `400` | `id` com formato inválido |
| `404` | Jogo não existe ou o anúncio foi retirado |

### `POST /games`

- **Objetivo:** anunciar um jogo a partir do RAWG.
- **Acesso:** membro. O dono do anúncio é o usuário logado.
- **Body:**

  ```json
  { "rawg_id": 3498, "rental_price": 12.50, "sale_price": 89.90 }
  ```

- **Validações:**
  - `rawg_id`: obrigatório, inteiro maior que 0, e precisa existir no RAWG.
  - `rental_price` e `sale_price`: seguem as [regras de preço](#obras-jogos). Quem não oferece uma modalidade envia `null` ou não envia o campo.
  - `owner_id` não é aceito: o dono é sempre quem está logado.
  - `name`, `released_at`, `cover_url` e gêneros não são aceitos: vêm do RAWG.
  - O usuário não pode já anunciar esse `rawg_id`, nem em anúncio retirado. Outro usuário pode anunciar o mesmo jogo.
- **O que o backend faz:** busca a ficha no RAWG, grava o jogo com o dono e liga os gêneros. Gênero que ainda não existe em `genres` é criado na hora.

| Status | Quando |
|---|---|
| `201` | Jogo anunciado. Retorna a ficha com os gêneros |
| `400` | Campo obrigatório faltando, preço inválido, nenhum preço, venda menor ou igual ao aluguel, ou campo não aceito |
| `401` | Não há login válido |
| `404` | `rawg_id` não existe no RAWG |
| `409` | O usuário já anuncia esse jogo |
| `502` | O RAWG não respondeu ou respondeu com erro |

### `PATCH /games/:id`

- **Objetivo:** alterar os preços de aluguel e de venda. Enviar `null` deixa de oferecer aquela modalidade.
- **Acesso:** dono do jogo ou admin.
- **Parâmetro:** `id` do jogo.
- **Body (opcionais, pelo menos um):** `rental_price`, `sale_price`.
- **Validações:**
  - O resultado final precisa seguir as [regras de preço](#obras-jogos): pelo menos um preço preenchido e venda maior que aluguel.
  - Campos de catálogo, `rawg_id` e `owner_id` não são aceitos.
  - Mudar um preço não altera aluguéis e compras já feitos: cada registro guarda o valor da época.
  - Deixar de oferecer aluguel não encerra os aluguéis em aberto: eles seguem até a devolução.

| Status | Quando |
|---|---|
| `200` | Jogo alterado. Retorna a ficha atualizada |
| `400` | Body vazio, preço inválido, os dois preços vazios, venda menor ou igual ao aluguel, ou campo não aceito |
| `401` | Não há login válido |
| `403` | Usuário logado não é o dono do jogo nem admin |
| `404` | Jogo não existe ou o anúncio foi retirado |

### `PUT /games/:id/genres`

- **Objetivo:** definir a lista de gêneros de um jogo. A lista enviada substitui a anterior. É a rota que mantém a relação N:N em `game_genres`.
- **Acesso:** dono do jogo ou admin.
- **Parâmetro:** `id` do jogo.
- **Body:**

  ```json
  { "genre_ids": ["9b2f...", "c41a..."] }
  ```

- **Validações:**
  - `genre_ids`: obrigatório, lista de UUIDs, sem repetição. Lista vazia é aceita e deixa o jogo sem gênero.
  - Todos os gêneros da lista precisam existir.

| Status | Quando |
|---|---|
| `200` | Gêneros definidos. Retorna o jogo com a nova lista de gêneros |
| `400` | `genre_ids` faltando, fora do formato ou com repetição |
| `401` | Não há login válido |
| `403` | Usuário logado não é o dono do jogo nem admin |
| `404` | Jogo não existe, ou algum gênero da lista não existe |

### `DELETE /games/:id`

- **Objetivo:** retirar o anúncio. Preenche `deleted_at` e mantém o histórico de aluguéis e compras. Quem comprou continua com o jogo: a compra é vitalícia.
- **Acesso:** dono do jogo ou admin.
- **Parâmetro:** `id` do jogo.
- **Validações:** não retira jogo com aluguel em aberto.

| Status | Quando |
|---|---|
| `204` | Anúncio retirado |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Usuário logado não é o dono do jogo nem admin |
| `404` | Jogo não existe ou o anúncio já foi retirado |
| `409` | O jogo tem aluguel em aberto |

## Categorias (gêneros)

Como os jogos, os gêneros vêm do RAWG (`rawg_id` é obrigatório e único). Na maioria dos casos eles são criados sozinhos no `POST /games`. As rotas abaixo servem para consultar e fazer ajustes.

### `GET /genres`

- **Objetivo:** listar os gêneros, por exemplo para montar o filtro da página.
- **Acesso:** pública.
- **Entrada:** nenhuma. Sem paginação, porque são poucos registros.
- **Resposta:** cada gênero com `id`, `name` e quantos jogos anunciados ele tem.

| Status | Quando |
|---|---|
| `200` | Retorna a lista, em ordem alfabética |

### `GET /genres/:id`

- **Objetivo:** ver um gênero. Os jogos do gênero ficam em `GET /games?genre_id=...`.
- **Acesso:** pública.
- **Parâmetro:** `id` do gênero.

| Status | Quando |
|---|---|
| `200` | Retorna o gênero |
| `400` | `id` com formato inválido |
| `404` | Gênero não existe |

### `POST /genres`

- **Objetivo:** cadastrar um gênero do RAWG que ainda não veio junto com nenhum jogo.
- **Acesso:** admin.
- **Body:** `{ "rawg_id": 4 }`
- **Validações:**
  - `rawg_id`: obrigatório, inteiro maior que 0, e precisa existir no RAWG.
  - `name` não é aceito: vem do RAWG.
  - O `rawg_id` não pode já estar cadastrado.

| Status | Quando |
|---|---|
| `201` | Gênero cadastrado. Retorna o gênero |
| `400` | `rawg_id` faltando ou inválido, ou campo não aceito |
| `401` | Não há login válido |
| `403` | Usuário logado não é admin |
| `404` | `rawg_id` não existe no RAWG |
| `409` | Gênero com esse `rawg_id` já cadastrado |
| `502` | O RAWG não respondeu ou respondeu com erro |

### `PATCH /genres/:id`

- **Objetivo:** mudar o nome exibido de um gênero, por exemplo para traduzir "Action" para "Ação".
- **Acesso:** admin.
- **Parâmetro:** `id` do gênero.
- **Body:** `{ "name": "Ação" }`
- **Validações:** `name` obrigatório, sem só espaços, até 50 caracteres. `rawg_id` não pode ser alterado.

| Status | Quando |
|---|---|
| `200` | Gênero renomeado. Retorna o gênero |
| `400` | `name` faltando ou inválido, ou campo não aceito |
| `401` | Não há login válido |
| `403` | Usuário logado não é admin |
| `404` | Gênero não existe |

### `DELETE /genres/:id`

- **Objetivo:** excluir um gênero. `genres` não tem `deleted_at`, então a exclusão é definitiva.
- **Acesso:** admin.
- **Parâmetro:** `id` do gênero.
- **Validações:** não exclui gênero ligado a algum jogo. Primeiro é preciso tirar o gênero dos jogos com `PUT /games/:id/genres`.

| Status | Quando |
|---|---|
| `204` | Gênero excluído |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Usuário logado não é admin |
| `404` | Gênero não existe |
| `409` | O gênero está ligado a pelo menos um jogo |

## Aluguéis (empréstimos)

Não existe rota para apagar ou editar aluguel. Como diz a modelagem, aluguel é histórico: um lançamento errado se corrige com a devolução ou com um novo registro.

### Regras dos aluguéis

- **Prazo:** sempre 30 dias a partir de `loaned_at`. O preço do anúncio é o valor desse mês.
- **Só jogo oferecido para aluguel:** o jogo precisa ter `rental_price` preenchido.
- **Uma cópia por jogo:** o usuário só pode ter um aluguel em aberto de cada jogo. Depois de devolver, pode alugar o mesmo jogo de novo.
- **Sem limite de cópias nem de aluguéis por mês:** os jogos são digitais.
- **Quem comprou não aluga:** se o usuário já comprou o jogo, ele já é dele.
- **O dono não aluga o próprio jogo.**
- **Atraso:** passou do `due_at` sem devolução, o aluguel fica `overdue`.
- **Suspensão:** enquanto tiver algum aluguel atrasado, o usuário fica suspenso e não pode alugar nem comprar nenhum jogo. Ele continua podendo entrar, consultar os jogos, ver os próprios aluguéis e devolver o jogo. A suspensão acaba quando todos os atrasados forem devolvidos.
- Atraso e suspensão são calculados a partir dos aluguéis, não gravados. É a mesma lógica da modelagem: não existe coluna de status para atualizar todo dia.

### `POST /loans`

- **Objetivo:** alugar um jogo por 30 dias.
- **Acesso:** membro. O membro aluga para si mesmo. O admin pode registrar para qualquer usuário.
- **Body:**

  ```json
  { "game_id": "5e1c...", "user_id": "a7d0..." }
  ```

- **Validações:**
  - `game_id`: obrigatório, UUID de um jogo anunciado.
  - `user_id`: opcional. Se não vier, o aluguel é do usuário logado. Membro só pode enviar o próprio `id`.
  - O jogo precisa ser oferecido para aluguel (`rental_price` preenchido).
  - **O usuário não pode estar suspenso**, ou seja, não pode ter nenhum aluguel atrasado.
  - **O usuário não pode ter outro aluguel em aberto do mesmo jogo.**
  - **O usuário não pode já ter comprado o jogo.**
  - **O usuário não pode ser o dono do jogo.**
  - As regras valem também quando é um admin que registra o aluguel para o usuário.
  - `due_at`, `loaned_at`, `returned_at` e `rental_price` não são aceitos. O backend grava `loaned_at` com a hora atual, calcula `due_at` (30 dias depois) e copia `rental_price` do jogo.

| Status | Quando |
|---|---|
| `201` | Aluguel registrado. Retorna o aluguel com `status = open` |
| `400` | Campo obrigatório faltando ou campo não aceito |
| `401` | Não há login válido |
| `403` | Membro tentando registrar aluguel para outro usuário, ou usuário suspenso por atraso (`code: USER_SUSPENDED`) |
| `404` | Jogo ou usuário não existe, ou está desativado |
| `409` | O jogo não é oferecido para aluguel (`code: RENTAL_NOT_OFFERED`), o usuário já está alugando esse jogo (`code: GAME_ALREADY_LOANED`), já comprou o jogo (`code: GAME_ALREADY_OWNED`) ou é o dono dele (`code: OWN_GAME`) |

### `GET /loans`

- **Objetivo:** listar aluguéis. É a rota da tela de status e da lista de atrasados.
- **Acesso:** membro. O membro vê os aluguéis que fez e os dos jogos que anuncia. O admin vê todos.
- **Query:**
  - `status` (opcional): `open`, `overdue` ou `returned`. Atrasados = `?status=overdue`.
  - `user_id` (opcional, só admin).
  - `game_id` (opcional).
  - `page` e `limit`.
- **Validações:** `status` só aceita os três valores. `user_id` e `game_id` precisam ser UUID.
- **Resposta:** cada aluguel com `status` calculado (`overdue` quando `returned_at` está vazio e `due_at` já passou), e com o nome do jogo e do usuário. Ordem: `loaned_at` do mais recente para o mais antigo.

| Status | Quando |
|---|---|
| `200` | Retorna a lista paginada |
| `400` | Filtro com valor inválido |
| `401` | Não há login válido |
| `403` | Membro filtrando por `user_id` de outro usuário |

### `GET /loans/:id`

- **Objetivo:** ver um aluguel.
- **Acesso:** quem alugou, o dono do jogo ou admin.
- **Parâmetro:** `id` do aluguel.

| Status | Quando |
|---|---|
| `200` | Retorna o aluguel com `status` calculado |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Membro que não alugou nem é dono do jogo |
| `404` | Aluguel não existe |

### `POST /loans/:id/return`

- **Objetivo:** registrar a devolução. Grava `returned_at` com a hora atual e encerra o aluguel.
- **Acesso:** quem alugou ou admin.
- **Parâmetro:** `id` do aluguel.
- **Entrada:** nenhuma no body.
- **Validações:** o aluguel não pode já estar encerrado (devolvido ou convertido em compra). Devolução com atraso é aceita normalmente; o atraso fica visível pela comparação entre `returned_at` e `due_at`. Se era o último aluguel atrasado do usuário, a suspensão acaba na hora.

| Status | Quando |
|---|---|
| `200` | Devolução registrada. Retorna o aluguel com `status = returned` |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Membro tentando devolver aluguel de outro usuário |
| `404` | Aluguel não existe |
| `409` | Aluguel já encerrado |

## Compras

A compra é vitalícia: o jogo fica com o comprador para sempre, mesmo que o dono retire o anúncio depois. Não existe rota para apagar ou editar compra. Reembolso fica fora do MVP.

### Regras das compras

- **Só jogo oferecido para venda:** o jogo precisa ter `sale_price` preenchido.
- **Uma compra por jogo:** cada usuário compra um jogo uma única vez.
- **O dono não compra o próprio jogo.**
- **Usuário suspenso não compra** (ver [Regras dos aluguéis](#regras-dos-aluguéis)).
- **Alugou e depois comprou:** se o usuário está alugando o jogo, a compra encerra o aluguel (`returned_at` com a hora da compra) e guarda o `loan_id` dele. O aluguel não chega a ficar atrasado.

### `POST /purchases`

- **Objetivo:** comprar um jogo.
- **Acesso:** membro. O membro compra para si mesmo. O admin pode registrar para qualquer usuário.
- **Body:**

  ```json
  { "game_id": "5e1c...", "user_id": "a7d0..." }
  ```

- **Validações:**
  - `game_id`: obrigatório, UUID de um jogo anunciado.
  - `user_id`: opcional. Se não vier, a compra é do usuário logado. Membro só pode enviar o próprio `id`.
  - O jogo precisa ser oferecido para venda (`sale_price` preenchido).
  - **O usuário não pode estar suspenso.**
  - **O usuário não pode já ter comprado o jogo.**
  - **O usuário não pode ser o dono do jogo.**
  - `purchased_at`, `sale_price` e `loan_id` não são aceitos. O backend grava `purchased_at` com a hora atual, copia `sale_price` do jogo e, se houver aluguel em aberto desse jogo para o usuário, encerra o aluguel e preenche `loan_id`.

| Status | Quando |
|---|---|
| `201` | Compra registrada. Retorna a compra (com `loan_id`, se ela encerrou um aluguel) |
| `400` | Campo obrigatório faltando ou campo não aceito |
| `401` | Não há login válido |
| `403` | Membro tentando registrar compra para outro usuário, ou usuário suspenso por atraso (`code: USER_SUSPENDED`) |
| `404` | Jogo ou usuário não existe, ou está desativado |
| `409` | O jogo não é oferecido para venda (`code: SALE_NOT_OFFERED`), o usuário já comprou o jogo (`code: GAME_ALREADY_OWNED`) ou é o dono dele (`code: OWN_GAME`) |

### `GET /purchases`

- **Objetivo:** listar compras. É a rota da "minha biblioteca" de quem compra e das vendas de quem anuncia.
- **Acesso:** membro. O membro vê as compras que fez e as dos jogos que anuncia. O admin vê todas.
- **Query:**
  - `user_id` (opcional, só admin).
  - `game_id` (opcional).
  - `page` e `limit`.
- **Validações:** `user_id` e `game_id` precisam ser UUID.
- **Resposta:** cada compra com o nome do jogo e do comprador. Ordem: `purchased_at` da mais recente para a mais antiga.

| Status | Quando |
|---|---|
| `200` | Retorna a lista paginada |
| `400` | Filtro com valor inválido |
| `401` | Não há login válido |
| `403` | Membro filtrando por `user_id` de outro usuário |

### `GET /purchases/:id`

- **Objetivo:** ver uma compra.
- **Acesso:** quem comprou, o dono do jogo ou admin.
- **Parâmetro:** `id` da compra.

| Status | Quando |
|---|---|
| `200` | Retorna a compra |
| `400` | `id` com formato inválido |
| `401` | Não há login válido |
| `403` | Membro que não comprou nem é dono do jogo |
| `404` | Compra não existe |

## Fora do escopo do MVP

### Empresas e relação entre usuários e empresas

A entrega pede rotas para empresas e para a relação entre usuários e empresas. Elas ficam de fora porque a modelagem da STAYVILE não tem essas entidades: quem anuncia jogos são os próprios usuários, e o papel (`member` ou `admin`) fica no próprio `users`. Escrever rotas para tabelas que não existem deixaria este documento em conflito com a modelagem.

Se as empresas entrarem depois, o impacto depende do papel que elas tiverem:

- **Empresa só como cadastro** (usuário ligado a uma ou mais empresas): só soma. Entram `companies`, `company_users` e as rotas delas, sem mudar nada do que está aqui.
- **Empresa como dona de anúncios** (uma loja anunciando com vários funcionários): muda o que já existe.
  - O dono do jogo deixa de ser só um usuário: `games` passa a aceitar uma empresa como dona, e o `rawg_id` fica único por empresa.
  - O papel passa a ser por empresa, e as regras de `403` das rotas mudam.

Para não fechar portas, os caminhos ficaram simples (`/games`, `/loans`, `/purchases`). Um filtro como `?company_id=` pode ser acrescentado depois sem quebrar quem já usa a API.

### Pagamento e repasse ao dono

As rotas registram o aluguel e a compra, mas não cobram nada. Pagamento, repasse do valor ao dono do jogo, comissão da plataforma e reembolso ficam para depois do MVP.

## Pendências

- **ADR da autenticação:** a decisão por sessão no banco precisa ser registrada em ADR, como manda o [README dos ADRs](../adr/README.md).
- **Modelagem a atualizar:** entram a tabela `sessions` e os gêneros no MVP. Hoje a modelagem marca `genres` e `game_genres` como v2.
- **Duração da sessão:** falta decidir quanto tempo a sessão vale sem uso antes de expirar.
- **ADR do marketplace:** a decisão de que qualquer usuário anuncia os próprios jogos (com aluguel e venda) também precisa de ADR.
- **Quem cuida dos gêneros:** os gêneros são criados sozinhos quando alguém anuncia um jogo. Criar, renomear e excluir gêneros pelas rotas próprias continua só com o admin.
- **Suspenso pode comprar?** Este documento considera que não: a suspensão por atraso bloqueia aluguel e compra. Falta confirmar se quem está com o próprio aluguel atrasado pode comprar aquele jogo para encerrar o atraso.
- **Capa enviada pelo dono:** na página, o dono envia a capa como arquivo `.jpg`/`.jpeg` de até 2 MB. Aqui, a capa ainda vem do RAWG (`cover_url`). Para a API aceitar upload, falta decidir onde guardar os arquivos (pasta no servidor ou serviço de armazenamento) e se a capa enviada substitui a do RAWG.
- **Reativação:** não há rota para reativar conta desativada ou anúncio retirado. Por causa do `rawg_id` único por dono, quem retirou um anúncio não pode anunciar o mesmo jogo de novo.
- **Tamanhos de campo:** os limites de caracteres (nome até 100, senha com no mínimo 8, gênero até 50) são uma sugestão inicial.
