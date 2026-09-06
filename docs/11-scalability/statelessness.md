---
id: statelessness
title: Ausência de Estado
sidebar_position: 3
description: O pré-requisito da escala horizontal — e os lugares onde o estado se esconde.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor identifica estado escondido no processo e escolhe onde
  externalizá-lo.
prerequisites: [horizontal-scaling]
related: [horizontal-scaling, scaling-load-balancing, scaling-cache]
canonical_for: [ausência de estado, afinidade de sessão, estado externalizado]
content_version: 1
last_reviewed: 2026-08-28
---

# Ausência de Estado

## Visão Geral

Um componente sem estado não guarda nada entre requisições que seja necessário para
atender a próxima. Qualquer instância pode atender qualquer requisição, e perder uma
instância não perde nada.

Os fundamentos estão em
[stateless e stateful](/05-system-design/stateless-vs-stateful.md). Aqui interessa o
ângulo da escala: **é o pré-requisito da escala horizontal**, e o estado costuma estar
escondido em lugares que ninguém lista.

## Problema

A afirmação "nossa aplicação é sem estado" é feita com frequência e verificada com
raridade.

O teste é simples e implacável: **desligue uma instância no meio do tráfego e veja o
que quebra**. Se algum usuário perde carrinho, precisa refazer login, ou vê um erro
que não veria, há estado.

Os lugares onde ele se esconde são poucos e sempre os mesmos — e cada um limita a
escala de um jeito diferente.

## Conceitos Centrais

### Onde o estado se esconde

```text
sessão em memória          o clássico — carrinho, login, formulário em etapas
cache local autoritativo   quando o valor não existe em outro lugar
arquivo em disco           upload temporário, relatório gerado, log
conexão persistente        WebSocket, fluxo de eventos, conexão de longa duração
agendador em memória       tarefa marcada para daqui a uma hora
contador ou acumulador     estatística mantida no processo
trabalho em andamento      processamento longo iniciado numa requisição
```

Os três últimos são os menos lembrados. Um agendador em memória some com a instância —
e a tarefa nunca executa, sem erro nenhum.

### Afinidade de sessão é o remendo

Configurar o balanceador para enviar o mesmo usuário sempre para a mesma instância
resolve o sintoma e mantém o problema.

O que ela custa:

**Distribuição desigual.** O tráfego segue as sessões, não a carga. Instâncias novas
recebem pouco, porque não têm sessões estabelecidas.

**Perda na falha.** A instância cai e as sessões dela somem.

**Implantação com impacto.** Reiniciar uma instância derruba os usuários dela.

**Escalonamento ineficaz.** Adicionar capacidade não alivia as instâncias já carregadas.

Ela é aceitável como medida temporária, com prazo. Como solução permanente, ela é o
motivo de a escala horizontal não funcionar.

### Onde externalizar

```text
sessão               armazenamento chave-valor com expiração
arquivos             armazenamento de objetos
trabalho em andamento fila, com estado persistido
agendamento          agendador externo ou fila com atraso
cache                cache compartilhado, ou local não autoritativo
contadores           armazenamento com operação atômica
```

O ponto sobre cache local merece nota: cache local é **legítimo e desejável**, desde
que seja apenas cópia — o valor precisa existir na origem, e perder o cache pode
degradar o desempenho, nunca a correção. Ver
[cache para escala](/11-scalability/scaling-cache.md).

### Conexões persistentes são estado por natureza

Uma conexão de longa duração — WebSocket, fluxo de eventos, notificação em tempo real
— vive numa instância específica. Isso é estado, e não dá para externalizar a conexão.

O que se externaliza é o **roteamento**: um registro de qual instância detém qual
conexão, e um canal para entregar mensagens àquela instância.

Isso muda o desenho: a camada de conexão passa a ser separada da camada de lógica, e
cada uma escala de forma diferente. Tratá-las juntas limita as duas.

### Desligamento gracioso completa a propriedade

Sem estado não basta se a instância morre no meio de uma requisição.

O comportamento necessário: parar de aceitar novas requisições, sair do balanceamento,
terminar as em andamento, e só então encerrar.

Sem isso, todo evento de escalonamento — que deveria ser rotina — perde requisições.
Ver [computação em nuvem](/09-cloud-architecture/cloud-compute.md).

### O custo é real

Externalizar estado adiciona uma ida à rede em cada acesso.

```text
sessão em memória       ~0,001 ms
sessão em cache remoto  ~1 ms
```

Mil vezes mais lento em termos relativos, e irrelevante em termos absolutos para a
maioria das aplicações — uma requisição que leva 50 ms não muda por causa de 1 ms.

Onde importa: caminhos muito quentes, com múltiplos acessos por requisição. A saída é
cache local **não autoritativo** do que foi lido do armazenamento externo, com prazo
curto.

## Modelo Mental

**Sem estado significa que perder a instância não perde informação.** Se perder algo,
há estado — independentemente do que a documentação diz.

## Quando Usar

- Escala horizontal é necessária ou provável.
- Implantação sem interrupção é requisito.
- As instâncias são efêmeras — contêineres, capacidade interrompível.
- Tolerância a falha de instância importa.
- Elasticidade automática é usada.

## Quando Não Usar

**Componentes intrinsecamente com estado** — bancos, caches, sistemas de coordenação.
Eles têm suas próprias estratégias.

**Afinidade de sessão como solução permanente.**

**Externalizar cache local que é só cópia.** Isso é otimização legítima.

**Quando a latência adicional importa** no caminho crítico — ali a resposta é cache
local não autoritativo, não manter o estado.

**Aplicação única, numa máquina, sem plano de escalar.** O custo não se paga.

## Alternativas

