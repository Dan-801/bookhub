# Modelagem de dados

Pseudo-modelagem inicial do banco da STAYVILE, a biblioteca digital de jogos do projeto BookHub.

O objetivo é ter o core do banco desenhado antes da primeira migration: quais entidades existem, como se relacionam e quais campos são obrigatórios.

A STAYVILE funciona como um marketplace: qualquer usuário pode anunciar os próprios jogos e escolher se oferece cada um para **alugar** (valor mensal, por 30 dias), para **vender** (valor maior, o jogo fica com o comprador para sempre) ou as duas coisas. Os jogos são digitais, então não há controle de cópias.

No texto, aluguel e empréstimo são a mesma coisa. A tabela continua se chamando `loans`.

## Visão geral

| Tabela | O que guarda | No MVP? |
|---|---|---|
| `users` | Conta de quem usa a plataforma: anuncia, aluga e compra jogos | Sim |
| `games` | Jogo anunciado por um usuário: ficha do RAWG e preços de aluguel e venda | Sim |
| `loans` | Cada aluguel: quem alugou, qual jogo, prazo e devolução | Sim |
| `purchases` | Cada compra: quem comprou, qual jogo e por quanto | Sim |
| `genres` | Gêneros de jogo vindos do RAWG | Não (v2) |
| `game_genres` | Liga jogos e gêneros (tabela de junção) | Não (v2) |

## Relacionamentos

| Relação | Tipo | Como funciona |
|---|---|---|
| `users` → `games` | 1:N | Um usuário pode anunciar vários jogos; cada jogo tem um único dono (`owner_id`) |
| `users` → `loans` | 1:N | Um usuário pode ter vários aluguéis; cada aluguel é de um único usuário |
| `games` → `loans` | 1:N | Um jogo pode ser alugado várias vezes; cada aluguel é de um único jogo |
| `users` → `purchases` | 1:N | Um usuário pode comprar vários jogos; cada compra é de um único usuário |
| `games` → `purchases` | 1:N | Um jogo pode ser vendido para várias pessoas; cada compra é de um único jogo |
| `loans` → `purchases` | 1:0..1 | Quando quem está alugando compra o jogo, a compra aponta para o aluguel que ela encerrou |
| `games` ↔ `genres` | N:N | Um jogo tem vários gêneros e um gênero tem vários jogos, ligados pela `game_genres` |

```
users 1 ──── N games                      (dono do anúncio: owner_id)
users 1 ──── N loans      N ──── 1 games
users 1 ──── N purchases  N ──── 1 games
loans 1 ──── 0..1 purchases               (loan_id, quando o aluguel vira compra)
games N ──── N genres                     (via game_genres)
```

## Tabelas

Legenda: **PK** chave primária · **FK** chave estrangeira · **UQ** valor único · **Obrig.** campo obrigatório (NOT NULL).

### users

Conta do usuário. Precisa de login para anunciar, alugar ou comprar um jogo.

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK (ver ADR 0001) |
| `name` | texto | Sim | |
| `email` | texto | Sim | UQ, usado no login |
| `password_hash` | texto | Sim | Guarda só o hash, nunca a senha |
| `role` | texto | Sim | `member` ou `admin`, padrão `member` |
| `created_at` | data/hora | Sim | |
| `updated_at` | data/hora | Sim | |
| `deleted_at` | data/hora | Não | Preenchido quando a conta é desativada |

### games

Jogo anunciado por um usuário. Os dados de catálogo vêm do RAWG; o dono define os preços.

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK |
| `owner_id` | uuid | Sim | FK `owner_id → users.id`, quem anunciou o jogo |
| `rawg_id` | inteiro | Sim | UQ junto com `owner_id`: o mesmo dono não anuncia o mesmo jogo duas vezes |
| `name` | texto | Sim | |
| `released_at` | data | Não | Nem todo jogo do RAWG tem data |
| `cover_url` | texto | Não | Imagem de capa do RAWG |
| `rental_price` | decimal (10,2) | Não | Valor do aluguel por mês, maior que 0. Vazio = não oferece aluguel |
| `sale_price` | decimal (10,2) | Não | Valor da venda, maior que 0. Vazio = não oferece venda |
| `created_at` | data/hora | Sim | |
| `updated_at` | data/hora | Sim | |
| `deleted_at` | data/hora | Não | Retira o anúncio sem apagar o histórico |

Regras de preço, que viram `CHECK` no banco:

- Pelo menos um dos dois preços precisa estar preenchido.
- Com os dois preenchidos, `sale_price` precisa ser maior que `rental_price`.

### loans

Um registro por aluguel.

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK |
| `user_id` | uuid | Sim | FK `user_id → users.id` |
| `game_id` | uuid | Sim | FK `game_id → games.id` |
| `loaned_at` | data/hora | Sim | Quando foi alugado |
| `due_at` | data/hora | Sim | Prazo de devolução: sempre 30 dias depois de `loaned_at` |
| `returned_at` | data/hora | Não | Vazio = ainda alugado. Também é preenchido quando o aluguel vira compra |
| `rental_price` | decimal (10,2) | Sim | Valor cobrado no dia do aluguel |
| `created_at` | data/hora | Sim | |
| `updated_at` | data/hora | Sim | |

