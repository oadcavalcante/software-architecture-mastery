---
id: serverless
title: Serverless
sidebar_position: 6
description: Não gerenciar capacidade — o que se ganha, e os quatro custos que a apresentação inicial omite.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor identifica as cargas em que serverless se paga e reconhece
  as restrições que ele impõe ao desenho.
prerequisites: [managed-services]
related: [managed-services, containers, cost-architecture]
canonical_for: [serverless, função como serviço, partida a frio, escala a zero]
content_version: 1
last_reviewed: 2026-08-27
---

# Serverless

## Visão Geral

Serverless é o modelo em que você não provisiona nem gerencia capacidade: escreve o
código, o provedor executa quando há demanda, e cobra pelo que rodou.

O nome é enganoso — há servidores, você é que não os vê. O que caracteriza o modelo
é **escala a zero** e **cobrança por uso**.

Ele resolve bem uma classe específica de problema. E impõe restrições de desenho
que a apresentação inicial não menciona, e que são a causa da maior parte dos
arrependimentos.

## Problema

Uma aplicação com carga irregular — picos ocasionais, longos períodos ociosos —
desperdiça no modelo tradicional: a capacidade fica ligada esperando.

Dimensionar para o pico paga ociosidade; dimensionar para a média falha no pico. E
escalonamento automático leva minutos, que é mais tempo do que muitos picos duram.

Serverless remove a decisão: não há capacidade a dimensionar.

## Conceitos Centrais

### Escala a zero é o que define

Sem requisições, nada roda e nada é cobrado. Com mil requisições simultâneas, mil
execuções acontecem.

Isso é qualitativamente diferente de escalonamento automático, que ajusta um número
de instâncias com atraso de minutos. Aqui a resposta é imediata e a granularidade é
a requisição.

O efeito econômico é grande em cargas esporádicas: um processo que roda uma vez por
hora por 200 milissegundos custa quase nada.

### Os quatro custos

**Partida a frio.** Quando não há instância pronta, a primeira requisição paga a
inicialização — de dezenas de milissegundos a vários segundos, conforme linguagem e
tamanho do pacote. Em carga esporádica, uma fração relevante das requisições paga
isso.

**Ausência de estado.** Cada execução pode ser numa instância diferente. Não há
memória entre requisições, nem conexão persistente confiável, nem cache local
garantido. Ver
[stateless](/05-system-design/stateless-vs-stateful.md).

**Limites rígidos.** Tempo máximo de execução, memória máxima, tamanho de pacote,
tamanho de payload. Uma operação que ultrapassa qualquer um simplesmente não roda.

**Conexões de banco.** Cada execução concorrente pode abrir uma conexão. Mil
execuções simultâneas contra um banco relacional esgotam o limite de conexões — e
esse é o modo de falha mais comum de serverless com banco tradicional. A solução é
um intermediário de conexões, que é infraestrutura de volta.

Os quatro são estruturais, não defeitos a corrigir.

### O ponto de inversão econômica

Serverless é barato em carga baixa e irregular, e caro em carga alta e constante.

```text
carga esporádica    serverless custa uma fração
carga constante     serverless custa várias vezes mais
```

A razão: você paga um prêmio por não gerenciar capacidade. Com utilização alta e
previsível, uma instância reservada é muito mais barata por unidade de trabalho.

Existe um ponto de inversão, e ele deveria ser calculado antes da adoção. Sistemas
que crescem de esporádicos para constantes atravessam esse ponto sem perceber. Ver
[arquitetura de custo](/09-cloud-architecture/cost-architecture.md).

### O que ele faz bem

**Processamento orientado a evento.** Reagir a um arquivo enviado, uma mensagem, um
webhook.

**Tarefas agendadas.** Substituem uma máquina ligada para rodar algo por minuto.

**Cola entre serviços.** Transformações pequenas entre componentes gerenciados.

**Cargas genuinamente esporádicas.** Formulários internos, ferramentas de operação.

**Picos imprevisíveis e curtos.**

### O que ele faz mal

**Requisições de latência muito baixa e constante.** A partida a frio impede
garantir percentis altos.

**Processos longos.** O limite de execução corta.

**Conexões persistentes.** Fluxos, conexões de longa duração.

**Alto volume constante.** Custo.

**Cargas com uso intensivo de memória ou de CPU** que ultrapassam os limites.

### Serverless não é só função

O termo cresceu: bancos, filas e armazenamentos "sem servidor" seguem a mesma
lógica de cobrança por uso e ausência de capacidade a gerenciar.

Frequentemente essas peças rendem mais que as funções — um banco que escala a zero
num ambiente de teste economiza mais que migrar código.

### Ele acopla fortemente

O modelo de execução, os gatilhos, o formato de evento e as permissões são
específicos do provedor. Sair é reescrever a camada de integração.

Isso é aceitável e precisa ser escolhido. Ver
[dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md).

## Modelo Mental

**Serverless troca controle e previsibilidade de latência por não gerenciar
capacidade.** Vale quando a capacidade é o problema; não vale quando a latência é.

## Quando Usar

- Carga esporádica ou muito variável.
- Processamento orientado a evento.
- Tarefas agendadas.
- Picos curtos e imprevisíveis.
- Protótipos e ferramentas internas.
- Ambientes de desenvolvimento que podem escalar a zero.

## Quando Não Usar

**Latência baixa e previsível como requisito.**

**Carga alta e constante.** Custo.

**Processos longos.**

**Conexões persistentes ou fluxos.**

**Contra banco relacional sem intermediário de conexões.**

