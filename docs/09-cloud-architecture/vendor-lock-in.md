---
id: vendor-lock-in
title: Dependência de Fornecedor
sidebar_position: 18
description: O custo de sair — e por que os dois extremos, adotar tudo e abstrair tudo, são igualmente ruins.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia dependência pelo custo de saída contra o valor de
  entrar, em vez de por princípio.
prerequisites: [managed-services]
related: [managed-services, serverless, cloud-native]
canonical_for: [dependência de fornecedor, custo de saída, portabilidade]
content_version: 3
last_reviewed: 2026-08-27
---

# Dependência de Fornecedor

## Visão Geral

Dependência de fornecedor é o custo de trocar de provedor, medido em tempo,
dinheiro e risco.

Ela é frequentemente discutida como algo binário — "estamos presos" ou "somos
portáteis" — e não é. É um espectro, e cada serviço adotado move você nele.

O erro não está em depender. Está em depender **sem saber quanto custa sair**, ou em
pagar antecipadamente por uma portabilidade que nunca será usada.

## Problema

As duas posições extremas são comuns, e ambas custam caro.

**"Usar tudo do provedor."** Máxima produtividade, e uma migração hipotética vira
reescrita. Pior: perde-se poder de negociação, e mudanças de preço ou de política do
fornecedor viram fato consumado.

**"Abstrair tudo para ser portável."** Camadas de abstração sobre cada serviço, uso
apenas do denominador comum entre provedores, recusa a serviços gerenciados.

O custo da segunda é imediato e permanente: menos produtividade, mais código
próprio, mais operação. O benefício é uma opção que, na esmagadora maioria dos
casos, nunca é exercida.

Migrações de provedor acontecem, e são raras. Pagar todo mês por uma opção que
provavelmente não será usada é uma escolha que deveria ser explícita.

## Conceitos Centrais

### Os graus de dependência

```text
baixa      máquina virtual, contêiner, armazenamento de objetos
           interfaces parecidas entre provedores; migrar é trabalho, não reescrita
média      banco gerenciado com motor de código aberto, fila, cache
           o motor é portável; a operação e a integração, não
alta       funções sem servidor, banco proprietário, orquestração de fluxo,
           serviços de aprendizado de máquina
           não há equivalente direto; migrar é redesenhar
```

A escala é útil porque permite decidir por componente em vez de globalmente.

### O custo de saída não é uniforme

O que de fato prende, em ordem de dificuldade:

**Dados.** Volume grande em armazenamento proprietário, com custo de transferência
de saída. Mover petabytes tem preço e tempo.

**Modelo de identidade e permissões.** Cada provedor tem o seu, e ele permeia tudo.

**Serviços sem equivalente.** Não é portar, é reimplementar.

**Conhecimento operacional.** O time sabe operar um provedor. Aprender outro é
tempo.

**Integrações periféricas.** Monitoramento, esteiras, alertas, scripts. É a
categoria mais subestimada, porque cada item é pequeno e há centenas.

### O critério: valor de entrar contra custo de sair

```text
alto valor + baixo custo de saída   → adote sem hesitar
alto valor + alto custo de saída    → adote conscientemente, com o custo registrado
baixo valor + baixo custo de saída  → indiferente
baixo valor + alto custo de saída   → evite
```

O segundo quadrante é onde está a maior parte das decisões interessantes, e onde a
resposta costuma ser **sim** — desde que a decisão seja registrada, com estimativa
do custo de saída.

Um banco gerenciado que economiza uma pessoa por ano vale a dependência, mesmo que
migrar depois custe três meses.

### Portabilidade seletiva é a resposta prática

Em vez de abstrair tudo ou nada, isolar o que é caro de trocar:

**Dados no seu formato**, não num proprietário, quando possível.

**Lógica de negócio sem dependência de bibliotecas do provedor.** O núcleo do
domínio não deveria importar nada específico.

**Adaptador nas fronteiras** dos serviços de alto acoplamento — ver
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

Isso custa pouco e preserva a maior parte da opção. Abstrair também a infraestrutura
custa muito e preserva o resto.