`loans` não tem `deleted_at`: aluguel é histórico e não se apaga. Um lançamento errado se corrige com outro registro ou com a devolução.

### purchases

Um registro por compra. A compra é vitalícia: o jogo fica com o comprador para sempre.

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK |
| `user_id` | uuid | Sim | FK `user_id → users.id`, quem comprou |
| `game_id` | uuid | Sim | FK `game_id → games.id` |
| `loan_id` | uuid | Não | FK `loan_id → loans.id`, UQ. Preenchido quando a compra encerrou um aluguel |
| `purchased_at` | data/hora | Sim | Quando foi comprado |
| `sale_price` | decimal (10,2) | Sim | Valor cobrado no dia da compra |
| `created_at` | data/hora | Sim | |

UQ (`user_id`, `game_id`): cada usuário compra um jogo uma única vez.

`purchases` não tem `updated_at` nem `deleted_at`: compra é histórico e não muda.

### genres (v2)

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK |
| `rawg_id` | inteiro | Sim | UQ |
| `name` | texto | Sim | |
| `created_at` | data/hora | Sim | |
| `updated_at` | data/hora | Sim | |

### game_genres (v2)

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `game_id` | uuid | Sim | FK `game_id → games.id` |
| `genre_id` | uuid | Sim | FK `genre_id → genres.id` |

PK composta (`game_id`, `genre_id`): o mesmo par não se repete.

## Decisões de modelagem

- **Cada jogo tem um dono.** Como qualquer usuário anuncia, o mesmo jogo do RAWG pode aparecer em anúncios de donos diferentes. Por isso `rawg_id` é único por dono (`owner_id`, `rawg_id`), e não na tabela toda. Os dados de catálogo (nome, data, capa) se repetem em cada anúncio, o que é aceitável no MVP. Se pesar, o catálogo pode ser separado dos anúncios depois.
- **Preço vazio = modalidade não oferecida.** Não existe coluna "tipo de anúncio": quem diz se o jogo pode ser alugado ou vendido são os próprios preços.
- **Sem controle de cópias.** Os jogos são digitais, então não há quantidade nem "esgotado". A única trava é uma cópia em aberto por jogo para cada usuário.
- **Atraso é calculado, não gravado.** Um aluguel está atrasado quando `returned_at` está vazio e `due_at` já passou. Assim não existe coluna de status para atualizar todo dia.
- **Os preços são copiados para o aluguel e para a compra.** Se o dono mudar `games.rental_price` ou `games.sale_price`, os registros antigos continuam com o valor da época.
- **Alugou e depois comprou:** o aluguel é encerrado (`returned_at` com a hora da compra) e a compra guarda o `loan_id` dele. O histórico mostra as duas coisas, e o aluguel não corre o risco de virar atrasado depois.
- **As regras de aluguel e compra ficam nos services**, não em trigger do banco. No banco ficam só os `CHECK` de preço e as chaves únicas.
- **`rawg_id` único em `genres`** garante que buscar o mesmo gênero duas vezes no RAWG não cria registros duplicados.

## Pendências (viram ADR)

- **Estratégia de autenticação (JWT ou sessão).** Se for sessão guardada no banco, entra uma tabela `sessions` ligada a `users` (1:N).
- **Marketplace (jogos com dono).** A troca de "uma biblioteca" para "cada usuário anuncia os próprios jogos" muda permissões e tabelas, e merece ADR própria.

## Diagrama para o dbdiagram.io

Cole o bloco abaixo em [dbdiagram.io](https://dbdiagram.io) para gerar o diagrama visual.

```dbml
Table users {
  id uuid [pk]
  name varchar [not null]
  email varchar [not null, unique]
  password_hash varchar [not null]
  role varchar [not null, default: 'member', note: 'member | admin']
  created_at timestamp [not null]
  updated_at timestamp [not null]
  deleted_at timestamp
}

Table games {
  id uuid [pk]
  owner_id uuid [not null, ref: > users.id]
  rawg_id integer [not null]
  name varchar [not null]
  released_at date
  cover_url varchar
  rental_price decimal(10,2) [note: 'por mês; vazio = não aluga']
  sale_price decimal(10,2) [note: 'vazio = não vende; maior que rental_price']
  created_at timestamp [not null]
  updated_at timestamp [not null]
  deleted_at timestamp

  indexes {
    (owner_id, rawg_id) [unique]
  }
}

Table loans {
  id uuid [pk]
  user_id uuid [not null, ref: > users.id]
  game_id uuid [not null, ref: > games.id]
  loaned_at timestamp [not null]
  due_at timestamp [not null, note: 'loaned_at + 30 dias']
  returned_at timestamp
  rental_price decimal(10,2) [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table purchases {
  id uuid [pk]
  user_id uuid [not null, ref: > users.id]
  game_id uuid [not null, ref: > games.id]
  loan_id uuid [unique, ref: - loans.id]
  purchased_at timestamp [not null]
  sale_price decimal(10,2) [not null]
  created_at timestamp [not null]

  indexes {
    (user_id, game_id) [unique]
  }
}

Table genres {
  id uuid [pk]
  rawg_id integer [not null, unique]
  name varchar [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}

Table game_genres {
  game_id uuid [not null, ref: > games.id]
  genre_id uuid [not null, ref: > genres.id]

  indexes {
    (game_id, genre_id) [pk]
  }
}
```
