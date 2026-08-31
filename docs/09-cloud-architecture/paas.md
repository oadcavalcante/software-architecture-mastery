---
id: paas
title: PaaS
sidebar_position: 2
description: Entregar código e não pensar em servidor — produtividade alta dentro de um contorno que você não escolhe.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece quando o contorno de uma PaaS cabe no problema e
  quando ele vai apertar.
prerequisites: [iaas]
related: [iaas, saas, serverless]
canonical_for: [PaaS, plataforma como serviço, contorno da plataforma]
content_version: 1
last_reviewed: 2026-08-27
---

# PaaS

## Visão Geral

PaaS — plataforma como serviço — recebe seu código e cuida do resto: sistema
operacional, tempo de execução, servidor, escalonamento, implantação, certificados.

Você entrega a aplicação e configura poucas coisas. A plataforma decide o resto,
segundo convenções dela.

A produtividade é alta, e o preço é opinião: a plataforma tem um jeito de fazer as
coisas, e sair dele varia de difícil a impossível.

## Problema

Entre "alugar uma máquina vazia" e "escrever a aplicação" há uma quantidade grande
de trabalho repetitivo: configurar o servidor, empacotar, definir a implantação,
configurar certificado, escalonamento, registros, verificação de saúde.

Esse trabalho é praticamente idêntico entre aplicações e entre empresas. Fazê-lo
para cada projeto é reinventar convenção.

PaaS empacota tudo isso como padrão.

## Conceitos Centrais

### O contorno é a característica

Uma PaaS assume coisas: como a aplicação é iniciada, onde a configuração vem, como o
tráfego chega, como o sistema de arquivos se comporta.

Aplicações que seguem essas convenções ganham muito. Aplicações que precisam de algo
fora delas batem numa parede — e a parede não tem porta.

Por isso a avaliação certa não é de recursos, e sim: **o que meu sistema precisa
fazer que a plataforma não permite?**

### As restrições típicas

Sendo específico, porque é o que decide:

**Sistema de arquivos efêmero.** Escrita local some no reinício. Estado precisa ir
para fora.

**Sem processo persistente entre requisições.** Trabalho em segundo plano exige um
componente separado.

**Portas e protocolos limitados.** Tipicamente HTTP. Protocolos próprios ou conexões
de longa duração podem não caber.

**Tempo limite de requisição.** Operações longas são cortadas.

**Versões de tempo de execução.** As que a plataforma suporta, no ritmo dela.

**Sem acesso ao sistema.** Diagnóstico profundo vira ticket.

Nenhuma é defeito — todas são o preço da convenção.

### As doze regras continuam valendo

A metodologia de aplicação em doze fatores nasceu de PaaS e descreve o que uma
aplicação precisa ser para caber bem:

```text
configuração no ambiente, não em arquivo
sem estado no processo
dependências declaradas explicitamente
registros na saída padrão
processos descartáveis, com desligamento gracioso
paridade entre desenvolvimento e produção
```

Aplicações que seguem isso rodam bem em PaaS, em contêineres e em serverless. É a
disciplina que dá portabilidade entre os três modelos, e vale mesmo sem PaaS.

### Plataforma interna de desenvolvimento

A versão construída dentro de casa — ver
[plataformas internas](/14-devops-and-platform/internal-developer-platforms.md)
para o tratamento completo: um time de plataforma oferece aos demais uma
camada com implantação, observabilidade e padrões prontos, sobre
[Kubernetes](/09-cloud-architecture/kubernetes.md) ou IaaS.

O objetivo é o mesmo — remover trabalho repetitivo — com o contorno definido pela
própria organização.

O risco é conhecido: construir uma PaaS interna é um produto, com usuários,
manutenção e evolução. Times que a tratam como projeto de infraestrutura produzem
uma camada que ninguém quer usar, e as pessoas voltam a fazer direto.

### Onde ela mais rende

**Times pequenos** sem capacidade operacional dedicada.

**Aplicações web convencionais**, que é a maioria.

**Velocidade de entrega como prioridade.**

**Padronização entre muitos times**, no caso da plataforma interna.

**Ambientes efêmeros** por ramo — uma das melhores capacidades do modelo, e uma das
menos usadas.

### O caminho de saída deveria ser conhecido antes da entrada

Uma PaaS é fácil de entrar e desigualmente difícil de deixar, conforme o quanto se
usa dos serviços dela além da execução do código.

O que costuma prender, em ordem crescente:

**Execução da aplicação.** Fácil de mover, se a aplicação seguir as doze regras.

**Banco e cache da plataforma.** Exportáveis, com tempo de migração.

**Serviços auxiliares proprietários** — filas, agendadores, integrações. Sem
equivalente direto.

**Automação da plataforma** — esteiras, ambientes de revisão, escalonamento. Precisa
ser reconstruída.

Saber onde você está nessa escala é o que permite estimar a saída antes de precisar
dela. Ver [dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md).