### Multi-nuvem raramente é a resposta

Rodar em dois provedores simultaneamente é apresentado como solução e cobra caro:

**Denominador comum.** Só se usa o que existe nos dois, o que descarta a maior parte
do valor.

**Operação dobrada.** Dois modelos de identidade, duas ferramentas, dois conjuntos
de conhecimento.

**Transferência entre nuvens.** Cara e lenta.

**Complexidade de dados.** Consistência entre provedores é o problema difícil de
[sistemas distribuídos](/06-distributed-systems/index.md), agravado.

Ela se justifica em poucos casos: exigência regulatória explícita, aquisição que
juntou dois ambientes, ou dependência de um serviço específico de cada um.

"Para não depender de um fornecedor" não costuma sobreviver à análise de custo.

### Dependência de código aberto também existe

Escolher um banco de código aberto autogerido reduz a dependência do provedor de
nuvem e cria outra: do próprio software, das suas versões, e do conhecimento
necessário para operá-lo.

Não existe ausência de dependência. Existe escolher qual.

## Modelo Mental

**Toda decisão de arquitetura cria alguma dependência.** A pergunta é se o valor de
entrar supera o custo estimado de sair — e se alguém estimou.

## Quando Usar

Aceitar dependência alta faz sentido quando:

- O serviço entrega valor que a alternativa não entrega.
- O custo de saída foi estimado e é aceitável.
- A velocidade de entrega importa mais que a opção de trocar.
- O time é pequeno e o trabalho operacional pesa.
- Não há requisito concreto de portabilidade.

## Quando Não Usar

**Sem estimar o custo de saída.**

**Quando há exigência regulatória de portabilidade.**

**Quando o fornecedor tem risco de continuidade.**

**Multi-nuvem por princípio** — este e o item seguinte invertem o sinal: não são condições em
que aceitar dependência é errado, são as formas de recusá-la que custam sem entregar.

**Abstrair tudo por precaução.** Paga permanentemente por uma opção improvável.

**Quando o poder de negociação importa.** Dependência total elimina alternativa em
renovação de contrato.

## Alternativas

- **Portabilidade seletiva** — isolar o que é caro, aceitar o resto.
- **Serviços de código aberto gerenciados** — o motor é portável; a operação, não.
- **[Contêineres](/09-cloud-architecture/containers.md)** — reduzem a dependência da camada de computação
  a custo baixo.
- **Estratégia de saída documentada** — em vez de portabilidade técnica, um plano:
  o que seria preciso, quanto tempo, quanto custa. Barato e frequentemente
  suficiente.

A última merece destaque: um documento de duas páginas que responde "como sairíamos
daqui?" entrega a maior parte do valor de gestão de risco, sem nenhum custo
arquitetural.

## Trade-offs

| Adotar serviços do provedor | Manter portabilidade |
|---|---|
| Entrega mais rápida | Mais lenta |
| Menos operação | Mais |
| Custo de saída alto | Baixo |
| Sem poder de negociação | Com |
| Usa o melhor disponível | Denominador comum |
| Menos código próprio | Mais |

## Modos de Falha

**Custo de saída descoberto tarde.** Ninguém estimou, e a estimativa aparece quando
já não há escolha.

**Mudança de preço sem alternativa.**

**Serviço descontinuado.** Migração com prazo do fornecedor.

**Abstração que não abstrai.** A camada existe, e as particularidades vazaram.

**Multi-nuvem entregando o pior dos dois.**

**Transferência de saída inviabilizando a migração.** Os dados existem e mover
custa demais.

## Erros Comuns

**Não estimar o custo de saída.**

**Abstrair por princípio.**

**Adotar multi-nuvem sem requisito.**

**Ignorar as integrações periféricas** na estimativa.

**Assumir que código aberto elimina dependência.**

**Não revisar a decisão** quando o volume ou o contrato mudam.

## Exemplo Real

É a mesma empresa de
[gerenciado contra autogerido](/20-trade-offs/managed-vs-self-hosted.md) — 26 engenheiros,
cinco componentes de infraestrutura operados internamente —, vista por outro eixo. Lá a
pergunta é quanto custa operar; aqui é o que a política de portabilidade comprou com esse
custo.

