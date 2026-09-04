---
id: modular-monolith
title: Monolito Modular
sidebar_position: 24
description: Uma unidade de implantação com fronteiras internas impostas — o default que raramente é considerado.
doc_type: pattern
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor avalia o monolito modular como opção de primeira classe e
  sabe o que ele entrega e o que não entrega em relação a microsserviços.
prerequisites: [design-patterns]
related: [microservices, modular-design, boundaries]
canonical_for: [monolito modular, modular monolith]
content_version: 2
last_reviewed: 2026-08-26
---

# Monolito Modular

## Visão Geral

Um monolito modular é uma aplicação implantada como unidade única, com fronteiras
internas explícitas e **impostas** entre módulos de capacidade.

É a resposta correta sempre que a necessidade é de isolamento **lógico** e não
operacional — e é a menos considerada, porque "monolito" carrega uma conotação negativa
que confunde duas coisas diferentes: implantação única e ausência de estrutura.

## Problema

A escolha é apresentada como binária: monolito ou microsserviços. Monolito
significa código emaranhado; microsserviços significam times autônomos e escala
independente.

A dicotomia é falsa. O que torna um monolito doloroso não é a implantação única —
é a ausência de fronteiras. E o que microsserviços entregam de fato divide-se em
duas coisas com custos muito diferentes:

**Isolamento lógico** — módulos que não se conhecem por dentro. Um monolito
modular entrega isso integralmente, por uma fração do custo.

**Isolamento operacional** — implantação, escala e falha independentes. Só
serviços separados entregam, e é aqui que o custo real está.

A pergunta útil não é "monolito ou microsserviços?". É **"eu preciso de
isolamento operacional, ou só de isolamento lógico?"** — e a segunda basta para tudo que
não tenha requisito próprio de escala, de falha ou de conformidade.

## Conceitos Centrais

### O que o torna modular

Três propriedades. Faltando qualquer uma, é apenas um monolito.

**Módulos por capacidade de negócio**, não por camada técnica. Ver
[design modular](/02-software-design/modular-design.md).

**Contrato explícito entre módulos.** Cada um publica uma interface estreita e
esconde suas entidades, seu esquema e suas dependências.

**Fronteiras impostas por mecanismo.** Teste de arquitetura, módulo de linguagem
ou análise estática. Sem isso, as fronteiras erodem — ver
[arquitetura vs. implementação](/01-fundamentals/architecture-vs-implementation.md).

### Dados por módulo

O ponto que mais separa um monolito modular de um monolito comum: **cada módulo é
dono dos seus dados.**

O banco pode ser um só. O acesso não. O módulo de cobrança não lê a tabela de
catálogo; ele chama a API do módulo de catálogo ou consome um evento.

Impor isso é mais difícil que impor fronteira de código, e há mecanismos: esquemas
separados no mesmo banco, permissões por módulo, ou verificação estática de quais
tabelas cada módulo referencia.

Sem essa propriedade, extrair um serviço depois é praticamente impossível — porque
a fronteira nunca existiu onde importava.

### É o passo que informa a extração

Um monolito modular bem feito responde empiricamente a pergunta que ninguém
consegue responder no papel: **onde as fronteiras de serviço deveriam estar?**

Depois de um ano, o histórico mostra quais módulos mudam juntos, quais são
estáveis, e quais têm requisito de escala distinto. Extrair vira decisão
informada em vez de aposta.

## Quando Usar

- Sistemas novos, em domínio ainda não plenamente entendido.
- Times de até algumas dezenas de pessoas.
- Quando não há requisito comprovado de escala ou implantação independente.
- Quando a organização não tem maturidade operacional para sistemas distribuídos.
- Como etapa antes de considerar extração de serviços.

## Quando Não Usar

**Quando há requisito real de escala independente.** Um componente que precisa de
dez vezes mais recursos que o resto desperdiça ao escalar junto.

**Quando times precisam de autonomia de implantação.** Se cinco times bloqueiam
uns aos outros no release, a fronteira precisa ser de implantação.

**Quando o isolamento de falha é requisito.** Um módulo que não pode derrubar os
outros precisa de processo separado.

**Quando partes têm requisitos regulatórios ou de segurança incompatíveis** — dado que não
pode residir no mesmo processo ou na mesma jurisdição do resto, ou artefato que precisa ser
certificado e auditado separadamente. Aí a unidade de implantação única é o que quebra.

**Quando a base já é grande demais para um build e um teste viáveis.** Se o ciclo
de feedback passa de dezenas de minutos e não há como paralelizar, isso é um
custo real.

## Alternativas

- **[Microsserviços](/03-design-patterns/microservices.md)** — quando o isolamento operacional é
  necessário.
- **Monolito sem módulos** — legítimo em sistemas pequenos e de vida curta.
- **Extração seletiva** — monolito modular com um ou dois serviços extraídos por
  razão específica. É o arranjo que menos tem nome e o que mais aparece quando se olha um
  sistema maduro de perto, porque é onde a decisão foi tomada componente a componente.

## Trade-offs

| Monolito modular | Microsserviços |
|---|---|
| Um pipeline, um artefato | Um por serviço |
| Transação local entre módulos | Coordenação distribuída |
| Refatorar fronteira é um commit | É uma migração |
| Depuração num processo | Rastreamento distribuído |
| Escala em bloco | Escala por serviço |
| Falha compartilhada | Falha isolável |
| Release acoplado entre times | Autônomo |
| Fronteira erode sem mecanismo | A rede impede alcançar o código, não os dados |

