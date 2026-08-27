# Spec — Observabilidade

| | |
|---|---|
| Diretório | `docs/13-observability/` |
| Nível | Nível 05 — Arquitetura |
| `doc_type` previsto | `concept · pattern · foundation` |
| Progresso | 11 / 11 (100%) |
| Índice de seção | 🟩 escrito |

## Escopo

Esta seção está completa quando os 11 tópicos abaixo existem com
`status: complete`, mais o `index.md` da seção.

| | Tópico |
|:-:|---|
| 🟩 | `logs` |
| 🟩 | `metrics` |
| 🟩 | `traces` |
| 🟩 | `distributed-tracing` |
| 🟩 | `correlation-ids` |
| 🟩 | `telemetry` |
| 🟩 | `alerting` |
| 🟩 | `dashboards` |
| 🟩 | `sre-concepts` |
| 🟩 | `golden-signals` |
| 🟩 | `debuggability` |

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
