# Spec — Fundamentos

| | |
|---|---|
| Diretório | `docs/01-fundamentals/` |
| Nível | Nível 01 — Fundamentos |
| `doc_type` previsto | `concept · pattern · foundation` |
| Progresso | 23 / 23 (100%) |
| Índice de seção | 🟩 escrito |

## Escopo

Esta seção está completa quando os 23 tópicos abaixo existem com
`status: complete`, mais o `index.md` da seção.

| | Tópico |
|:-:|---|
| 🟩 | `what-is-software-architecture` |
| 🟩 | `architecture-vs-design` |
| 🟩 | `architecture-vs-implementation` |
| 🟩 | `business-context` |
| 🟩 | `problem-space` |
| 🟩 | `solution-space` |
| 🟩 | `functional-requirements` |
| 🟩 | `non-functional-requirements` |
| 🟩 | `quality-attributes` |
| 🟩 | `constraints` |
| 🟩 | `modularity` |
| 🟩 | `separation-of-concerns` |
| 🟩 | `coupling` |
| 🟩 | `cohesion` |
| 🟩 | `abstraction` |
| 🟩 | `dependency-management` |
| 🟩 | `complexity` |
| 🟩 | `technical-debt` |
| 🟩 | `architecture-characteristics` |
| 🟩 | `architecture-principles` |
| 🟩 | `architecture-as-decisions` |
| 🟩 | `architecture-evolution` |
| 🟩 | `01-recuar-ate-o-problema` |

## Critério de conclusão

Além dos documentos existirem:

- `npm run validate` sem erro **e sem aviso** para esta seção.
- Cada `concept`, `pattern` e `tradeoff` com **Quando Não Usar** e
  **Trade-offs** substantivas — condições concretas, não hedge.
- Cada `foundation` com **Por Que Isso Importa** e **Erros Comuns**.
- Nenhum conceito duplicado: se já é canônico em outra seção, referencie
  (`canonical_for` validado pelo CI).
- `prerequisites` apontando para ids existentes, sem ciclo.
- Exemplo real com restrições e números plausíveis em cada documento.

## Referências

- Padrão de conteúdo e templates: [SPEC.md](../SPEC.md) §7
- Como escrever e validar: [AGENTS.md](../AGENTS.md)
- Cobertura prevista: [SPEC.md](../SPEC.md) Apêndice A

<sub>Gerado por `npm run plan`. Não edite à mão — altere `scripts/curriculum.json`.</sub>