As quatro primeiras linhas são vantagens do monolito que costumam ser esquecidas
na comparação. As quatro últimas são o que microsserviços compram — e o preço
está nas colunas de cima.

## Modos de Falha

**Fronteiras nominais.** Diretórios sem imposição. Vira monolito comum em meses.

**Banco compartilhado sem propriedade.** Módulos lendo tabelas uns dos outros. É a
falha que mais impede a extração futura.

**Módulo `shared` crescente.** Dependência universal.

**Build que não escala.** Ciclo de feedback longo demais, sem paralelização por
módulo.

**Modularidade que não corresponde ao negócio.** Divisão por entidade ou por
camada; toda mudança atravessa módulos.

## Erros Comuns

**Tratar "monolito" como falha de arquitetura.** É uma decisão de implantação.

**Não impor as fronteiras.** Sem mecanismo, não há modularidade.

**Compartilhar tabelas entre módulos.** É a decisão que parece economizar uma consulta e
custa a extração futura: a fronteira nunca chega a existir onde importa, e descobrir isso
acontece quando alguém tenta separar.

**Adotar microsserviços para obter isolamento lógico.** Paga-se o custo
operacional por algo que módulos entregam.

**Não medir se as fronteiras estão certas.** O histórico responde.

## Onde ele aparece na prática

**Shopify.** Westeinde, Kirsten. *Deconstructing the Monolith*, Shopify Engineering, 2019,
e o balanço de 2020, *Under Deconstruction: The State of Shopify's Monolith*: o monolito de
comércio em Ruby foi dividido em componentes dentro do mesmo repositório, com fronteiras
impostas pela ferramenta Packwerk. A decisão documentada é sobre esse núcleo — a empresa
opera serviços fora dele —, e é o que a torna útil aqui: a escolha foi por componente, não
pela arquitetura inteira.

**Consolidações de serviços de volta em monolitos modulares.** Existem relatos públicos, e
o motivo declarado costuma ser custo operacional e dificuldade de depuração.

**Aplicações empresariais com módulos de linguagem.** Sistemas de módulo em Java e
.NET permitem impor fronteiras em tempo de compilação.

Nos relatos que chegam a público, o padrão é o mesmo: os times mantiveram a modularidade e
abandonaram a distribuição. Isso é compatível com a tese deste documento — que as duas são
separáveis —, mas não a confirma: quem reverte e se arrepende raramente escreve sobre isso,
então a amostra pende para os casos que deram certo.

## Exemplo Real

Uma empresa de logística com dezoito engenheiros construiu a plataforma em nove
microsserviços, seguindo o que era considerado boa prática.

Depois de dois anos: quatro dos nove eram sempre implantados juntos; nenhum
escalava independentemente porque o gargalo era o banco compartilhado; e o tempo
médio para diagnosticar um incidente era de quarenta minutos, quase todo gasto
correlacionando registros entre serviços.

A consolidação juntou os quatro acoplados num monolito modular, mantendo as
fronteiras como módulos com teste de arquitetura. Dois foram descontinuados.

Três serviços ficaram separados, e essa decisão exigiu resolver primeiro o gargalo
diagnosticado: os dados dos três saíram do banco compartilhado para bases próprias. Sem
isso, mantê-los fora não compraria escala nenhuma — continuariam presos ao mesmo limite,
que era exatamente o motivo de os nove não escalarem.

Resultado: de nove para quatro unidades implantáveis. Tempo de diagnóstico caiu
para menos de dez minutos. Nenhuma fronteira lógica foi perdida.

O que a equipe registrou no ADR é a parte que interessa: a arquitetura original
não estava errada em identificar as fronteiras — estava errada em concluir que
toda fronteira lógica precisava ser uma fronteira de processo.

## Conceitos Relacionados

- [Microsserviços](/03-design-patterns/microservices.md) — quando o isolamento operacional é
  necessário.
- [Design Modular](/02-software-design/modular-design.md) — como executar a
  divisão.
- [Fronteiras](/02-software-design/boundaries.md) — os níveis e seus custos.
- [Design de Componentes](/02-software-design/component-design.md) — quando
  promover um módulo.

## Exercício Prático

Se seu sistema é distribuído, meça: quantos dos serviços são sempre implantados
juntos? Quantos escalam de forma independente na prática?

Se seu sistema é um monolito, verifique: existem fronteiras internas? Elas são
impostas por algum mecanismo? Módulos leem tabelas uns dos outros?

## Perguntas de Entrevista

- Qual a diferença entre isolamento lógico e operacional?
- O que torna um monolito "modular"?
- Por que a propriedade dos dados por módulo importa mais que a de código?

## Para Aprofundar

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019 — o monolito modular
  como ponto de partida.
- Fowler, Martin. *MonolithFirst*, 2015.
- Westeinde, Kirsten. *Deconstructing the Monolith: Designing Software that Maximizes
  Developer Productivity*. Shopify Engineering, 2019 — e *Under Deconstruction: The State of
  Shopify's Monolith*, 2020, com o que eles fariam diferente.
