---
id: compliance
title: Conformidade
sidebar_position: 5
description: Verificar continuamente o que importa, em vez de auditar pontualmente o que é fácil.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha verificação de conformidade contínua e sabe distinguir
  conformidade real de conformidade demonstrável.
prerequisites: [governance-standards]
related: [governance-standards, fitness-functions-governance, exceptions]
canonical_for: [conformidade arquitetural, deriva de conformidade, evidência de conformidade, conformidade contínua]
content_version: 1
last_reviewed: 2026-08-29
---

# Conformidade

## Visão Geral

Conformidade é a verificação de que a realidade corresponde ao que foi decidido — padrões
seguidos, controles presentes, requisitos regulatórios atendidos.

O desenho da verificação decide quase tudo:

```text
auditoria pontual    fotografia periódica, cara, preparável
verificação contínua filme, barata por execução, não preparável
```

A diferença não é de rigor. É que a primeira mede um momento escolhido, e a segunda mede o
estado real. Sistemas preparados para auditoria passam em auditoria; sistemas verificados
continuamente ou estão conformes, ou o desvio aparece no mesmo dia.

E há uma armadilha específica desta área: o que é fácil de verificar não é o que mais
importa, e mede-se o fácil.

## Problema

O ciclo clássico de conformidade por auditoria:

```text
mês 1     auditoria anunciada para daqui a seis semanas
mês 2     times corrigem o que sabem que será olhado
mês 3     auditoria: 94% de conformidade
mês 4-11  deriva silenciosa
mês 12    novo ciclo
```

A taxa de 94% é verdadeira sobre o mês 3 e falsa sobre o ano. O que se mediu foi a
capacidade da organização de se preparar, não o seu estado.

E o segundo problema é de seleção. Verificar se existe um documento é fácil; verificar se o
controle funciona é difícil. Programas de conformidade migram, com o tempo, para o
verificável — e passam a medir a existência de artefatos.

```text
fácil de verificar     o documento existe, o campo está preenchido,
                       a política foi assinada
difícil e importante   o controle funciona, o dado está protegido,
                       a decisão foi tomada com a informação certa
```

## Conceitos Centrais

### Conformidade contínua

```text
verificação executada a cada mudança, ou diariamente
resultado visível ao time, não só à auditoria
desvio detectado em horas
sem janela de preparação
```

Isso muda a natureza do trabalho: em vez de um esforço concentrado antes da auditoria, a
conformidade vira uma propriedade mantida — como um teste que não pode quebrar.

Ver [funções de aptidão](fitness-functions-governance.md), que são a implementação
natural.

### Verifique o efeito, não o artefato

```text
artefato   "existe uma política de senha documentada"
efeito     "nenhuma conta ativa tem senha fora da política"

artefato   "o sistema tem plano de recuperação"
efeito     "a restauração foi testada nos últimos 90 dias, com resultado"

artefato   "há um diagrama de arquitetura"
efeito     "os serviços implantados correspondem ao diagrama"
```

A coluna da direita é mais cara de construir e é a única que informa. Programas que só
verificam a esquerda produzem organizações com documentação impecável e controles
inexistentes.

### Deriva é o estado natural

Sistemas em mudança divergem do declarado por acúmulo de pequenas decisões, sem que ninguém
decida divergir:

```text
uma exceção temporária que não expira
uma configuração ajustada num incidente e não revertida
um serviço novo criado fora do gabarito
uma dependência atualizada com mudança de comportamento
```

Conformidade não é um estado alcançado; é um estado **mantido contra deriva**. Isso implica
que a verificação precisa ser tão contínua quanto a mudança.

### Evidência precisa ser subproduto, não trabalho

```text
ruim   alguém coleta capturas de tela e preenche planilha
bom    a verificação registra o resultado com carimbo de tempo,
       e o registro é a evidência
```

Quando produzir evidência é trabalho manual, ela é produzida perto da auditoria e descreve
o momento da coleta. Quando é subproduto da verificação automática, ela descreve o período
inteiro.

Isso também resolve o custo: programas de conformidade manual consomem esforço proporcional
ao número de sistemas, o que não escala.

### Conformidade não é segurança

Uma distinção que evita confiança indevida:

```text
conformidade   atende ao que foi especificado
segurança      resiste a quem tenta
```

Um sistema pode estar 100% conforme e ser inseguro, se a especificação não cobre a ameaça
real. O inverso também ocorre: um sistema seguro pode falhar em conformidade por não
produzir a evidência exigida.

Tratar conformidade como prova de segurança é um dos erros mais caros da área. Ver
[modelagem de ameaças](../10-security/threat-modeling.md).

### Nem tudo precisa do mesmo nível

```text
requisito regulatório          verificação obrigatória, evidência retida
controle de segurança crítico  verificação contínua, alarme
padrão interno importante      verificação com relatório ao time
preferência                    não verificar
```

Verificar tudo com o mesmo rigor produz ruído, e ruído faz com que os alertas que importam
sejam ignorados. Ver [medição](measuring-governance.md).

### O resultado precisa chegar a quem pode agir

Um relatório de conformidade que vai para um comitê e não para o time é informação no lugar
errado.

```text
para o time      acionável, no fluxo de trabalho, com o que fazer
para a gestão    agregado, tendência, risco
para auditoria   evidência retida, com histórico
```

Os três públicos precisam de recortes diferentes dos mesmos dados. O do time é o único que
produz correção.

## Modelo Mental

**Contínua, sobre efeito, com evidência automática.** Se dá para se preparar, mede-se
preparação.

## Quando Usar

