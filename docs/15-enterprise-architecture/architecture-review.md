---
id: architecture-review
title: Revisão de Arquitetura
sidebar_position: 13
description: Como olhar decisões sem virar comitê que aprova o inevitável.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha revisão que acontece cedo, com critério, e melhora a
  decisão em vez de apenas autorizá-la.
prerequisites: [architecture-levels]
related: [architecture-levels, enterprise-governance, enterprise-principles]
canonical_for: [revisão de arquitetura, revisão por pares, consulta arquitetural]
content_version: 1
last_reviewed: 2026-08-28
---

# Revisão de Arquitetura

## Visão Geral

Revisão de arquitetura é olhar uma decisão antes que ela seja implementada, com o
objetivo de **melhorá-la**.

A palavra que decide o resultado é *melhorá-la*. Revisões que existem para autorizar
produzem o padrão conhecido: uma reunião no fim do processo, em que a proposta já está
pronta, a implementação já começou, e a única resposta viável é sim.

## Problema

A revisão tradicional chega tarde e tem o incentivo errado.

**Tarde.** Quando a proposta é apresentada, o trabalho de desenho já foi feito. Mudar
significa jogar fora esforço, e a inércia é grande.

**Incentivo errado.** Se a revisão pode dizer não, quem propõe otimiza para conseguir o
sim — apresentando o mínimo, evitando incertezas, e defendendo em vez de discutir.

O resultado é o pior dos dois mundos: um processo que consome tempo e não melhora
decisões.

## Conceitos Centrais

### Cedo vale mais que completo

```text
revisão no início    a proposta é uma ideia, ainda maleável
                     perguntas mudam o desenho
revisão no fim       a proposta é um plano, com trabalho investido
                     perguntas viram obstáculo
```

Uma conversa de trinta minutos quando a ideia está sendo formada vale mais que uma
revisão formal de duas horas depois de pronta.

Isso muda o formato: em vez de um evento no fim, uma consulta disponível durante. Quem
está desenhando procura quem tem contexto amplo, e a conversa acontece quando ainda é
barata mudar.

### Consulta em vez de aprovação

A mudança de postura que resolve o incentivo:

```text
aprovação   quem revisa decide, quem propõe convence
consulta    quem propõe decide, quem revisa oferece perspectiva
```

Na segunda, a responsabilidade permanece com o time — o que é correto, porque é quem tem
o contexto. E o revisor deixa de ser obstáculo a superar, passando a ser recurso a usar.

Isso exige registro: a decisão é do time, e o que foi discutido fica documentado, com o
que foi considerado e descartado. Ver
[decisões de arquitetura](/18-architecture-decisions/index.md).

Para as poucas decisões que genuinamente exigem aprovação — alcance amplo, reversão cara
— ela permanece. Ver
[níveis de arquitetura](/15-enterprise-architecture/architecture-levels.md).

### O que a revisão deve procurar

Uma lista que evita que a revisão vire preferência pessoal:

```text
alternativas         foram consideradas? por que esta?
premissas            o que precisa ser verdade? foi verificado?
fronteiras           quem é dono do quê? contratos explícitos?
reversibilidade      se estiver errado, quanto custa voltar?
operação             quem opera? como se sabe que está funcionando?
alcance              afeta outros times? eles sabem?
```

A segunda linha é a mais produtiva: a maioria das decisões ruins vem de premissas não
verificadas, não de raciocínio ruim.

E a quarta calibra o rigor: uma decisão reversível não merece a mesma escrutínio de uma
que fixa o modelo de dados por dez anos.

### Perguntas, não opiniões

A diferença entre uma revisão que ajuda e uma que atrita:

```text
opinião   "eu usaria eventos aqui"
pergunta  "o que acontece se este serviço ficar fora por uma hora?"
```

A pergunta expõe uma consequência que o time avalia. A opinião pede que o time defenda a
escolha contra a preferência de outra pessoa.

