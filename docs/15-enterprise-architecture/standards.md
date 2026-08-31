---
id: standards
title: Padrões
sidebar_position: 11
description: Prescrever escolhas específicas — e por que o padrão que precisa ser verificado não foi operacionalizado.
doc_type: concept
level: 6
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor cria padrões operacionalizados, com escopo justificado e
  caminho de exceção.
prerequisites: [enterprise-principles]
related: [enterprise-principles, technology-radar, enterprise-governance]
canonical_for: [padrão corporativo, operacionalização de padrão, escopo de padrão]
content_version: 1
last_reviewed: 2026-08-28
---

# Padrões

## Visão Geral

Um padrão prescreve uma escolha específica: use esta biblioteca, este formato, esta
convenção.

Ele difere de um [princípio](/15-enterprise-architecture/enterprise-principles.md), que orienta julgamento sem
determinar a escolha.

E a propriedade que decide se ele funciona: **um padrão que precisa ser verificado por
uma pessoa não foi operacionalizado**. Padrões que dependem de disciplina são seguidos
enquanto for conveniente.

## Problema

O documento de padrões típico tem dezenas de itens, escritos em momentos diferentes, por
pessoas diferentes, sem revisão.

```text
ninguém lê o documento inteiro
a maioria dos itens não é verificada
alguns contradizem outros
vários descrevem tecnologias que a organização não usa mais
```

E o efeito prático: o documento é citado apenas quando alguém quer justificar uma recusa
— o que faz os times o verem como instrumento de bloqueio, não de orientação.

## Conceitos Centrais

### Operacionalizar é a diferença

```text
padrão documentado    "use a biblioteca X para logs estruturados"
                      → depende de alguém lembrar e de alguém verificar
padrão operacionalizado  a biblioteca vem no modelo de serviço
                      → não seguir exige esforço deliberado
```

Ver [plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).

A hierarquia de eficácia:

```text
embutido no caminho pavimentado   o padrão é o que acontece por omissão
verificado automaticamente        a esteira falha se não seguir
documentado e revisado            depende de pessoa
apenas documentado                depende de memória
```

Os dois primeiros funcionam. O terceiro custa caro. O quarto é decorativo.

### O escopo precisa ser justificado

Nem tudo merece padrão. O critério:

```text
padronizar    quando a divergência tem custo real —
              operação, segurança, interoperabilidade, contratação
não padronizar quando a divergência é preferência sem consequência
```

Exemplos de custo real:

```text
formato de log divergente        → ferramenta de análise não funciona
autenticação divergente          → superfície de segurança maior
formato de data divergente       → integrações quebram
tecnologias de banco divergentes → custo operacional multiplicado
```

E exemplos sem custo real: estrutura interna de código, escolha de biblioteca de teste,
convenções de nomenclatura interna do serviço.

Padronizar o segundo grupo produz atrito sem benefício, e corrói a legitimidade dos
padrões que importam.

### Padrões envelhecem mais rápido que princípios

Um princípio expressa um valor; um padrão expressa uma escolha de tecnologia ou de
formato — e tecnologia muda.

```text
princípio  "integração por contrato explícito"        vale por anos
padrão     "use a versão 3 da biblioteca de contrato" vale por meses
```

Isso exige revisão frequente, e um mecanismo de depreciação: um padrão substituído
precisa de prazo de convivência e de caminho de migração.

Ver [contratos de integração](/08-integration-architecture/integration-contracts.md) —
padrões internos merecem o mesmo tratamento que APIs.

### Exceção com registro, não proibição

Como em [princípios](/15-enterprise-architecture/enterprise-principles.md): um padrão sem caminho de exceção produz
contorno silencioso.

E o registro de exceções é o mecanismo de melhoria: se um padrão acumula exceções, ele
está errado ou o escopo está amplo demais.

### Quem escreve importa

Padrões escritos por quem não os usa tendem a ignorar restrições práticas.