- Para requisitos regulatórios, sempre com evidência retida.
- Para controles de segurança críticos, continuamente.
- Para padrões com risco de deriva.
- Onde a verificação puder ser automatizada.

## Quando Não Usar

**Só por auditoria periódica**, quando a mudança é contínua.

**Sobre artefatos**, quando o efeito é verificável.

**Para tudo com o mesmo rigor.**

**Com evidência manual**, se houver alternativa automática.

**Como prova de segurança.**

**Sem chegar a quem pode corrigir.**

## Alternativas

- **[Funções de aptidão](fitness-functions-governance.md)** — o mesmo mecanismo, com foco em
  propriedade arquitetural.
- **Controles preventivos** — impedir em vez de detectar; melhor quando aplicável.
- **Amostragem** — quando a verificação completa é inviável, com amostra aleatória e não
  escolhida.
- **Atestação pelo time** — barata, e vale o que vale a honestidade e o conhecimento de quem
  atesta.

## Trade-offs

| Contínua | Auditoria periódica |
|---|---|
| Estado real | Momento escolhido |
| Não preparável | Preparável |
| Custo inicial alto | Custo recorrente de esforço |
| Exige automação | Exige pessoas |

| Verificar efeito | Verificar artefato |
|---|---|
| Informa | Fácil e barato |
| Caro de construir | Escala trivialmente |
| Difícil de burlar | Burlável |

## Modos de Falha

**Preparação para auditoria.** Mede-se preparo.

**Migração para o fácil.** Conformidade de documentos.

**Deriva entre ciclos.** Conformidade real muito abaixo da medida.

**Evidência manual.** Cara e datada.

**Ruído.** Verificar tudo faz ignorar o que importa.

**Conformidade confundida com segurança.**

## Erros Comuns

**Medir existência de documento.**

**Não expirar exceções**, que viram deriva permanente. Ver [exceções](exceptions.md).

**Relatar só para cima.**

**Verificar apenas o que já está automatizado**, sem cobrir o que importa e é difícil.

**Não reter evidência histórica**, o que obriga a reconstruir sob pressão.

## Exemplo Real

Um banco digital tinha conformidade arquitetural verificada por auditoria interna
semestral, com amostragem de 20% dos sistemas.

Os resultados eram consistentemente bons — entre 91% e 96% ao longo de três anos.

Um incidente mudou a leitura. Um serviço com dados de cliente foi exposto por 11 dias com
autenticação desabilitada, após uma mudança de configuração feita durante um incidente e
não revertida. O serviço tinha passado na auditoria quatro meses antes.

A investigação incluiu uma verificação pontual de todos os 210 sistemas, não amostrada:

```text
conformidade medida na última auditoria (amostra de 20%)     94%
conformidade real, verificação completa                      61%
sistemas com exceção vencida ainda em uso                    38
sistemas fora do inventário de auditoria                     17
controles verificados por documento, não por efeito          9 de 14
```

Os 17 fora do inventário eram sistemas criados depois do último ciclo — o inventário era
atualizado manualmente, antes de cada auditoria.

A reformulação, ao longo de 14 meses:

**Inventário derivado**, não mantido: todo serviço implantado entra automaticamente no
escopo, a partir do orquestrador. Isso eliminou os 17 de uma vez.

**Verificação contínua** de 11 dos 14 controles, executada diariamente sobre o estado real.
Os três restantes — que exigiam julgamento — permaneceram em revisão manual trimestral, com
o escopo reduzido e o custo justificado.

**De artefato para efeito.** Os 9 controles verificados por documento foram reescritos:
"existe política de retenção" virou "nenhum armazenamento tem dado além do prazo de
retenção declarado".

**Exceções com expiração automática.** Uma exceção sem renovação vira desvio no dia
seguinte ao vencimento, com alerta ao dono do sistema e ao gestor. Ver
[exceções](exceptions.md).

**Painel por time**, com o resultado da verificação diária no mesmo lugar onde o time
acompanha o serviço — não num portal de conformidade separado.

**Evidência automática**, com retenção de 24 meses, gerada pela própria verificação.

Resultados após 14 meses:

```text
conformidade real, medida diariamente         89%
tempo médio entre desvio e correção            2,4 dias (antes: até 6 meses)
sistemas fora do inventário                    0
exceções vencidas em uso                       0
esforço de preparação para auditoria          de ~600 h/ano para ~40 h/ano
```

Na retrospectiva: o número de 94% nunca foi mentira — ele era verdadeiro sobre a
amostra e sobre o dia. O erro estava em lê-lo como afirmação sobre a organização.

E o dado que mais mudou o comportamento não foi a taxa de conformidade, e sim o tempo entre
desvio e correção. Ele transformou conformidade de evento em propriedade mantida.

## Conceitos Relacionados

- [Padrões](governance-standards.md) — o que se verifica.
- [Funções de Aptidão](fitness-functions-governance.md) — a implementação.
- [Exceções](exceptions.md) — o desvio autorizado.
- [Auditabilidade](../10-security/auditability.md).

## Exercício Prático

Escolha um controle de conformidade do seu contexto e responda: ele verifica um artefato ou
um efeito?

Se for artefato, escreva a versão que verifica o efeito. A diferença de custo entre as duas
é o que a organização economizou ao medir o fácil.

## Perguntas de Entrevista

- Por que uma taxa de conformidade alta em auditoria pode ser compatível com conformidade
  real baixa?
- Por que evidência deve ser subproduto da verificação?
- Por que conformidade não é prova de segurança?

## Para Aprofundar

- Kim, Gene et al. *The DevOps Handbook*. 2ª ed. IT Revolution, 2021.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
- Bird, Jim. *DevOpsSec*. O'Reilly, 2016.
