---
id: backpressure
title: Backpressure
sidebar_position: 30
description: Sinalizar que não se dá conta, e por que o buffer só adia o colapso.
doc_type: concept
level: 4
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reconhece que enfileirar sem limite é ausência de
  backpressure, e escolhe o que fazer quando a capacidade acaba.
prerequisites: [messaging]
related: [rate-limiting, queues, retries]
canonical_for: [backpressure, descarte de carga]
content_version: 3
last_reviewed: 2026-08-27
---

# Backpressure

## Visão Geral

Backpressure é o mecanismo pelo qual um consumidor sobrecarregado sinaliza ao
produtor que reduza o ritmo.

A afirmação central: **enfileirar sem limite não é backpressure, é adiar o
colapso.** Uma fila que cresce indefinidamente troca uma falha imediata e visível
por uma falha tardia e catastrófica.

## Problema

Produtor e consumidor raramente têm a mesma capacidade. Quando o produtor é mais
rápido, o excedente precisa ir para algum lugar.

A resposta instintiva é um buffer. Ele absorve picos curtos, e não resolve
desequilíbrio sustentado: apenas move o problema no tempo.

E quando o buffer enche, três coisas podem acontecer:

**Bloquear o produtor.** Ele para de aceitar trabalho novo, o que propaga a
pressão para trás, até chegar a quem originou.

**Descartar.** Perde-se trabalho, e alguém precisa decidir qual.

**Crescer até a memória acabar.** O processo morre, e **todo** o buffer se perde,
não apenas o excedente.

A terceira é o que acontece por omissão, e é a pior das três.

## Conceitos Centrais

### Buffer ilimitado é o antipadrão

Uma fila em memória sem limite parece resiliente e é uma bomba-relógio.

Sob desequilíbrio sustentado, ela cresce até esgotar a memória. E quando o processo
morre, perde-se tudo, inclusive o trabalho que já tinha sido aceito e confirmado
ao produtor.

Frente ao ilimitado, um buffer limitado que rejeita quando enche troca a perda
total por uma perda proporcional ao excedente, imediata e visível. Qual resposta
dar quando ele enche (rejeitar, bloquear, descartar por idade ou por prioridade)
é a decisão da seção seguinte; ter limite é o que a torna possível.

### As respostas quando a capacidade acaba

**Bloquear.** O produtor espera. Adequado quando ele pode esperar: um
processamento em lote, um consumidor de fila. Inadequado quando há um usuário
aguardando.

**Descartar o mais novo.** Rejeita o que chega. Simples, e preserva trabalho antigo
que pode já estar obsoleto.

**Descartar o mais antigo.** Preserva o recente. Adequado para dados onde o valor
decai: telemetria, cotações, posição de veículo.

**Descartar por prioridade.** Rejeita o menos importante e preserva o crítico.
Exige classificar, e é o que permite um sistema saturado continuar atendendo o que
importa.

**Amostrar.** Processar uma fração. Adequado a métricas e análise.

A escolha depende de o que o dado significa, e essa é uma decisão de negócio.

### Backpressure precisa atravessar a cadeia

Se um consumidor sinaliza pressão e o produtor apenas enfileira internamente, o
problema apenas se moveu.

O sinal precisa propagar até a **origem** (tipicamente o usuário ou o sistema
externo), que é onde a carga pode de fato ser reduzida.

Numa cadeia, isso significa que cada elo precisa ter limite e reagir ao sinal do
próximo. Um elo com buffer ilimitado quebra a propagação e vira o ponto onde o
sistema acumula até morrer.

### Pull tem backpressure natural

Um consumidor que **busca** mensagens quando pode não recebe mais do que consegue
processar. O controle de ritmo é inerente ao modelo.

Um consumidor que **recebe** mensagens empurradas precisa de um mecanismo
explícito: janela de crédito, confirmação com limite de mensagens em voo, ou
sinalização de pressão.

É uma das razões pelas quais sistemas de streaming modernos adotam pull com espera
longa.

