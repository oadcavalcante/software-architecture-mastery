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

### Afirmações absolutas (§8.1) — corrigidas

| Documento | Trecho |
|---|---|
| `09-cloud-architecture/multi-region.md` | "divergência passou a ser impossível" — configuração como código reduz divergência, não a elimina; o item seguinte do próprio texto existe para o que fica fora dela |
| `11-scalability/queue-based-scaling.md` | "\| Exige fila \| Funciona sempre \|" — o eixo é disponibilidade da métrica, e o próprio texto diz que CPU é substituto ruim |
| `11-scalability/queue-based-scaling.md` | "o melhor indicador de escalonamento", desmentido doze linhas depois pela idade da mensagem mais antiga |
| `14-devops-and-platform/blue-green.md` | "o desenho mais robusto e o mais usado em sistemas maduros" — superlativo sem eixo mais alegação de adoção sem fonte |
| `12-reliability/graceful-degradation.md` | "a técnica de **maior retorno em confiabilidade**", que sustentava a `description` e uma pergunta de entrevista; e a justificativa ("não exige infraestrutura nem coordenação") era desmentida pelo próprio Exemplo Real |
| `06-distributed-systems/distributed-cqrs.md` | "Nenhum índice relacional resolve isso" — contradiz `/05-system-design/search.md`, que trata pular direto para índice dedicado como o erro dominante da área |

Dois efeitos colaterais fechados junto: `12-reliability/index.md` repetia a
afirmação removida, e `canary.md` tinha a mesma célula absoluta do
`queue-based-scaling`.

## Decidido e aplicado

### Convenções de repositório

Apareciam em quase todo laudo. Decididas uma vez, registradas na spec, e o revisor
passou a tratá-las como dívida rastreada — sem isso, cada um dos 431 documentos
restantes repetiria o mesmo achado.

| Convenção | Decisão |
|---|---|
| "Modos de Falha" × "Erros Comuns" | Registrada em [SPEC.md](SPEC.md) §7.3 com teste explícito: Modos de Falha é **o que se observa antes de saber a causa**, da perspectiva de quem opera; Erros Comuns é a decisão de quem construiu que leva até lá, com a consequência. Se um item cabe nas duas, está na forma errada em uma |
| Números de case study | A declaração de que são ilustrativos (§8.2) entra **uma vez**, na admonição de abertura de cada um dos 14, em vez de pulverizada por número |
| Tabela de trade-off sem coluna de eixo | Registrada em [SPEC.md](SPEC.md) §7.3. **18 dos 20 `tradeoff` usam só tabelas de duas colunas** — é a forma do acervo, e o emparelhamento declara o eixo. O defeito não é a ausência da coluna: é a **linha** que emparelha dimensões diferentes ("Barata de ler \| Acomoda o previsto"), que é elogio de cada lado e não troca. O teste: se a linha some e nada se perde da comparação, ela não era trade-off |
| Faixa de densidade | Vale só para o canônico. Aplicá-la à tradução medía o idioma: a razão entre os 446 pares vai de 0,95 a 1,07, então canônico logo acima do piso dava tradução logo abaixo. A tradução passa a responder por outra pergunta — perdeu conteúdo? — contra o próprio canônico, fora da faixa 0,85–1,25 |

### Contradições entre documentos

As quatro foram fechadas. Duas exigiram decisão editorial; duas tinham resolução
óbvia, porque o canônico decide.

| Onde | Resolução |
|---|---|
| `rolling-deployments.md` × `kubernetes.md` | A distinção que faltava não é própria contra externa, é **própria da instância contra compartilhada pelas réplicas**. Readiness verifica se esta instância pode atender; apontada para recurso que todas consultam, uma oscilação tira todas da rotação e degradação parcial vira queda total |
| `distributed-cqrs.md` × `03-design-patterns/cqrs.md` | O canônico decide (§7.4): o distribuído adotou os três níveis, perdeu a escala própria, abriu com nota de pré-requisito e virou o recorte do nível 3. Réplica de leitura saiu de "grau" e ganhou a comparação que faltava. Dos 9 links que o chamavam de "CQRS", 5 mantiveram o alvo com rótulo honesto e 3 passaram ao canônico |
| `service-mesh.md` × `12-reliability/retry-storms.md` | Aritmética corrigida e link repontado para o canônico |
| `multi-region.md` × `disaster-recovery.md` | Custo de ativo-ativo alinhado em "muito alto"; "ativo-passivo quente" ganhou a ponte para a "espera quente" do canônico, que o frio já tinha |

### Achados que exigiam escrever conteúdo

| Documento | O que era | O que ficou |
|---|---|---|
| `idempotency.md` | "**Não há caso em que idempotência seja indesejável**" abria a seção obrigatória e a esvaziava | Condições reais, começando pela única em que a idempotência é **errada** e não apenas cara: quando a repetição *é* o dado — medição por chamada, trilha de auditoria, contador |
| `idempotency.md` | "Consumidores de fila, **sem exceção**", contradito doze linhas depois | Condicionado ao efeito observável fora do sistema ou irreversível |
| `idempotency.md` | Mesma transação apresentada como suficiente | Acrescentada a **restrição de unicidade** — duas retentativas simultâneas abrem transações que não enxergam a chave não confirmada uma da outra — e o que a segunda chamada recebe enquanto a primeira não terminou |
| `coupling.md` | "Não existe reduzir um sem aumentar o outro", desmentido pela tabela do próprio documento | O eixo vale onde há conhecimento compartilhado; acoplamento de marca e de controle saem de graça, e fila troca temporal por formato sem duplicar |
| `healthcare.md` | 1,2 h/ano apresentado como "o resultado do projeto" contra um requisito declarado de 99,99% (que permite 0,88 h/ano) | Reconhece os dezenove minutos, dá o custo de fechá-los e registra a revisão do alvo — que é o comportamento que o material cobra dos outros |
| `feature-flags.md` | "280 removidas, a maioria por remoção efetiva, não por renovação de prazo" — as duas leituras se excluem | 280 decisões: 231 remoções e 49 renovações com justificativa |

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
