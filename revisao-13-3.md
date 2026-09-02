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
| Amostra aleatória (semente declarada) | 10 | 10 | 0 | 0 |
| `tradeoff` de `20-trade-offs/` (15 de 20) | 15 | 15 | 0 | 0 |
| `tradeoff` fora do diretório (5) | 5 | 5 | 0 | 0 |
| `case-study` (14) | 14 | — | — | 0 |
| **Total** | **49** | | | **0** |

Os 20 `tradeoff` estão fechados. Faltam 53 `pattern`, 275 `concept`, 31
`foundation`, 9 `exercise`, 5 `adr`, 4 `reference` e 25 `index`.

**Cinco `tradeoff` não estavam em `docs/20-trade-offs/`** — o `doc_type` não segue
o diretório, e varrer por pasta os teria deixado de fora. Um deles,
`vendor-lock-in`, é canônico de um tema que esta onda mexeu. **Varra por
`doc_type`, nunca por diretório.**

Os vereditos por documento dos 14 `case-study` não foram tabulados na época; a
coluna fica vazia em vez de estimada.

**A taxa de reprovação não é artefato de triagem.** A amostra aleatória
(`sam-13.3-amostra-aleatoria-2026-09-01`) deu 10 em 10, contra 13 em 15 da
amostra triada por risco. Os defeitos estão distribuídos pelo acervo.

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

### Contas que não fecham — a família mais frequente

Nove dos vinte `tradeoff` publicavam um número que não deriva das próprias
parcelas. O padrão se repete: a conta é feita uma vez, o texto ao redor é
reescrito, e o número fica.

| Documento | O que não fechava |
|---|---|
| `video-streaming.md` | As quatro linhas de capacidade eram incompatíveis em 2,7×. Reancorado nos 3,4 EB, que sustentam a receita e o exercício |
| `performance-vs-maintainability.md` | O perfil somava 2 200 ms e era apresentado como o retrato de um p99 de 2,1 s; o p99 final de 740 ms não saía das parcelas (dão 780); e "as três semanas nos 80 ms" usava o valor **pós**-otimização como tamanho do alvo — o trecho media 380 ms antes, e é isso que fecha os 2 400 ms iniciais |
| `centralization-vs-decentralization.md` | "Divergência de 1 para 7" partia de uma contagem que a Fase 1 nunca deu e que o próprio texto desmente ("a centralização não impediu divergência, tornou-a invisível"). E "dois anos para convergir" contradizia o instantâneo declarado de 20 meses |
| `cloud-native-vs-portable.md` | "O custo de saída subiu de 9 para 11 meses" comparava o **hipotético** de ontem com o real de hoje: os 9 meses incluíam identidade e funções que a empresa não usava. A saída real de 2021 era de 7 semanas |
| `managed-vs-self-hosted.md` | Os resultados pós-migração ficavam **abaixo do piso aritmético**: os dois componentes mantidos já somavam 40 h/mês e 14 plantões, e o publicado era 34 e 13 |
| `speed-vs-quality.md` | As "~300 h" eram 78 semanas × 4 h/semana — taxa constante, contradita cinquenta linhas depois pela curva 4 → 9 → 20 h/semana do próprio documento. Pela curva são ~900 h |
| `sql-vs-nosql.md` | "Bancos em produção: 2" excluía o índice de busca que a mesma migração criou, e "consultas exploratórias direto no relacional" contradizia esse índice — construído justamente para a pergunta não prevista que motivou tudo |
| `healthcare.md` | Total ponderado e cenário de sensibilidade acima do teto matemático |
| `sync-vs-async.md` | 84% da indisponibilidade publicados como 71% |

O caso do `social-network.md` merece registro por ser o contrário: recalculei a
cadeia inteira — 38:1, 2,3:1, 3 900/s, 410 mil/s, 16 bilhões de publicações — e
ela fecha. O achado de que as arestas do grafo eram poucas **não se sustentou**:
o piso da cauda dá ~1,1 bilhão, e 2 bilhões passa. Achado descartado.

### A "regra de três" dizia duas coisas diferentes

`coupling-vs-duplication.md` é canônico e define: 2ª ocorrência duplique e
observe; com três, o eixo real fica visível. `simplicity-vs-flexibility.md`
intitulava a seção "A flexibilidade certa vem do **segundo** caso" e atribuía a
dois casos o que o canônico atribui a três — **citando o canônico como apoio**.
Alinhado ao canônico.

`abstraction-vs-complexity.md` tinha uma tensão menor e legítima: seu piso é o
segundo caso. Não é contradição, são operações diferentes — unificar duplicação
contra esconder implementação —, e agora o documento diz isso em vez de deixar
os dois pisos soltos no acervo.

### O mesmo caso contado como duas empresas

`vendor-lock-in.md` e `managed-vs-self-hosted.md` narravam a mesma história — empresa
de logística, os mesmos cinco componentes de infraestrutura autogeridos, a mesma
conclusão de migração seletiva — como se fossem duas empresas, uma com 25 e outra com
26 engenheiros. **Nenhum laudo pegou isso**, porque cada agente revisa um documento
só e a duplicação está entre dois.

Resolvido declarando que é o mesmo caso, com link nos dois sentidos e o eixo de cada
leitura: lá é quanto custa operar, aqui é o que a portabilidade comprou com esse custo.

A medição que isso motivou: os cenários de exemplo estão bem distribuídos — nenhum
setor passa de 5% dos 446 documentos ("empresa de serviços" e "empresa de logística"
empatam em 24 cada). Não é padrão sistêmico; era este par.

### Um achado que exigiu fonte primária

`authz-models.md` dizia que, no modelo de relação, responder "quem tem acesso a este
documento?" é caro "porque exige percorrer o grafo ao contrário". A direção estava
**trocada**: no artigo do Zanzibar, `Expand` responde exatamente essa pergunta e corre
a favor do índice, que é organizado por objeto. A cara é a inversa — "que documentos
esta pessoa vê" —, que nem está no artigo e exigiu um índice invertido próprio nos
sistemas derivados. Corrigido nos dois pontos que dependiam da afirmação.

Duas referências do mesmo documento também não passavam em §7.3: a do NIST sem ano, a
do Zanzibar atribuída a "Google." em vez dos autores. E `migration-strategies.md`
citava um relatório da Gartner cujo título não existe — a publicação real é Watson
(2011), com cinco opções, não sete.

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