A empresa estabeleceu, na fundação, a regra de não usar nenhum serviço proprietário de nuvem.
Tudo em contêineres, tudo com software de código aberto autogerido, tudo portável.

Quatro anos depois, o balanço:

**Cerca de 1,1 engenheiro em tempo integral** — o resultado da medição de três meses
registrada no documento irmão — operando banco, fila, busca, cache e Kubernetes
autogeridos, para uma equipe de 26.

**A portabilidade nunca foi exercida.** Nenhuma migração foi cogitada em quatro
anos.

**Na fatura, a política se pagou.** O autogerido custou menos que os serviços
gerenciados equivalentes:

```text
custo total autogerido                     ~R$ 90 mil/mês
gerenciados equivalentes                   ~R$ 118 mil/mês
diferença a favor do autogerido            ~R$ 28 mil/mês, por quatro anos
```

E é justamente por isso que a política sobreviveu quatro anos sem revisão: o custo
que ela impôs não aparecia na conta que a empresa olhava. A conta acima não inclui o
valor dos recursos de produto adiados — que a equipe considerou maior que a diferença,
e não conseguiu estimar.

**Atraso de entrega.** Vários recursos de produto foram adiados por indisponibilidade
de gente, alocada em operação.

A revisão levou a uma política diferente, classificada pelo critério de valor contra custo de
saída — não pelo grau de dependência, que descreve o componente e não a decisão:

**Adotado sem hesitar:** cache gerenciado, com protocolo compatível e custo de saída de dias.
Alto valor, custo de saída baixo.

**Adotado com registro:** banco gerenciado e fila gerenciada, ambos com motor de código aberto
— o que reduz a reescrita, mas não os três meses de migração de dados e de reconfiguração que
a estimativa apontou. Alto valor e alto custo de saída caem no segundo quadrante, e o segundo
quadrante exige registro. Junto com eles, um serviço proprietário de processamento de eventos,
com estimativa de quatro meses. Dois dos três engenheiros voltaram ao produto.

**Mantido portável:** o núcleo de domínio, sem nenhuma dependência de biblioteca do
provedor, e os dados em formatos abertos. Também a busca e o agrupamento de contêineres, que
seguiram autogeridos — a busca por uma extensão de idioma sem equivalente gerenciado, os
contêineres porque a dependência já era baixa e migrar não economizaria operação. É por isso
que o saldo é de dois engenheiros, e não de três.

**Recusado:** multi-nuvem, e um serviço proprietário de fluxo de trabalho cujo valor
não justificava o acoplamento.

**Criado:** um documento de estratégia de saída, revisado anualmente, com o custo
estimado de migração por componente.

O que a equipe aprendeu: a política original vinha de uma experiência ruim que um
dos fundadores tivera com um fornecedor, anos antes. Ela nunca foi analisada em
custo — era um princípio, e princípios não são comparados com números.

A conta de quatro anos de portabilidade não exercida foi o que mudou a conversa.

## Conceitos Relacionados

- [Serviços Gerenciados](/09-cloud-architecture/managed-services.md) — a decisão que gera dependência.
- [Serverless](/09-cloud-architecture/serverless.md) — o grau mais alto.
- [Cloud Native](/09-cloud-architecture/cloud-native.md).
- [Trade-offs](/20-trade-offs/index.md).

## Exercício Prático

Escolha o serviço de nuvem mais crítico do seu sistema e estime: quanto tempo e
quanto dinheiro para substituí-lo por um equivalente em outro provedor?

Se você não conseguir estimar, essa é a informação que falta para a decisão que já
foi tomada.

## Perguntas de Entrevista

- Por que abstrair tudo para portabilidade costuma ser um mau negócio?
- O que de fato prende, em ordem de dificuldade?
- Por que multi-nuvem raramente resolve o problema que promete?

## Para Aprofundar

- Fowler, Martin. *Utility vs Strategic Dichotomy*. martinfowler.com, 2010.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2ª ed. O'Reilly, 2023.
