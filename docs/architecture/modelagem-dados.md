# Modelagem de dados

Pseudo-modelagem inicial do banco da STAYVILE, a biblioteca digital de jogos do projeto BookHub.

O objetivo é ter o core do banco desenhado antes da primeira migration: quais entidades existem, como se relacionam e quais campos são obrigatórios.

## Visão geral

| Tabela | O que guarda | No MVP? |
|---|---|---|
| `users` | Conta de quem usa a plataforma e pega jogos emprestados | Sim |
| `games` | Ficha do jogo trazida do RAWG, com quantidade e valor de aluguel | Sim |
| `loans` | Cada empréstimo: quem pegou, qual jogo, prazo e devolução | Sim |
| `genres` | Gêneros de jogo vindos do RAWG | Não (v2) |
| `game_genres` | Liga jogos e gêneros (tabela de junção) | Não (v2) |

## Relacionamentos

| Relação | Tipo | Como funciona |
|---|---|---|
| `users` → `loans` | 1:N | Um usuário pode ter vários empréstimos; cada empréstimo é de um único usuário |
| `games` → `loans` | 1:N | Um jogo pode ser emprestado várias vezes; cada empréstimo é de um único jogo |
| `games` ↔ `genres` | N:N | Um jogo tem vários gêneros e um gênero tem vários jogos, ligados pela `game_genres` |

```
users 1 ──── N loans N ──── 1 games N ──── N genres
                                    (via game_genres)
```

## Tabelas

Legenda: **PK** chave primária · **FK** chave estrangeira · **UQ** valor único · **Obrig.** campo obrigatório (NOT NULL).

### users

Conta do usuário. Precisa de login para pegar um jogo emprestado.

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

Ficha do jogo. Os dados de catálogo vêm do RAWG; quantidade e valor são definidos aqui.

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK |
| `rawg_id` | inteiro | Sim | UQ, evita guardar o mesmo jogo duas vezes |
| `name` | texto | Sim | |
| `released_at` | data | Não | Nem todo jogo do RAWG tem data |
| `cover_url` | texto | Não | Imagem de capa do RAWG |
| `quantity_total` | inteiro | Sim | Cópias que a biblioteca tem, maior ou igual a 0 |
| `rental_price` | decimal (10,2) | Sim | Valor atual do aluguel, maior ou igual a 0 |
| `created_at` | data/hora | Sim | |
| `updated_at` | data/hora | Sim | |
| `deleted_at` | data/hora | Não | Retira o jogo do acervo sem apagar o histórico |

### loans

Um registro por empréstimo de uma cópia.

| Coluna | Tipo | Obrig. | Regra |
|---|---|---|---|
| `id` | uuid | Sim | PK |
| `user_id` | uuid | Sim | FK `user_id → users.id` |
| `game_id` | uuid | Sim | FK `game_id → games.id` |
| `loaned_at` | data/hora | Sim | Quando foi emprestado |
| `due_at` | data/hora | Sim | Prazo de devolução, depois de `loaned_at` |
| `returned_at` | data/hora | Não | Vazio = ainda emprestado |
| `rental_price` | decimal (10,2) | Sim | Valor cobrado no dia do empréstimo |
| `created_at` | data/hora | Sim | |
| `updated_at` | data/hora | Sim | |

`loans` não tem `deleted_at`: empréstimo é histórico e não se apaga. Um lançamento errado se corrige com outro registro ou com a devolução.

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

- **Quantidade disponível é calculada, não gravada.** Disponível = `games.quantity_total` menos os `loans` daquele jogo com `returned_at` vazio. Gravar esse número em uma coluna abriria espaço para ele ficar diferente da realidade.
- **Atraso é calculado, não gravado.** Um empréstimo está atrasado quando `returned_at` está vazio e `due_at` já passou. Assim não existe coluna de status para atualizar todo dia.
- **O valor do aluguel é copiado para o empréstimo.** Se `games.rental_price` mudar, os empréstimos antigos continuam com o valor da época.
- **Só se empresta jogo com cópia disponível.** Essa regra fica no service de empréstimos, não em trigger do banco.
- **`rawg_id` único** em `games` e `genres` garante que buscar o mesmo jogo duas vezes no RAWG não cria fichas duplicadas.

## Pendências (viram ADR)

- **Estratégia de autenticação (JWT ou sessão).** Se for sessão guardada no banco, entra uma tabela `sessions` ligada a `users` (1:N).

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
  rawg_id integer [not null, unique]
  name varchar [not null]
  released_at date
  cover_url varchar
  quantity_total integer [not null]
  rental_price decimal(10,2) [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
  deleted_at timestamp
}

Table loans {
  id uuid [pk]
  user_id uuid [not null, ref: > users.id]
  game_id uuid [not null, ref: > games.id]
  loaned_at timestamp [not null]
  due_at timestamp [not null]
  returned_at timestamp
  rental_price decimal(10,2) [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
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
