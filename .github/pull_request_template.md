## O que muda

<!-- Uma ou duas frases. Se corrige um erro, diga qual era e por que estava errado. -->

## Tipo

- [ ] Correção de conteúdo (número que não fecha, afirmação errada, contradição)
- [ ] Documento novo
- [ ] Tradução en-US
- [ ] Interface, validadores ou infraestrutura

## Portões

Rode os cinco, nesta ordem. O build é obrigatório: os validadores verificam o
conteúdo, e o build verifica o que o Docusaurus consegue resolver — já aconteceu
de os validadores passarem verdes com links que derrubavam a produção.

- [ ] `npm test`
- [ ] `npm run validate` — sem erro **e sem aviso**
- [ ] `npm run plan`
- [ ] `npm run roadmap`
- [ ] `npm run build`

Se `plan` ou `roadmap` alteraram arquivos, eles entram no commit.

## Se mexeu em conteúdo

- [ ] Toda afirmação nova é verificável, e as que vieram de fonte trazem autor e ano
- [ ] Nenhuma afirmação absoluta — "sempre", "nunca", "o melhor", "a única"
- [ ] Nenhum conceito redefinido: onde já existe documento canônico, há link
- [ ] Os números do Exemplo Real fecham entre si e com a conclusão narrada
- [ ] Se é `pattern`, `concept` ou `tradeoff`: "Quando Não Usar" traz condições
      concretas, não rótulos

## Se alterou um documento canônico

- [ ] `content_version` incrementado, se a mudança foi substantiva
- [ ] Tradução en-US sincronizada, com `translated_from_version` igual
- [ ] Todo link root-relative termina em `.md`
