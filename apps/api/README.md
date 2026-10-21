# apps/api/

Backend do STAYVILE.

Responsável por buscar jogos no RAWG, guardar as fichas no banco local e controlar empréstimos, devoluções e atrasos.

## Organização em camadas

A requisição passa pelas camadas nesta ordem, e a resposta volta pelo caminho inverso:

```
routes → middlewares → controllers → services → repositories → models
```

| Pasta | Para que serve |
|---|---|
| [src/routes/](src/routes/) | Liga cada URL ao controller certo |
| [src/middlewares/](src/middlewares/) | Autenticação, validação e logs |
| [src/controllers/](src/controllers/) | Recebe a requisição e devolve a resposta |
| [src/services/](src/services/) | Regras de negócio |
| [src/repositories/](src/repositories/) | Consultas ao banco |
| [src/models/](src/models/) | Entidades e schemas |
| [tests/](tests/) | Testes automatizados do backend |

## Como rodar

A definir depois da escolha da stack (ver `docs/adr/`).
