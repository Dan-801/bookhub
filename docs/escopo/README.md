# escopo/

O que entra e o que fica fora de cada versão do projeto.

## O que guardar aqui

- `mvp.md`: a menor versão que já entrega valor e pode ser verificada.
- `historias/`: uma história de usuário por arquivo, com critério de pronto.
- `fora-do-escopo.md`: o que foi pensado, discutido e adiado de propósito, com o motivo e a previsão de versão.

## Pergunta-guia do MVP

Sem isso, o produto ainda resolve o problema principal?

## Modelo de história

```markdown
## História
Como [quem usa],
quero [o que precisa fazer],
para [o valor que isso gera].

## Critério de pronto
- [ ] Ao [ação], acontece [resultado observável]
- [ ] Quando [caso de erro], o sistema [resposta]
- [ ] Outra pessoa consegue verificar sem me perguntar

## Fora desta história
- [o que foi pensado e adiado, e por quê]
```

Antes de fechar uma história: cabe em uma sprint? Cada critério tem resposta sim ou não? O que saiu está escrito?
