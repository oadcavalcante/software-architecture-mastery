# Spec — Sistemas Distribuídos

| | |
|---|---|
| Diretório | `docs/06-distributed-systems/` |
| Nível | Nível 04 — Sistemas Distribuídos |
| `doc_type` previsto | `concept · pattern · foundation` |
| Progresso | 0 / 35 (0%) |
| Índice de seção | 🟩 escrito |

## Escopo

Esta seção está completa quando os 35 tópicos abaixo existem com
`status: complete`, mais o `index.md` da seção.

| | Tópico |
|:-:|---|
| ⬜ | `distributed-fundamentals` |
| ⬜ | `network-failure` |
| ⬜ | `partial-failure` |
| ⬜ | `latency` |
| ⬜ | `timeouts` |
| ⬜ | `retries` |
| ⬜ | `backoff` |
| ⬜ | `idempotency` |
| ⬜ | `consistency` |
| ⬜ | `availability` |
| ⬜ | `cap` |
| ⬜ | `pacelc` |
| ⬜ | `replication` |
| ⬜ | `partitioning` |
| ⬜ | `sharding` |
| ⬜ | `leader-election` |
| ⬜ | `consensus` |
| ⬜ | `distributed-locks` |
| ⬜ | `messaging` |
| ⬜ | `event-driven-systems` |
| ⬜ | `distributed-event-sourcing` |
| ⬜ | `distributed-cqrs` |
| ⬜ | `sagas` |
| ⬜ | `distributed-transactions` |
| ⬜ | `delivery-guarantees` |
| ⬜ | `ordering` |
| ⬜ | `duplicate-messages` |
| ⬜ | `poison-messages` |
| ⬜ | `dead-letter-queues` |
| ⬜ | `backpressure` |
| ⬜ | `eventual-consistency` |
| ⬜ | `strong-consistency` |
| ⬜ | `conflict-resolution` |
| ⬜ | `clock-and-time` |
| ⬜ | `failure-detection` |

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