O modelo que funciona: o padrão é proposto por quem tem o problema, revisado por quem
tem visão do panorama, e operacionalizado por quem mantém a plataforma.

Isso também resolve a adoção: quem participou da criação não precisa ser convencido.

### O número importa

```text
5 a 15 padrões operacionalizados    gerenciável
50+ documentados                    ninguém conhece
```

Um número grande é sintoma de que padrões estão sendo usados onde princípios ou
caminho pavimentado resolveriam.

E a maior parte dos padrões documentados que não são verificados poderia simplesmente
deixar de existir sem consequência — o que é uma constatação desconfortável e
frequentemente verdadeira.

### O padrão precisa ter um caminho de migração

Um padrão novo que se aplica apenas a serviços novos produz uma organização com duas
realidades permanentes.

Um que se aplica a tudo, imediatamente, produz uma migração forçada que ninguém orçou.

O que funciona é o meio:

```text
obrigatório para o novo         imediatamente
migração do existente           com prazo e priorização
exceção para o que não migra    registrada, com justificativa
depreciação do anterior         com data
```

E o prazo precisa ser realista: um padrão que exige migrar 80 serviços em um trimestre
não será cumprido, e o descumprimento generalizado corrói a legitimidade de todos os
padrões.

A alternativa que reduz o custo: quando o padrão pode ser aplicado pela plataforma —
atualizando o modelo de serviço e propagando — a migração deixa de ser trabalho de cada
time. Ver
[plataformas internas](/14-devops-and-platform/internal-developer-platforms.md).

### Padrões descontinuados precisam de rastreabilidade

Um padrão substituído deixa um rastro: os sistemas construídos sob ele.

Sem rastreabilidade, a organização acumula gerações de padrões sobrepostos, e ninguém
sabe qual sistema segue qual.

```text
qual padrão cada sistema segue      derivado, no catálogo de serviços
quando o padrão anterior expira     data explícita
o que falta migrar                  lista visível, priorizada
quem é responsável pela migração    nomeado
```

Ver [plataformas internas](/14-devops-and-platform/internal-developer-platforms.md) —
quando a plataforma conhece o padrão de cada serviço, essa rastreabilidade é derivada e
não exige manutenção.

E há um caso comum que merece decisão explícita: sistemas que não vão migrar. Um sistema
em processo de desativação não deveria consumir esforço para atender um padrão novo — e a
exceção precisa ser registrada, ou ele aparece perpetuamente na lista de pendências.

### Adoção medida, não declarada

Um padrão só existe na medida em que é seguido, e a diferença entre "publicado" e
"adotado" costuma ser grande o bastante para invalidar a política inteira.

```text
publicado    o documento existe
comunicado   os times sabem que existe
adotado      os sistemas novos seguem
convergido   os sistemas antigos foram migrados
```

Medir a adoção separa padrões vivos de letra morta, e produz a informação que decide o
próximo passo: um padrão publicado há dois anos e seguido por 20% dos sistemas novos ou
está errado, ou não foi comunicado, ou não tem caminho de migração viável — e as três
causas exigem respostas diferentes.

Sem essa medição, a resposta institucional padrão é reforçar a obrigatoriedade, que é a
única que não funciona em nenhum dos três casos.

## Modelo Mental

**Padrão que precisa ser verificado por pessoa não foi operacionalizado.** Embuta,
automatize, ou aceite que ele é decorativo.

## Quando Usar

- Onde a divergência tem custo operacional, de segurança ou de interoperabilidade.
- Para formatos que atravessam sistemas.
- Onde a padronização reduz carga cognitiva.
- Em requisitos regulatórios.

## Quando Não Usar

**Para preferências sem consequência.**

**Apenas documentado**, sem operacionalização.

**Em número grande.**

**Escrito por quem não usa.**

**Sem caminho de exceção.**

**Sem revisão e depreciação.**

## Alternativas

- **Caminho pavimentado** — o padrão embutido, mais forte que qualquer documento.
- **Verificação automatizada** — a esteira aplica.
- **[Princípios](/15-enterprise-architecture/enterprise-principles.md)** — quando a escolha específica não importa,
  só a direção.