- **Estado no cliente**, assinado — o servidor não guarda nada. Cuidado com tamanho e
  com o que é exposto. Ver [JWT](/10-security/jwt.md).
- **Cache local com invalidação** — desempenho sem autoridade.
- **Camada de conexão separada** — para conexões persistentes.
- **Estado em fila** — para trabalho em andamento.

## Trade-offs

| Sem estado | Com estado no processo |
|---|---|
| Qualquer instância atende | Afinidade necessária |
| Perder instância não perde nada | Perde |
| Escala horizontal funciona | Limitada |
| Latência de acesso externo | Memória local |
| Armazenamento adicional a operar | Nenhum |

| Estado no cliente | No servidor |
|---|---|
| Nada a armazenar | Armazenamento a operar |
| Tamanho limitado | Ilimitado |
| Visível ao cliente | Opaco |
| Revogação difícil | Imediata |

## Modos de Falha

**Sessão perdida na queda de instância.**

**Distribuição desigual por afinidade.**

**Tarefa agendada que nunca executa.** O agendador estava em memória.

**Arquivo temporário inacessível.** Outra instância atendeu a requisição seguinte.

**Cache local divergente.** Duas instâncias com valores diferentes, e nenhuma é a
origem.

**Requisições perdidas na implantação.** Sem desligamento gracioso.

**Contador zerado.** Estatística mantida no processo.

## Erros Comuns

**Afirmar que é sem estado sem testar.** O teste é direto: matar uma instância no meio do uso e ver se alguém perde algo. Quase sempre há um estado local que ninguém lembrava.

**Usar afinidade de sessão permanentemente.** Ela mascara o problema e o preserva: a instância continua insubstituível, a carga fica desequilibrada e a queda de uma réplica derruba as sessões presas a ela.

**Guardar upload em disco local.** O arquivo existe só naquela instância; a requisição seguinte cai em outra e não o encontra, e a implantação seguinte o apaga.

**Agendar em memória.** Some no reinício e executa uma vez por instância. Os dois efeitos aparecem quando o sistema cresce — exatamente quando ninguém está olhando para o agendador.

**Tratar cache local como autoritativo.** Instâncias divergem, e o usuário vê respostas diferentes a cada recarga sem que nada esteja errado no dado de origem.

**Não implementar desligamento gracioso.** Sem drenar conexões, toda redução de escala e toda implantação descartam requisições em andamento — que aparecem como erro intermitente sem causa aparente.

## Exemplo Real

Uma plataforma de ensino tinha uma aplicação declarada sem estado, rodando em oito
instâncias com escalonamento automático.

Um teste de resiliência — desligar uma instância durante tráfego real — revelou cinco
tipos de estado:

**Sessão em memória.** Usuários daquela instância foram desconectados. A afinidade de
sessão estava ativa no balanceador, e ninguém do time atual sabia por quê.

**Upload de vídeo em disco.** Envios em andamento eram gravados localmente antes de
irem para o armazenamento definitivo. Os arquivos parciais sumiram, e os professores
tiveram que reenviar.

**Conexão de aula ao vivo.** As conexões persistentes daquela instância caíram, e os
alunos foram desconectados no meio da aula.

**Agendamento em memória.** Lembretes de aula eram agendados com um temporizador no
processo. Os lembretes daquela instância nunca foram enviados — sem erro, sem alerta.
Descobriu-se que isso acontecia em toda implantação, havia dois anos.

**Contador de participantes.** Mantido em memória, por instância. O número exibido
dependia de qual instância atendia — e ninguém tinha notado porque a divergência era
pequena.

As correções:

**Sessão em cache compartilhado**, com expiração. A afinidade foi removida do
balanceador, e a distribuição de carga melhorou imediatamente — as instâncias novas
passaram a receber tráfego.

**Upload direto para o armazenamento de objetos**, com URL assinada. O disco local
deixou de ser usado.

**Camada de conexão separada** para as aulas ao vivo, com registro de qual nó detém
qual conexão e reconexão automática no cliente. A lógica de aula passou a escalar
independentemente das conexões.

**Agendamento em fila com atraso**, persistido. Esse foi o achado mais relevante: dois
anos de lembretes perdidos em cada implantação, sem que nenhum alerta existisse.

**Contador em armazenamento com operação atômica.**

**Desligamento gracioso**, com o nó saindo do balanceamento antes de encerrar.

O teste de desligar uma instância levou vinte minutos e
encontrou cinco problemas, dois deles em produção havia anos. Ele nunca tinha sido
feito porque "a aplicação é sem estado".

## Conceitos Relacionados

- [Escala Horizontal](/11-scalability/horizontal-scaling.md) — o que ela habilita.
- [Stateless e Stateful](/05-system-design/stateless-vs-stateful.md) — os
  fundamentos.
- [Balanceamento para Escala](/11-scalability/scaling-load-balancing.md) — a afinidade.
- [Cache para Escala](/11-scalability/scaling-cache.md).

## Exercício Prático

Desligue uma instância de produção no meio do tráfego, em janela controlada, e observe
o que quebra.

Se nada quebrar, sua aplicação é sem estado. Se algo quebrar, você encontrou o estado
que a documentação não menciona.

## Perguntas de Entrevista

- Qual o teste que verifica ausência de estado?
- Por que afinidade de sessão anula boa parte do ganho da escala horizontal?
- Por que cache local é legítimo e cache local autoritativo não é?

## Para Aprofundar

- Wiggins, Adam. *The Twelve-Factor App*, 2011 — processos e estado.
- Fielding, Roy. *Architectural Styles and the Design of Network-based Software
  Architectures*, 2000 — a restrição de ausência de estado.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
