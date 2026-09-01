# Revisão de profundidade — SPEC.md §13.3

Inventário dos laudos do subagente [`revisor-de-profundidade`](.claude/agents/revisor-de-profundidade.md).
Fecha a fase **F8** do [ROADMAP](ROADMAP.md).

Este arquivo é **escrito à mão**, não gerado. Cada linha sai de um laudo, e os
achados marcados como corrigidos foram verificados um a um contra o arquivo antes
da correção — o revisor erra, e um laudo aceito sem conferência é pior que
nenhum.

## Cobertura

| | Revisados | Reprovados | Com ressalvas | Aprovados |
|---|---:|---:|---:|---:|
| Amostra de calibração | 5 | 4 | 1 | 0 |
| `pattern` (10 de 63, os de maior risco) | 10 | 9 | 1 | 0 |
| **Total** | **15** | **13** | **2** | **0** |

Faltam 53 `pattern`, 20 `tradeoff`, 14 `case-study`, 275 `concept`, 31
`foundation`, 9 `exercise`, 5 `adr`, 4 `reference` e 25 `index`.

A amostra dos dez padrões **não é aleatória**: foi triada pela proporção de
condições de "Quando Não Usar" que são rótulo sem explicação. A taxa de reprovação
dela não se projeta sobre os 53 restantes.

## Corrigido

| Documento | Achado | Correção |
|---|---|---|
| `21-case-studies/healthcare.md` | Total ponderado da Opção C não seguia dos pesos da própria tabela (5,05 publicado como 5,3); análise de sensibilidade publicava 6,1 para C num cenário cujo teto matemático é 5,8 | Seis totais recalculados, método de redistribuição declarado |
| `20-trade-offs/sync-vs-async.md` | Bureau respondia por 84% da indisponibilidade, não 71% (1,6 pp de 1,9 pp) | Número corrigido |
| `20-trade-offs/sync-vs-async.md` | "o p99 de uma cadeia é dominado pelo pior elo" contradiz `/06-distributed-systems/latency.md`, canônico do tema | Reescrito; link para o canônico acrescentado |
| `08-integration-architecture/service-mesh.md` | Com 9 chamadas por salto, três saltos dão 9³ = 729, não 27 — o 27 é a conta sem a camada da malha, que é o tema do documento | Duas ocorrências e o exercício corrigidos; a instrução era linear onde a amplificação é exponencial |

## Pendente — decisão editorial

Verificados, não corrigidos: mudam o que o texto afirma, e a escolha é do autor.

### Afirmações absolutas (§8.1)

| Documento | Trecho |
|---|---|
| `06-distributed-systems/idempotency.md` | "**Não há caso em que idempotência seja indesejável.**" — em negrito, abrindo "Quando Não Usar"; e "Consumidores de fila, **sem exceção**", contradito doze linhas depois |
| `01-fundamentals/coupling.md` | "Não existe reduzir um sem aumentar o outro", contradito pela tabela do próprio documento |
| `09-cloud-architecture/multi-region.md` | "divergência passou a ser impossível" — configuração como código reduz divergência, não a elimina |
| `11-scalability/queue-based-scaling.md` | "\| Exige fila \| Funciona sempre \|", contradito pelo próprio texto sobre CPU como substituto ruim |
| `12-reliability/graceful-degradation.md` | "a técnica de **maior retorno em confiabilidade**" — sustenta a `description`, a Visão Geral e uma pergunta de entrevista que pede para justificar em vez de examinar |
| `14-devops-and-platform/blue-green.md` | "o desenho mais robusto e o mais usado em sistemas maduros" |
| `06-distributed-systems/distributed-cqrs.md` | "Nenhum índice relacional resolve isso" — contradiz `/05-system-design/search.md` |

### Contradições entre documentos

| Onde | O quê |
|---|---|
| `rolling-deployments.md` × `kubernetes.md` | Um trata prontidão consultando dependências como erro; o outro diz "readiness pode verificar dependências" — e o primeiro linka para o segundo |
| `distributed-cqrs.md` × `03-design-patterns/cqrs.md` | Duas escalas de CQRS em paralelo: quatro graus contra três níveis, com semântica cruzada. Seis documentos citam uma ou outra |
| `service-mesh.md` × `12-reliability/retry-storms.md` | A aritmética de amplificação foi reproduzida em vez de referenciada, e divergiu do canônico sem ninguém notar |
| `multi-region.md` × `disaster-recovery.md` | Duas taxonomias de failover sem mapeamento; e ativo-ativo classificado como custo "alto" aqui e "muito alto" lá |

### Lacunas técnicas

- `idempotency.md` — gravar chave e efeito na mesma transação não resolve chegada
  concorrente; falta a restrição de unicidade e o que a segunda chamada recebe.
- `21-case-studies/healthcare.md` — o resultado de 1,2 h/ano equivale a 99,9863%,
  abaixo dos 99,99% que o próprio case declara como requisito. Ou se reconhece que
  o alvo não foi atingido, ou o número muda.
- `feature-flags.md` — "280 flags removidas, a maioria por remoção efetiva, não por
  renovação de prazo": renovar prazo não remove flag; as duas leituras se excluem.

### Padrão recorrente

Em 11 dos 15 laudos, **"Modos de Falha" e "Erros Comuns" dizem a mesma coisa duas
vezes**, e ambas nomeiam a causa em vez do sintoma que o template pede de "Modos
de Falha". Não há sobreposição *literal* de rótulos em nenhum dos 355 documentos
que têm as duas seções — a duplicação é semântica, que é o que nenhum validador
pega. Vale decidir a convenção uma vez, no nível do repositório, em vez de
documento a documento.

Mesma natureza: nenhum dos 14 case studies rotula seus números como ilustrativos,
o que §8.2 pede. É convenção da seção, não defeito de um arquivo.

## Uma ponta que o validador novo não cobre

`check-canonical-links` verifica se um link chega ao canônico. Não verifica se o
canônico **define** o termo que reivindica.

Dois casos confirmados: `rolling-deployments.md` reivindica "orçamento de
indisponibilidade" e nunca escreve a expressão; `graceful-degradation.md`
reivindica "resposta de reserva", que `circuit-breakers.md` usa como estabelecido
e para cá aponta — mas a seção correspondente se chama outra coisa.

Uma varredura acha 362 dos 1.186 termos ausentes do corpo do próprio documento,
mas a maioria é alias deliberado (forma em inglês, sinônimo) e não defeito. Virar
validador exige separar alias de promessa não cumprida, o que não é mecânico.

## Método

```
Agent(subagent_type: "revisor-de-profundidade",
      prompt: "Revise docs/<caminho>.md")
```

Um documento por invocação. Antes de gastar agente em um lote, vale a triagem
mecânica que produziu esta amostra: proporção de condições de "Quando Não Usar"
sem explicação, contas que não fecham, termos canônicos ausentes do corpo.