- **[Radar tecnológico](/15-enterprise-architecture/technology-radar.md)** — recomendação com contexto, sem
  obrigação.

## Trade-offs

| Padrão | Princípio |
|---|---|
| Escolha específica | Direção |
| Verificável | Depende de julgamento |
| Envelhece rápido | Estável |
| Reduz variação | Preserva autonomia |

| Operacionalizado | Documentado |
|---|---|
| Seguido por omissão | Depende de disciplina |
| Custo de construir | Baixo |
| Difícil de contornar | Fácil |

## Modos de Falha

**Documento não lido.**

**Padrão sem verificação.** Seguido enquanto conveniente.

**Escopo amplo demais.** Padroniza o que não tem custo.

**Envelhecido.** Prescreve tecnologia abandonada.

**Sem depreciação.** Padrões antigos e novos coexistindo sem prazo.

**Usado para bloquear.** Citado apenas em recusas.

## Erros Comuns

**Documentar sem operacionalizar.**

**Padronizar preferências.**

**Não revisar.**

**Não ter caminho de exceção.**

**Escrever sem quem usa.**

**Acumular sem remover.**

## Exemplo Real

Uma empresa de tecnologia tinha um documento de padrões com 47 itens, mantido por um
grupo de arquitetura.

Uma verificação amostral em 20 serviços mediu a aderência:

```text
padrões seguidos por todos os 20      6   — todos embutidos no modelo de serviço
seguidos por mais da metade           9
seguidos por menos da metade         18
seguidos por nenhum                  14
```

Os seis universalmente seguidos eram exatamente os que vinham prontos no modelo de
serviço. Nenhum deles exigia que alguém lembrasse.

Os 14 seguidos por nenhum incluíam quatro que prescreviam tecnologias que a empresa não
usava mais.

A reformulação:

**Classificação por custo da divergência.** Cada padrão foi avaliado: a divergência tem
custo operacional, de segurança ou de interoperabilidade real?

Vinte e um passaram no teste. Os outros 26 foram removidos — eram preferências.

**Operacionalização dos 21:**

```text
embutidos no modelo de serviço    12
verificados na esteira             7
documentados com revisão manual    2  — os que não podiam ser automatizados
```

**Depreciação.** Os quatro que prescreviam tecnologias abandonadas foram removidos com
comunicação, e os serviços que ainda as usavam entraram numa fila de migração.

**Registro de exceções.** Em um ano, 9 exceções registradas. Sete eram do mesmo padrão —
o de formato de mensagem — que foi revisado e ampliado.

**Revisão semestral**, com a mesma verificação amostral de aderência.

Resultado: 47 padrões viraram 21, e a aderência média subiu de 42% para 96% — não por
mais controle, mas porque seguir passou a ser o caminho de menor esforço.

O que se registrou depois: os 26 padrões removidos não causaram nenhum problema. Eles
existiam porque alguém, em algum momento, teve uma preferência e escreveu.

## Conceitos Relacionados

- [Princípios Corporativos](/15-enterprise-architecture/enterprise-principles.md) — a orientação sem prescrição.
- [Radar Tecnológico](/15-enterprise-architecture/technology-radar.md).
- [Governança Corporativa](/15-enterprise-architecture/enterprise-governance.md).
- [Plataformas Internas](/14-devops-and-platform/internal-developer-platforms.md).

## Exercício Prático

Pegue cinco padrões da sua organização e verifique a aderência real em alguns serviços.

Os que não são seguidos ou não importam, ou não foram operacionalizados. Em ambos os
casos, o documento não está funcionando.

## Perguntas de Entrevista

- Qual a diferença entre padrão e princípio?
- Por que padrão verificado por pessoa não foi operacionalizado?
- Qual critério justifica padronizar algo?

## Para Aprofundar

- Open Group. *TOGAF Standard* — governança de arquitetura.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
