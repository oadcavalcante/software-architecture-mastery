# Spec — Decisões de Arquitetura

| | |
|---|---|
| Diretório | `docs/18-architecture-decisions/` |
| Nível | Nível 05 — Arquitetura |
| `doc_type` previsto | `concept · pattern · foundation` |
| Progresso | 14 / 14 (100%) |
| Índice de seção | 🟩 escrito |

## Escopo

Esta seção está completa quando os 14 tópicos abaixo existem com
`status: complete`, mais o `index.md` da seção.

| | Tópico |
|:-:|---|
| 🟩 | `what-is-an-adr` |
| 🟩 | `why-adrs-matter` |
| 🟩 | `adr-structure` |
| 🟩 | `adr-context` |
| 🟩 | `adr-decision` |
| 🟩 | `adr-alternatives` |
| 🟩 | `adr-consequences` |
| 🟩 | `adr-status` |
| 🟩 | `superseding-decisions` |
| 🟩 | `adr-001-modular-monolith` |
| 🟩 | `adr-002-async-processing` |
| 🟩 | `adr-003-postgresql` |
| 🟩 | `adr-004-kafka` |
| 🟩 | `adr-005-hexagonal` |

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