A regra prática que preserva a maior parte da opção sem custo relevante: use a
plataforma para executar o código, e prefira serviços gerenciados portáveis para o
resto.

## Modelo Mental

**PaaS troca liberdade por produtividade.** Vale quando sua aplicação é
convencional; aperta quando ela não é.

## Quando Usar

- Aplicação web convencional.
- Time pequeno, sem experiência operacional.
- Velocidade de entrega é prioridade.
- O padrão da plataforma atende os requisitos.
- Padronizar implantação entre muitos times.
- Ambientes efêmeros para revisão.

## Quando Não Usar

**Quando a aplicação precisa do que a plataforma não permite.**

**Para processamento longo ou intensivo.**

**Quando o custo em escala inviabiliza.** O prêmio por unidade é alto.

**Para software legado** que assume sistema de arquivos e processos persistentes.

**Plataforma interna sem tratá-la como produto.**

**Quando a dependência é inaceitável.** Ver
[dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md).

## Alternativas

- **[Contêineres](/09-cloud-architecture/containers.md) com orquestração** — mais controle, mais trabalho.
- **[Serverless](/09-cloud-architecture/serverless.md)** — para cargas orientadas a evento.
- **[IaaS](/09-cloud-architecture/iaas.md)** — controle total.
- **PaaS sobre Kubernetes** — plataformas que dão a experiência de PaaS mantendo a
  base portável. Meio-termo que resolve boa parte da objeção de dependência.

## Trade-offs

| PaaS | IaaS ou contêineres |
|---|---|
| Entrega rápida | Mais lenta |
| Sem operação de plataforma | Toda |
| Contorno rígido | Liberdade |
| Preço unitário maior | Menor |
| Dependência maior | Menor |
| Diagnóstico limitado | Acesso direto |

## Modos de Falha

**Requisito que a plataforma não atende.** Descoberto tarde, sem saída boa.

**Estado no sistema de arquivos perdido.**

**Tempo limite cortando processamento.**

**Versão de tempo de execução descontinuada** com prazo do fornecedor.

**Custo em escala.** O que era barato com pouco tráfego fica caro.

**Diagnóstico bloqueado.** Sem acesso, um problema intermitente vira suporte.

**Plataforma interna abandonada.** Construída e não mantida; os times a contornam.

## Erros Comuns

**Escolher sem verificar as restrições contra os requisitos.**

**Guardar estado localmente.**

**Colocar trabalho em segundo plano dentro da requisição.**

**Não estimar o custo no volume alvo.**

**Construir plataforma interna sem tratá-la como produto.**

## Exemplo Real

Uma startup construiu o produto inteiro sobre uma PaaS. Nos dois primeiros anos foi
a decisão certa: quatro engenheiros, nenhum tempo gasto em infraestrutura, entrega
rápida.

No terceiro ano, três limites apareceram ao mesmo tempo:

**Processamento longo.** Um novo recurso exigia processar arquivos grandes,
excedendo o tempo limite de requisição. A solução foi um componente separado fora da
plataforma — o primeiro pedaço de infraestrutura própria.

**Custo.** Com o tráfego crescido, a fatura da PaaS chegou a cerca de 4 vezes o
custo estimado do equivalente em contêineres. O prêmio de produtividade, que era
irrelevante com pouco tráfego, virou o segundo maior item da conta.

**Diagnóstico.** Um problema intermitente de latência levou cinco semanas para ser
resolvido, majoritariamente esperando o suporte, porque a equipe não tinha acesso ao
ambiente para investigar.

A migração para contêineres levou cinco meses. Foi facilitada por uma coisa: a
aplicação seguia as doze regras, porque a PaaS a tinha obrigado a isso. Não havia
estado local, a configuração vinha do ambiente, os registros iam para a saída
padrão.

O que a equipe registra: a PaaS foi a escolha certa e deixou de ser. As duas coisas
são verdade, e não havia como saber no primeiro ano — nem valia a pena tentar
adivinhar.

O que teria ajudado era ter estimado, em algum momento do segundo ano, o ponto em
que o custo inverteria. Isso teria dado meses de antecedência em vez de urgência.

## Conceitos Relacionados

- [IaaS](/09-cloud-architecture/iaas.md) — o modelo abaixo.
- [SaaS](/09-cloud-architecture/saas.md) — o modelo acima.
- [Serverless](/09-cloud-architecture/serverless.md) — a evolução do modelo.
- [Contêineres](/09-cloud-architecture/containers.md) — a alternativa comum.

## Exercício Prático

Se você usa PaaS, liste três coisas que seu sistema pode precisar fazer nos
próximos dois anos e verifique se a plataforma permite.

E estime o custo no volume que você espera ter — o ponto de inversão costuma chegar
antes do previsto.

## Perguntas de Entrevista

- Por que o contorno de uma PaaS é a característica, e não uma limitação?
- Por que as doze regras dão portabilidade entre modelos?
- Que risco tem construir uma plataforma interna?

## Para Aprofundar

- Wiggins, Adam. *The Twelve-Factor App*, 2011.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
