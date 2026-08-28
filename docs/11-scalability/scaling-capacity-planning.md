---
id: scaling-capacity-planning
title: Planejamento de Capacidade para Escala
sidebar_position: 12
description: Saber quando escalar antes do incidente — com modelo, teste e folga definida.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor constrói um modelo de capacidade com folga explícita e alerta
  de tendência, não só de valor.
prerequisites: [performance-vs-scalability]
related: [performance-vs-scalability, horizontal-scaling, hotspots]
canonical_for: [modelo de capacidade, folga operacional, teste de carga, alerta de tendência]
content_version: 1
last_reviewed: 2026-08-28
---

# Planejamento de Capacidade para Escala

## Visão Geral

Planejamento de capacidade responde: **quando vamos precisar de mais, e de quanto?**

Os fundamentos estão em
[capacity planning](../05-system-design/capacity-planning.md). Aqui interessa o ângulo
da escala: como saber que o limite está próximo **antes** de atingi-lo, e quanta folga
manter.

A diferença entre um time que escala com antecedência e um que escala durante o
incidente é uma planilha e um alerta.

## Problema

O padrão comum é reativo: o sistema fica lento, alguém investiga, adiciona capacidade.

Isso funciona quando adicionar capacidade é rápido e o gargalo é capacidade. Falha
quando a mudança leva semanas — particionar um banco, aumentar cota, negociar limite
com terceiro.

E falha silenciosamente antes disso: a degradação acontece gradualmente, e o momento em
que a folga acabou não gera nenhum evento.

## Conceitos Centrais

### O modelo relaciona negócio e recurso

Um modelo de capacidade traduz métrica de negócio em consumo de recurso:

```text
1.000 pedidos/hora consome
  → 12 req/s na API
  → 40 consultas/s no banco
  → 0,8 GB de armazenamento/dia
  → 25% de uma instância de aplicação
```

Com isso, a projeção de negócio vira projeção de infraestrutura, e a pergunta "quando
precisamos de mais?" tem resposta em data.

O modelo não precisa ser sofisticado. Uma planilha com essas razões, revisada
mensalmente contra a realidade, resolve. E ela é revisada porque as razões mudam:
funcionalidades novas alteram o consumo por pedido.

### A folga precisa ser decidida

Operar a 90% de utilização é eficiente e não deixa margem para variação, falha ou
crescimento.

```text
utilização alvo   o que ela permite
      50%         perder metade da capacidade e continuar
      60%         perder uma zona de três. Ver zonas de disponibilidade
      70%         absorver picos moderados
      85%         nada
```

A folga é decidida a partir de três coisas: quanto varia a carga, quanto tempo leva
para adicionar capacidade, e o que precisa ser absorvido — a perda de uma zona, um pico
sazonal.

Sem decisão explícita, a folga é o que sobrou depois que ninguém revisou o
dimensionamento.

### Alerta de tendência, não só de valor

Um alerta em 80% de utilização avisa quando já é tarde para mudanças que levam semanas.

O alerta útil é sobre **tendência**: "no ritmo atual, a capacidade acaba em N semanas".

```text
alerta de valor      utilização > 80%          → age quando já está apertado
alerta de tendência  projeção < 8 semanas      → age com tempo para agir
```

O segundo é o que permite planejar em vez de reagir. Ele é raro, e é barato de
implementar sobre métricas que já existem.

### Teste de carga precisa ser realista

Um teste que não reproduz a realidade produz confiança falsa. Os erros que invalidam:

**Distribuição uniforme.** Tráfego real é desigual — poucos clientes concentram
volume, algumas chaves são muito mais acessadas. Um teste uniforme não encontra
[pontos quentes](hotspots.md).

**Dados sintéticos pequenos.** Consultas rápidas em mil linhas e lentas em dez
milhões.

**Cache quente.** Testar com cache preenchido esconde a carga real na origem. Ver
[cache para escala](scaling-cache.md).

**Sem concorrência de escrita.** Testes de leitura não encontram contenção.

**Uma operação por vez.** O sistema real mistura operações que competem entre si.

O teste que vale é o que replica o padrão de acesso de produção, com volume de dados
comparável.

### Encontre o ponto de saturação

Mais útil que "aguenta 1.000 req/s" é conhecer a curva:

```text
carga    latência p95    vazão
 200        45 ms         200
 500        60 ms         500
 800       110 ms         800
1000       280 ms         990   ← joelho
1200       2.400 ms       850   ← saturado, vazão caindo
```

O joelho — onde a latência começa a subir desproporcionalmente — é o limite operacional
real. Acima dele, o sistema ainda funciona e a experiência já degradou.

E o ponto onde a vazão **cai** com mais carga é o que o descarte de carga precisa
impedir que seja atingido.

### Limites de terceiros entram no modelo

O gargalo pode não ser seu:

```text
limite de taxa de API externa
cota de recursos na região
limite de conexões de um serviço gerenciado
capacidade contratada de um parceiro
```

Esses limites costumam ter prazo de negociação em semanas, e são descobertos ao serem
atingidos. Inventariá-los e incluí-los no modelo é barato e evita a surpresa mais
constrangedora do planejamento. Ver
[regiões](../09-cloud-architecture/regions.md).

## Modelo Mental

**Capacidade se planeja com o tempo necessário para agir.** Se a mudança leva seis
semanas, o alerta precisa vir com oito.

