# ADR 0001 - UUID ou serial nas chaves primárias

## Status
Aceito

## Contexto
A modelagem inicial (`docs/architecture/modelagem-dados.md`) tem as tabelas `users`, `games`, `loans`, `genres` e `game_genres`. Todas as chaves primárias e estrangeiras dependem do tipo escolhido para o `id`, então a decisão precisa vir antes da primeira migration. Trocar depois exige migrar todas as FKs.

Restrições do projeto:

- Quem pega jogo emprestado tem conta e login, e a API vai expor ids em rotas como `/users/:id` e `/loans/:id`.
- O volume é pequeno: um acervo de jogos e os empréstimos de uma biblioteca.
- O `rawg_id` é o id do jogo no RAWG. Ele continua inteiro e não entra nesta decisão.

## Decisão
Usar **UUID** como chave primária em todas as tabelas do projeto, gerado pelo banco.

## Alternativas consideradas
- **Serial (inteiro autoincremento)**
  - Prós: simples, ocupa menos espaço, fácil de ler e de digitar ao depurar (`/loans/12`), ordem de criação embutida no número.
  - Contras: ids sequenciais nas URLs mostram quantos usuários e empréstimos existem e facilitam tentar ids vizinhos (`/loans/13`, `/loans/14`). O id só existe depois do insert.
- **UUID**
  - Prós: não dá para adivinhar o id seguinte nem contar registros pela URL. Pode ser gerado antes do insert (no back ou no front) sem consultar o banco.
  - Contras: ocupa mais espaço (16 bytes contra 4), é ruim de ler e digitar ao depurar e não indica a ordem de criação. Esses custos não pesam no volume deste projeto.

## Consequências
- Fica mais fácil: expor ids na API sem revelar volume nem convidar a tentativa de ids vizinhos; criar registros relacionados sem esperar o id do banco.
- Fica mais difícil: depurar à mão, porque o id é longo. Para ordenar por criação, usar `created_at`, não o `id`.
- O UUID não substitui a checagem de permissão. A API continua precisando garantir que um usuário só veja os próprios empréstimos.
- A forma de gerar o UUID depende do banco escolhido. No PostgreSQL 13 ou mais novo existe `gen_random_uuid()` sem extensão. Se o banco for outro, confirmar o suporte no ADR da escolha do banco.
- `docs/architecture/modelagem-dados.md` foi atualizado para usar `uuid` em todas as chaves.