### Descartar não é falhar

Descartar carga deliberadamente é uma decisão de projeto, não um defeito.

Um sistema que descarta 5% das requisições sob pico e atende bem os outros 95% é
preferível a um que aceita tudo, degrada para todos, e eventualmente cai.

Isso precisa ser explícito: qual carga é descartável, e o que o cliente recebe
quando é.

### O que o mecanismo cobra de quem opera

Backpressure não é uma configuração única: cada fila passa a ter um limite para
calibrar, e o número certo depende da vazão do consumidor e do que o negócio aceita
perder. No painel aparecem duas séries novas (profundidade e contador de descarte),
e uma sem a outra engana: profundidade estável com descarte subindo é saturação, não
folga. E a rejeição vira contrato: o cliente precisa saber o que recebe quando é
recusado, e o que não pode ser descartado precisa de um caminho durável próprio. Esse
custo é permanente, e é ele que decide os casos em que o mecanismo não se paga.

## Modelo Mental

**A pergunta não é "como absorver mais". É "o que fazer quando não couber".** Todo
sistema tem um limite; a diferença é se ele foi projetado.

## Quando Usar

- Produtor e consumidor com capacidades diferentes.
- Carga variável com picos.
- Cadeias de processamento assíncrono.
- Consumo de fluxo contínuo: telemetria, eventos, streaming.

## Quando Não Usar

**Produção total limitada por construção.** Um lote de tamanho conhecido, uma lista
de trabalho fechada: se tudo o que pode entrar cabe na memória do processo, o limite
já existe. Ele só não está na fila. O que muda essa conclusão é a entrada passar a
ser contínua.

**Cadeia de um salto com o produtor já limitado na origem.** Um cron que roda uma
instância por vez, um pool fixo de conexões síncronas: a origem não consegue produzir
mais do que o consumidor aceita, e sinalizar pressão é sinalizar para ninguém.

**Excedente mais barato que o mecanismo.** Limite a calibrar por fila, contador a
acompanhar e contrato de rejeição com o cliente são custo permanente; onde o excedente
é raro e um retry do cliente o absorve, o mecanismo cobra mais do que evita.

**Backpressure como substituto de capacidade.** Se o sistema está permanentemente
saturado, o problema é dimensionamento.

## Alternativas

- **[Rate limiting](/05-system-design/rate-limiting.md)**: limitar na entrada em
  vez de reagir na saída. Preventivo, e exige conhecer a capacidade.
- **Escalar o consumidor**: quando o desequilíbrio é de capacidade, não de pico.
- **Degradar**: processar de forma mais barata sob pressão. Vence quando existe uma
  resposta mais barata que ainda serve (um resultado aproximado, sem enriquecimento);
  quando toda resposta parcial é inútil, descartar é mais honesto.

## Trade-offs

| Bloquear | Descartar |
|---|---|
| Nada se perde | Perde trabalho |
| Pressão propaga para trás | Contida localmente |
| Produtor precisa poder esperar | Não precisa |
| Risco de travar a cadeia inteira | Sistema continua fluindo |

| Buffer grande | Pequeno |
|---|---|
| Absorve picos maiores | Absorve menos |
| Latência maior sob carga | Menor |
| Mais memória e mais perda numa falha | Menos |
| Esconde desequilíbrio por mais tempo | Revela cedo |

A última linha é frequentemente uma vantagem do buffer pequeno: ele torna o
problema visível enquanto ainda é pequeno.

## Modos de Falha

**Memória esgotada.** Buffer ilimitado sob desequilíbrio sustentado.

**Perda total numa falha.** O buffer em memória morre com o processo.

**Cadeia travada.** Bloqueio propaga até a origem e trava tudo.

**Latência crescente.** A fila cresce e o tempo de espera com ela: o sistema
"funciona" e responde tarde demais para ter valor.

**Descarte do crítico.** Sem prioridade, perde-se o que importa.