**Quando o desenho exige estado local.**

**Como padrão arquitetural.** É uma ferramenta para um perfil de carga.

## Alternativas

- **[Contêineres](/09-cloud-architecture/containers.md) com escalonamento automático** — sem partida a
  frio, sem limite de execução, com capacidade a gerenciar.
- **Contêineres que escalam a zero** — plataformas que combinam os dois modelos;
  frequentemente o meio-termo certo.
- **Instância pequena sempre ligada** — para carga baixa mas constante, costuma
  ser mais barata e mais previsível.
- **Fila com trabalhadores** — para processamento assíncrono de longa duração.

## Trade-offs

| Serverless | Contêiner |
|---|---|
| Sem capacidade a gerenciar | A dimensionar |
| Escala a zero | Mínimo ligado |
| Partida a frio | Sem |
| Limite de execução | Sem limite prático |
| Caro em carga constante | Barato |
| Acoplamento ao provedor | Portável |
| Sem estado local | Estado possível |

## Modos de Falha

**Partida a frio no percentil alto.** A média é boa e a cauda é péssima.

**Conexões de banco esgotadas.**

**Limite de execução cortando o processamento** — frequentemente com dados
parcialmente processados.

**Custo explodindo com o crescimento.**

**Concorrência limitada.** A cota do provedor barra o pico.

**Laço de invocação.** Uma função que grava onde ela mesma escuta. A conta cresce
até alguém perceber.

**Depuração difícil.** Sem processo persistente para inspecionar.

## Erros Comuns

**Adotar como padrão do sistema.** Ele brilha em carga intermitente e picos imprevisíveis. Em serviço de tráfego constante, custa mais que uma instância reservada e adiciona limites que a instância não tem.

**Não calcular o ponto de inversão de custo.** Existe um volume acima do qual pagar por invocação sai mais caro que manter capacidade ligada. Esse número é calculável em uma tarde, e raramente é calculado.

**Conectar direto ao banco relacional.** Cada invocação concorrente tenta a própria conexão, e mil invocações esgotam o limite do banco. É preciso um agrupador de conexões entre os dois.

**Ignorar a partida a frio nos requisitos de latência.** A primeira invocação após ociosidade paga a inicialização inteira. Em percentis altos isso aparece como cauda longa, e o requisito de p99 é onde ela dói.

**Não definir teto de concorrência nem alerta de custo.** A escala é praticamente ilimitada, o que significa que um laço acidental escala junto — e o limite passa a ser o cartão de crédito.

**Assumir estado entre invocações.** O ambiente às vezes é reaproveitado, o que faz variável global parecer funcionar em teste. Em produção, sob concorrência, ela vaza dado de uma requisição para outra.

## Exemplo Real

Uma empresa de mídia adotou serverless para o processamento de imagens enviadas
pelos usuários: redimensionar, gerar miniaturas, extrair metadados.

Caso ideal — orientado a evento, esporádico, curto. O custo caiu para cerca de um
oitavo do que era com máquinas dedicadas ociosas a maior parte do tempo.

O sucesso motivou migrar também a API principal. Aí os quatro custos apareceram
todos:

**Partida a frio.** A API tinha requisito de 200 ms no percentil 95. Com partidas a
frio de 1,2 a 2,8 segundos afetando entre 3% e 8% das requisições em horários de
baixa, o percentil estourava. Capacidade provisionada resolveu — e ela custa por
tempo ligado, ou seja, elimina a economia que motivou a migração.

**Conexões de banco.** Num pico de 2.000 execuções concorrentes, o banco atingiu o
limite de conexões e passou a recusar. Um intermediário de conexões foi
adicionado — mais um componente a operar.

**Custo invertido.** A API tinha carga alta e razoavelmente constante. O custo
mensal ficou 3,4 vezes maior que o das instâncias anteriores.

**Depuração.** Investigar um defeito intermitente ficou substancialmente mais
difícil sem processo persistente para inspecionar.

Depois de sete meses, a API voltou para contêineres com escalonamento automático.
O processamento de imagens permanece serverless até hoje, e continua sendo a
escolha certa para aquela carga.

O que a equipe aprendeu: o erro não foi adotar serverless — foi generalizar a
partir de um caso em que ele era perfeito. As duas cargas têm perfis opostos, e a
diferença estava visível nos dados de tráfego antes da migração. Ninguém olhou.

## Conceitos Relacionados

- [Serviços Gerenciados](/09-cloud-architecture/managed-services.md) — o grau anterior.
- [Contêineres](/09-cloud-architecture/containers.md) — a alternativa.
- [Arquitetura de Custo](/09-cloud-architecture/cost-architecture.md) — o ponto de inversão.
- [Dependência de Fornecedor](/09-cloud-architecture/vendor-lock-in.md).

## Exercício Prático

Pegue uma carga que você considera candidata a serverless e trace o tráfego por
hora ao longo de uma semana.

Se o gráfico for razoavelmente plano, serverless vai custar mais. Se tiver longos
vales e picos curtos, ele é candidato.

## Perguntas de Entrevista

- Quais são os quatro custos estruturais do modelo?
- Por que ele fica caro em carga constante?
- Por que serverless com banco relacional exige intermediário de conexões?

## Para Aprofundar

- Roberts, Mike. *Serverless Architectures*. martinfowler.com, 2018.
- Sbarski, Peter. *Serverless Architectures on AWS*. 2ª ed. Manning, 2022.
- Jonas, Eric et al. *Cloud Programming Simplified: A Berkeley View on Serverless
  Computing*, 2019.
