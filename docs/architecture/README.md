# architecture/

Diagramas e modelagem do sistema.

## O que guardar aqui

- **Modelagem de dados** (`modelagem-dados.md`): tabelas, campos, relacionamentos (1:1, 1:N, N:N) e campos obrigatórios.
- **Diagramas de arquitetura**: como front, back, banco e a API externa do RAWG se conectam.

Os diagramas podem ser feitos no papel, no dbdiagram.io ou no draw.io. Salve a imagem ou o link aqui.

## Convenções do banco

- Tabelas no plural: `games`, `loans`.
- Colunas em snake_case.
- Colunas de controle: `created_at`, `updated_at`, `deleted_at`.
- Chave estrangeira explícita: `game_id → games.id`.
- UUID ou serial nas chaves: decidir em um ADR.
- Migration aplicada não se edita. Uma nova migration corrige a anterior.