## Quando Usar

- O crescimento é previsível.
- Mudanças de capacidade levam tempo.
- Há eventos sazonais conhecidos.
- Existem limites de terceiros.
- O custo de infraestrutura é material.
- A indisponibilidade tem custo alto.

## Quando Não Usar

**Modelo elaborado para sistema pequeno e estável.**

**Teste de carga irreal.** Produz confiança falsa, que é pior que nenhuma.

**Alerta só de valor absoluto.**

**Planejar sem revisar o modelo.** As razões mudam com o produto.

**Dimensionar pela média.** Ver
[computação em nuvem](../09-cloud-architecture/cloud-compute.md).

**Ignorar limites de terceiros.**

## Alternativas

- **Elasticidade automática** — para variação previsível, com as ressalvas de tempo de
  provisionamento.
- **Descarte de carga** — proteger o essencial quando a capacidade acaba. Ver
  [backpressure](../06-distributed-systems/backpressure.md).
- **Degradação graciosa** — operar com menos em vez de parar.
- **Escalonamento programado** — para picos conhecidos, melhor que qualquer reação.

## Trade-offs

| Folga alta | Folga baixa |
|---|---|
| Absorve pico e falha | Nenhuma margem |
| Custo maior | Menor |
| Menos urgência | Escalar durante incidente |

| Teste de carga realista | Simplificado |
|---|---|
| Encontra o que produção encontra | Confiança falsa |
| Caro de montar | Rápido |
| Exige dados comparáveis | Sintéticos |

## Modos de Falha

**Limite atingido sem aviso.**

**Teste passando e produção falhando.** Teste irreal.

**Folga consumida silenciosamente.** Uma funcionalidade nova aumentou o consumo por
pedido.

**Cota de terceiro atingida.** Semanas para resolver.

**Escalonamento durante o incidente.** Cache frio piora o momento.

**Modelo desatualizado.** As razões mudaram e ninguém revisou.

**Ponto de saturação ultrapassado.** A vazão cai com mais carga.

## Erros Comuns

**Não ter modelo.**

**Não decidir a folga.**

**Alertar só por valor.**

**Testar com dados sintéticos pequenos.**

**Testar com distribuição uniforme.**

**Não inventariar limites de terceiros.**

## Exemplo Real

Uma plataforma de bilheteria conhecia seus picos: aberturas de venda de grandes eventos,
agendadas com semanas de antecedência.

Mesmo assim, três das últimas cinco aberturas tinham tido degradação.

O trabalho de planejamento foi estruturado assim:

**Modelo de capacidade.** Uma planilha relacionando ingressos por minuto com consumo de
cada componente. Construída a partir de medições das aberturas anteriores.

Ela revelou algo que ninguém sabia: o consumo de banco por ingresso tinha **crescido
40%** em oito meses, por causa de duas funcionalidades novas. O dimensionamento
continuava baseado na razão antiga.

**Teste de carga realista.** Reprodução do padrão de abertura — 200 mil pessoas
tentando comprar nos primeiros 3 minutos, com a distribuição real de eventos e setores.

O teste anterior usava distribuição uniforme entre eventos, e por isso nunca havia
encontrado o ponto quente: um evento concentra praticamente todo o tráfego numa
abertura.

**Curva de saturação.** Medida, não estimada. O joelho estava em 4.200 ingressos por
minuto; a vazão começava a cair em 5.100. O alvo operacional foi definido em 3.000, com
descarte de carga acima de 4.000.

**Limites de terceiros inventariados.** O gateway de pagamento tinha limite contratado
de 800 transações por segundo. O pico projetado pedia 1.100. A renegociação levou cinco
semanas — e teria sido descoberta durante a abertura se o inventário não existisse.

**Alerta de tendência.** Projeção semanal de quando cada componente atinge 70%, com
alerta em oito semanas de antecedência.

**Escalonamento programado** para as aberturas, com capacidade provisionada 20 minutos
antes.

As três aberturas seguintes ocorreram sem degradação.

A lição registrada: o achado mais importante foi o crescimento do consumo por
ingresso. Ele tinha acontecido gradualmente, ao longo de oito meses, sem que nenhum
alerta disparasse — porque nenhuma métrica olhava a razão entre negócio e recurso.

## Conceitos Relacionados

- [Desempenho versus Escalabilidade](performance-vs-scalability.md).
- [Pontos Quentes](hotspots.md) — o que teste uniforme não encontra.
- [Capacity Planning](../05-system-design/capacity-planning.md) — os fundamentos.
- [Backpressure](../06-distributed-systems/backpressure.md) — o descarte.

## Exercício Prático

Escreva a razão entre uma métrica de negócio e um recurso do seu sistema — pedidos por
consulta ao banco, usuários por instância.

Compare com a mesma razão de seis meses atrás. Se ela cresceu, sua folga está sendo
consumida sem que ninguém tenha adicionado carga.

## Perguntas de Entrevista

- Por que alerta de tendência é mais útil que alerta de valor?
- Que erros tornam um teste de carga inútil?
- O que o joelho da curva de saturação representa?

## Para Aprofundar

- Gunther, Neil. *Guerrilla Capacity Planning*. Springer, 2007.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016 — capítulo 18.
- Gregg, Brendan. *Systems Performance*. 2ª ed. Addison-Wesley, 2020.