Isso não significa que o revisor não tem posição — significa que a posição é apresentada
como consequência, não como preferência.

### Quem revisa

```text
pares                 outros times que resolveram problemas parecidos
arquitetos             visão do panorama, precedentes
especialistas          segurança, dados, operação, conforme o caso
o próprio time         a autorrevisão estruturada pega muito
```

A última é subestimada: um roteiro de perguntas aplicado pelo próprio time, antes de
qualquer revisão externa, resolve a maior parte dos casos e reduz drasticamente o volume
que precisa de outra pessoa.

E a primeira produz o melhor sinal: revisão por pares distribui conhecimento nas duas
direções.

### O resultado precisa ser registrado

Uma revisão que termina numa conversa se perde. O registro:

```text
o que foi decidido
quais alternativas foram consideradas
que premissas sustentam
o que ficou em aberto
quem participou
```

Isso serve à decisão futura — alguém com problema parecido encontra o precedente — e à
própria revisão, porque o histórico revela padrões: se as mesmas questões aparecem
repetidamente, elas deveriam virar princípio, padrão ou caminho pavimentado.

### Quem revisa precisa ter algo a perder

Um detalhe de desenho que muda o comportamento: revisores que não sofrem as
consequências da decisão tendem a ser mais conservadores do que o problema justifica.

```text
revisor sem consequência   otimiza para evitar risco — recusa o incomum
revisor com consequência   pondera risco contra custo de não fazer
```

Isso não significa que apenas quem constrói pode revisar. Significa que a revisão precisa
incluir alguém que arque com o resultado — tipicamente o próprio time, cuja decisão
permanece.

É outro argumento a favor de consulta em vez de aprovação: na consulta, quem decide é
quem vai conviver com a decisão, e a opinião externa entra como informação.

E há um efeito de segunda ordem: revisores permanentes, que só revisam, perdem contato
com as restrições práticas ao longo do tempo. Rotacionar quem revisa — trazendo pessoas
que estão construindo — mantém a revisão ancorada na realidade.

## Modelo Mental

**Revisão melhora a decisão; ela não a toma.** Cedo, por consulta, com perguntas.

## Quando Usar

- Decisões de alcance além do time.
- Decisões difíceis de reverter.
- Quando o time pede — a consulta voluntária é o melhor sinal.
- Padrões novos, que podem virar precedente.

## Quando Não Usar

**No fim do processo**, como autorização.

**Para decisões locais e reversíveis.**

**Como veto sem alternativa.**

**Sem critério**, deixando espaço para preferência pessoal.

**Sem registro.**

**Com participantes que não têm contexto** para contribuir.

## Alternativas

- **Autorrevisão estruturada** — um roteiro de perguntas aplicado pelo time.
- **Revisão por pares** — outro time, sem hierarquia.
- **Consulta informal** — uma conversa, sem processo.
- **Revisão após o fato** — para decisões reversíveis, olhar padrões trimestralmente.
- **Caminho pavimentado** — remover a decisão em vez de revisá-la.

A última é a mais eficaz: se a mesma decisão é revisada trinta vezes, ela deveria ter
uma resposta padrão embutida.

## Trade-offs

| Cedo | Tarde |
|---|---|
| Barato mudar | Trabalho investido |
| Proposta incompleta | Informação completa |
| Conversa | Apresentação |

| Consulta | Aprovação |
|---|---|
| Responsabilidade no time | No revisor |
| Sem incentivo a esconder | Otimizado para o sim |
| Menos controle | Mais |

## Modos de Falha

**Carimbo.** Aprova tudo, com espera.

**Veto sem alternativa.** Diz não, não ajuda.

**Preferência pessoal.** Sem critério, vira gosto de quem revisa.

**Tarde demais.** A implementação já começou.

**Sem registro.** O aprendizado se perde.

**Volume alto.** Tudo passa, e nada recebe atenção real.

**Revisores sem contexto.** Perguntas genéricas, discussão improdutiva.

