# Como Contribuir

Este documento descreve como escrever, revisar e traduzir material para o
Software Architecture Mastery. A especificação completa está em [SPEC.md](SPEC.md);
aqui está o que você precisa na prática.

## O padrão de qualidade

A regra que governa tudo: **o material ensina raciocínio arquitetural, não
memorização.**

Na prática isso significa que uma contribuição é rejeitada se:

- Apresenta uma solução sem o problema que a originou.
- Apresenta um padrão sem discutir quando não usá-lo.
- Lista "prós e contras" sem declarar o eixo de comparação.
- Faz afirmação absoluta: "X é sempre melhor", "nunca use Y".
- Redefine um conceito que já tem documento canônico, em vez de linká-lo.
- Preenche uma seção do template com texto que não diz nada.

O último é o mais comum. **Omitir uma seção que não se aplica é correto.**
Preenchê-la para completar o formato é violação da spec.

## Antes de escrever

1. Confirme que o tópico não tem documento canônico. Procure o termo em
   `canonical_for` no front matter dos documentos existentes.
2. Confirme que os pré-requisitos do tópico já existem. Escrever fora da ordem
   do grafo produz redefinição e duplicação.
3. Leia dois ou três documentos vizinhos, para calibrar profundidade e voz.

## Escrevendo um documento

### Front matter

Obrigatório e validado no CI. Ver [SPEC.md §7.9](SPEC.md) para o schema completo.

```yaml
---
id: coupling                    # igual ao nome do arquivo
title: Acoplamento
sidebar_position: 8
description: Uma frase que diz o que o documento resolve.
doc_type: concept               # concept | foundation | pattern | tradeoff | case-study | exercise | adr | index | reference
level: 1
difficulty: iniciante
status: in-progress             # not-started | in-progress | complete
objective: >
  Ao terminar, o leitor consegue [capacidade observável].
prerequisites: [modularity]
related: [cohesion]
canonical_for: [acoplamento, coupling]
content_version: 1
last_reviewed: 2026-08-26
---
```

Para índices de seção, o `id` é o nome do diretório sem o prefixo numérico:
`docs/01-fundamentals/index.md` usa `id: fundamentals`.

### Estrutura

Siga o template do seu `doc_type` ([SPEC.md §7.3](SPEC.md)). Cada tipo tem
seções que nunca podem faltar:

| `doc_type` | Obrigatórias |
|---|---|
| `concept`, `pattern`, `tradeoff` | **Quando Não Usar** (condições concretas, não hedge genérico) · **Trade-offs** (com o eixo declarado) |
| `foundation` | **Por Que Isso Importa** · **Erros Comuns** |

O CI verifica a presença **e** o tamanho mínimo delas.

Use `foundation` para documentos definicionais — "Arquitetura vs. Design", por
exemplo — em que "quando não usar" não faz sentido porque não há o que aplicar.
Use `concept` quando o tópico prescreve uma ação cujo limite importa.

### Densidade

Cada `doc_type` tem uma faixa de palavras ([SPEC.md §7.2](SPEC.md)). Ficar fora
gera aviso, não erro. Abaixo da faixa costuma indicar conteúdo raso; acima,
conteúdo inflado ou que deveria ser dividido.

### Terminologia

Consulte a [política terminológica](docs/i18n-terminology.md), que é gerada de
`scripts/terminology.json` e aplicada pelo linter.

A regra que mais pega gente: **um documento nunca alterna** entre "acoplamento" e
"coupling". A forma em inglês é permitida uma vez, como glosa de primeira
ocorrência — *"acoplamento (coupling)"* — e depois só a forma em português.

### Diagramas

Mermaid, sempre. Regras em [SPEC.md §9](SPEC.md):

- Todo diagrama comunica algo que o texto não comunica bem. Decorativo é removido.
- Uma frase antes dele dizendo o que observar.
- Máximo de ~12 nós. Acima disso, decomponha.

### Afirmações técnicas

Garantias de protocolo, semântica de bancos, limites de serviços gerenciados e
resultados teóricos precisam ser conferidos contra fonte primária antes de
entrar. Diante de incerteza, declare a incerteza — não adivinhe.

Números em case studies são rotulados como ilustrativos. Números atribuídos a
sistemas reais precisam de fonte com autor e ano.

## Verificando antes de abrir o PR

```bash
npm test          # testes dos validadores
npm run validate  # os cinco validadores de conteúdo
npm run roadmap   # regenera as tabelas do ROADMAP
npm run build     # build nas duas locales
```

O CI roda os quatro. `npm run build` falha em link interno quebrado — isso é
proposital.

## Traduzindo

pt-BR é canônico e sempre avança primeiro. Traduzir nunca bloqueia conteúdo novo.

1. Copie o caminho exatamente:
   `docs/01-fundamentals/coupling.md` →
   `i18n/en-US/docusaurus-plugin-content-docs/current/01-fundamentals/coupling.md`
2. Traduza `title`, `description`, `objective` e o corpo. Mantenha `id`,
   `doc_type`, `level` e as listas de referência idênticos.
3. Troque `content_version: N` por `translated_from_version: N`, com o mesmo N do
   canônico no momento da tradução.
4. Traduza os rótulos dos diagramas Mermaid.

O estado da tradução é derivado, nunca declarado à mão. Se o canônico avançar
para a versão 4 e a tradução ficar em 3, o roadmap marca 🟨 automaticamente.

### Alterando um documento já traduzido

Se a mudança for **substantiva**, incremente `content_version`. Isso marca as
traduções como defasadas, que é o comportamento correto.

Se for correção de typo ou formatação, **não** incremente — evita marcar centenas
de traduções como defasadas por causa de uma vírgula.

O CI avisa quando um canônico muda sem incremento. É aviso, não erro: a decisão é
de quem escreve.

## Revisão

Toda contribuição com `status: complete` passa por revisão humana contra o
checklist de [SPEC.md §13.3](SPEC.md). Automação não detecta conteúdo raso.

As perguntas que mais reprovam:

- "Quando Não Usar" traz condições concretas ou é hedge genérico?
- Os erros comuns são erros que gente de verdade comete?
- Algo aqui já está definido em outro documento e deveria virar link?
- Alguma seção existe só para preencher o template?

## Escopo de contribuição

Bem-vindas: novos tópicos previstos no [Apêndice A da spec](SPEC.md), correções
factuais, melhoria de trade-offs existentes, traduções, exercícios e case studies.

Fora de escopo: tutoriais de tecnologia, projetos de exemplo executáveis,
conteúdo que só faz sentido para uma stack específica.

## Licença

Contribuições de conteúdo entram sob [CC BY-SA 4.0](LICENSE); contribuições de
código, sob [MIT](LICENSE-CODE).
