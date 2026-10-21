# adr/

Architecture Decision Records: a memória das decisões importantes do projeto.

Cada ADR é um documento curto que registra uma decisão, o contexto em que foi tomada, as alternativas consideradas e as consequências.

## Quando escrever um ADR

Vale um ADR quando a decisão é:

- difícil de reverter;
- de impacto amplo;
- motivo de dúvida real.

Exemplos: escolha do banco de dados, estratégia de autenticação, REST ou GraphQL, estratégia de branches.

Não precisa de ADR: nome de variável, lib de formatação de data, qualquer coisa fácil de desfazer.

## Regras

- Numeração sequencial: `0001-titulo-da-decisao.md`, `0002-...`.
- Nunca edite um ADR antigo para "corrigir". Crie um novo que referencia e substitui o anterior.

## Modelo

```markdown
# ADR 0001 - Título da decisão

## Status
Proposto | Aceito | Substituído por ADR XXXX

## Contexto
O problema e as restrições.

## Decisão
O que foi escolhido.

## Alternativas consideradas
- Opção A: prós / contras
- Opção B: prós / contras

## Consequências
O que fica mais fácil? O que fica mais difícil?
```