## Erros Comuns

**Revisar no fim.** Quando o código está pronto, mudar a decisão custa a reescrita, e a revisão vira carimbo. O momento útil é quando as opções ainda estão abertas.

**Aprovar em vez de consultar.** Revisão como portão transfere a responsabilidade para o revisor e produz submissão em vez de discussão. Como consultoria, ela melhora a decisão de quem responde por ela.

**Não ter critério escrito.** Sem critérios publicados, a revisão parece arbitrária e depende de quem estava na sala — o que a torna impossível de preparar.

**Não registrar.** A conclusão se perde e a mesma discussão volta em seis meses, com pessoas diferentes e frequentemente com desfecho oposto.

**Revisar decisões locais.** Revisar o que não atravessa fronteira nenhuma consome o tempo do fórum e ensina os times a evitá-lo.

**Não transformar padrão recorrente** em caminho pavimentado. Se a mesma pergunta chega cinco vezes, a resposta deveria ser um padrão documentado — a sexta não precisaria de reunião.

## Exemplo Real

Uma empresa de serviços tinha um comitê de arquitetura semanal, obrigatório para
qualquer sistema novo ou mudança estrutural.

Os números de doze meses:

```text
propostas revisadas       184
aprovadas                 179  (97%)
rejeitadas                  5
espera média              19 dias
mudanças de desenho        11  (6% das propostas)
```

Em 97% dos casos, o comitê era espera. Em 6%, ele melhorou algo.

E as entrevistas revelaram o comportamento induzido: os times apresentavam o mínimo,
evitavam mencionar incertezas, e tratavam a sessão como defesa.

A reformulação:

**Autorrevisão obrigatória.** Um roteiro de dez perguntas — alternativas, premissas,
fronteiras, reversibilidade, operação, alcance — preenchido pelo time antes de qualquer
coisa.

Isso sozinho pegou a maior parte do que o comitê pegava, e mais cedo.

**Consulta voluntária.** Arquitetos disponíveis para conversar durante o desenho, sem
processo. Passou a ser o formato mais usado — cerca de três conversas por semana,
iniciadas pelos times.

**Aprovação apenas para alcance amplo e reversão cara.** Cerca de uma por mês.

**Revisão por pares** para o intermediário: outro time olha, sem hierarquia.

**Registro público** de todas as decisões, pesquisável.

**Revisão trimestral de padrões.** As questões que apareciam repetidamente viraram três
princípios e dois caminhos pavimentados — removendo a necessidade de revisá-las
individualmente.

Resultado em um ano: espera média de 19 dias para 2, e o número de mudanças de desenho
provocadas por revisão subiu de 11 para 47 — porque a conversa passou a acontecer quando
mudar ainda era barato.

A conclusão registrada: o comitê não era inútil, era caro pelo que entregava. E o
formato — apresentação para aprovação — produzia exatamente o comportamento que
impedia a revisão de funcionar.

## Conceitos Relacionados

- [Níveis de Arquitetura](/15-enterprise-architecture/architecture-levels.md) — o que merece revisão.
- [Governança Corporativa](/15-enterprise-architecture/enterprise-governance.md).
- [Princípios Corporativos](/15-enterprise-architecture/enterprise-principles.md) — o critério.
- [Decisões de Arquitetura](/18-architecture-decisions/index.md) — o registro.

## Exercício Prático

Meça, no seu processo de revisão: quantas propostas foram rejeitadas, quantas mudaram de
desenho, e qual a espera média.

Se a taxa de mudança for baixa e a espera alta, a revisão está acontecendo tarde demais.

## Perguntas de Entrevista

- Por que revisão tardia tem incentivo errado?
- Qual a diferença prática entre consulta e aprovação?
- Por que perguntas funcionam melhor que opiniões?

## Para Aprofundar

- Fowler, Martin. *Who Needs an Architect?*. IEEE Software, 2003.
- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