**Pressão não propagada.** Um elo com buffer ilimitado absorve tudo e morre.

## Erros Comuns

**Fila em memória sem limite.** A estrutura padrão da linguagem não pede limite, e
aceitar o default é decidir que o excedente vai para a heap: o trabalho já confirmado
ao produtor passa a depender de o processo continuar vivo.

**Não monitorar a profundidade.** É a métrica que antecipa o problema.

**Bloquear numa cadeia com usuário na ponta.** Escolher bloquear porque "nada se perde"
empurra a espera para quem não pode esperar: o usuário desiste, repete, e a carga que
se queria conter aumenta.

**Não classificar o que pode ser descartado.** Sem perguntar ao negócio qual dado é
descartável, o descarte acaba decidido pela ordem de chegada, e o evento raro e crítico
sai junto com a telemetria repetida.

**Aumentar o buffer como correção.** Adia e agrava.

## Exemplo Real

Uma plataforma de rastreamento veicular recebia posições de 80 mil veículos, a
cada 30 segundos.

O serviço de ingestão colocava as posições numa fila em memória, e um processador
as gravava no banco. A fila não tinha limite.

Numa manutenção do banco que durou 30 minutos, o processador parou de gravar.

A fila cresceu. Em 9 minutos, a memória do processo esgotou e ele morreu, levando
junto **todas** as posições em memória, inclusive as que tinham sido aceitas antes
da manutenção.

Ao reiniciar, o serviço voltou a aceitar posições, a fila voltou a crescer (o
banco ainda estava em manutenção) e o processo morreu de novo, a cada nove minutos,
três vezes.

Perderam-se cerca de 4,3 milhões de posições: três buffers de nove minutos, a 160 mil
posições por minuto. Os três minutos finais de fila sobreviveram e foram gravados
quando o banco voltou.

As correções mudaram a estratégia, não o tamanho do buffer.

**Limite explícito** de 50 mil posições em memória.

**Descarte do mais antigo** ao atingir o limite. Para rastreamento, a posição mais
recente de um veículo é a que importa; uma de 8 minutos atrás tem pouco valor.

**Fila durável** para o que não pode ser descartado (os eventos de alarme, que são
raros e críticos). Eles passaram a ir para um canal separado, com persistência.

**Alerta de profundidade** acima de 60% do limite, que, com o processador parado e a
160 mil posições por minuto, dá menos de oito segundos até o descarte começar. Não é
aviso prévio: serve para datar o início do descarte, e é a série de profundidade ao
longo dos dias, junto ao contador, que antecipa o desequilíbrio.

Na manutenção seguinte, de 15 minutos, o comportamento foi: posições antigas
descartadas com contador registrado, alarmes preservados na fila durável, nenhum
processo morto, e recuperação automática ao fim da manutenção.

A decisão que tornou isso possível não foi técnica: foi perguntar ao negócio
**qual dado pode ser perdido**. E a resposta, que posição comum pode e alarme não
pode, permitiu tratar os dois de formas diferentes.

## Conceitos Relacionados

- [Filas](/05-system-design/queues.md): o buffer durável.
- [Rate Limiting](/05-system-design/rate-limiting.md): o controle na entrada.
- [Retries](/06-distributed-systems/retries.md): que agrava a pressão quando mal configurado.
- [Confiabilidade](/12-reliability/index.md): degradação e descarte de carga.

## Exercício Prático

Procure filas em memória no seu sistema: buffers, canais, listas de trabalho
pendente. Para cada uma, verifique se há limite.

Para as que não têm, calcule: quanto tempo de desequilíbrio o processo aguenta
antes de esgotar a memória?

## Perguntas de Entrevista

- Por que buffer ilimitado não é backpressure?
- Quais são as respostas possíveis quando a capacidade acaba?
- Por que pull tem backpressure natural e push não?

## Para Aprofundar

- Reactive Streams: a especificação de backpressure para fluxos assíncronos.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016. Descarte de
  carga e degradação graciosa.
