---
id: replacing
title: Substituição
sidebar_position: 8
description: Trocar por um produto de mercado — e a fronteira do fornecedor que vem junto.
doc_type: concept
level: 6
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia substituição por diferenciação e por ajuste de fronteira,
  e evita a customização que anula o benefício.
prerequisites: [migration-strategies]
related: [migration-strategies, rebuilding, saas]
canonical_for: [substituição por produto, lacuna funcional, customização excessiva]
content_version: 1
last_reviewed: 2026-08-28
---

# Substituição

## Visão Geral

Substituir é trocar o sistema próprio por um produto de mercado.

O critério que decide é o mesmo de construir ou comprar: **isto nos diferencia?** Ver
[SaaS](/09-cloud-architecture/saas.md) e
[capacidades de negócio](/15-enterprise-architecture/business-capabilities.md).

E o risco característico não é a decisão — é a execução: a customização que se acumula
até o produto custar mais que o sistema que ele substituiu.

## Problema

O produto de mercado nunca faz exatamente o que o sistema atual faz.

```text
faz mais    funcionalidades que a organização já tem em outro lugar
faz menos   partes do processo ficam de fora
faz diferente o fluxo é outro, o modelo é outro
```

Cada diferença gera uma decisão: adaptar o processo ao produto, ou adaptar o produto ao
processo.

A segunda parece razoável caso a caso, e acumulada produz um produto customizado que não
pode ser atualizado, com custo de manutenção equivalente ao de um sistema próprio — sem
o controle.

## Conceitos Centrais

### Adaptar o processo é quase sempre melhor

A regra que evita a armadilha:

```text
o processo se adapta ao produto, salvo quando o processo é o diferencial
```

Um produto maduro incorpora práticas de muitas organizações. Frequentemente o processo
atual não é melhor — é apenas o que existe, resultado de limitações do sistema antigo.

E o custo de customizar é permanente: cada customização precisa ser mantida em cada
atualização, e o fornecedor não a considera nas mudanças dele.

A exceção legítima: onde o processo é fonte de vantagem. Aí a customização é
investimento, não dívida — e vale considerar se aquela parte deveria ser substituída.

### A avaliação da lacuna precede a decisão

Antes de escolher, mapear o que o produto **não** faz:

```text
funcionalidade ausente     precisa ser construída em volta, ou o processo muda
modelo diferente           os dados precisam ser transformados
integrações                o produto se conecta ao que a organização tem?
regras específicas          exceções que o produto não expressa
volume e escala             o produto suporta o volume real?
```

O item de regras específicas é o que mais frequentemente inviabiliza: sistemas antigos
acumulam exceções que nenhum produto genérico prevê. Ver
[sistemas legados](/16-legacy-modernization/legacy-systems.md).

E a avaliação precisa acontecer com dados reais, não com demonstração — que é sempre
feita com o caso feliz.

### A fronteira do fornecedor entra na organização

Um produto tem a fronteira que o fornecedor escolheu. Ver
[arquitetura de aplicação](/15-enterprise-architecture/application-architecture.md).

Se ela não coincide com o domínio da organização:

```text
produto faz mais    duplicação com sistemas existentes — decidir qual é a fonte
produto faz menos   uma parte do domínio fica fora, construída em volta
```

A primeira exige decisão de propriedade de dados. Ver
[propriedade do dado](/07-data-architecture/data-ownership.md).

E a proteção contra o modelo do fornecedor entrar no resto do sistema é a camada de
tradução. Ver
[anti-corruption layer](/08-integration-architecture/integration-anti-corruption.md).

### O custo total inclui mais que a licença

```text
licença                   o número visível
implantação e configuração meses de trabalho
integração                 com os sistemas que permanecem
migração de dados          ver migração de dados
treinamento                das pessoas que usam
customização               construção e manutenção permanente
atualização                cada versão nova exige verificação
saída                       se um dia for preciso
```

O último item merece avaliação antes de assinar: como os dados saem, em qual formato,
com qual completude. Ver
[dependência de fornecedor](/09-cloud-architecture/vendor-lock-in.md).

### Substituir capacidade diferenciadora elimina a diferenciação

Se o sistema sustenta algo que distingue a organização, substituí-lo por um produto que
os concorrentes também usam entrega essa vantagem.

Isso parece óbvio e é violado com frequência, porque o produto resolve o problema
imediato e a diferenciação é abstrata.

O teste: **os clientes escolhem a organização por causa disto?** Se sim, construir.

### O antigo precisa ser desligado

Como em qualquer migração, a coexistência tende a permanecer. Ver
[strangler fig](/16-legacy-modernization/strangler-fig.md).

O caso específico da substituição: o sistema antigo frequentemente permanece "para
consulta do histórico", indefinidamente — com custo de licença, infraestrutura e
segurança.

A decisão sobre histórico precisa ser explícita: migrar, arquivar em formato acessível,
ou manter o antigo com data de desligamento. Ver
[migração de dados](/16-legacy-modernization/data-migration.md).

## Modelo Mental

**Adapte o processo ao produto, salvo onde o processo é o diferencial.** A customização
acumulada anula o benefício de comprar.

## Quando Usar

- A capacidade não é diferenciadora.
- Existe produto maduro que cobre a maior parte do processo.
- O custo de construir e manter supera o de comprar.
- A conformidade que o produto já atende tem valor.
- O time é pequeno para manter o sistema próprio.

## Quando Não Usar

**Para capacidade diferenciadora.**

**Com customização extensa.** Ela anula o benefício.

**Sem avaliar a lacuna com dados reais.**

**Sem verificar como os dados saem.**

**Sem decidir sobre o histórico.**

**Sem camada de tradução**, deixando o modelo do fornecedor entrar.

## Alternativas

- **[Reconstrução](/16-legacy-modernization/rebuilding.md)** — quando a capacidade diferencia.
- **Produto com extensão** — um produto que oferece pontos de extensão suportados, em vez
  de customização.
- **Substituição parcial** — comprar a parte comum, manter o diferencial.
- **[Refatoração](/16-legacy-modernization/legacy-refactoring.md)** — quando o sistema atende e o problema é
  interno.

A terceira é frequentemente a melhor: comprar o que é comum e construir o que distingue,
com fronteira clara entre os dois.

## Trade-offs

| Substituir | Construir |
|---|---|
| Disponível em meses | Anos |
| Sem manutenção do núcleo | Contínua |
| Fronteira do fornecedor | Própria |
| Funcionalidade além do necessário | Exata |
| Sem diferenciação | Possível |
| Custo previsível | De engenharia |

| Adaptar processo | Customizar produto |
|---|---|
| Atualização simples | Verificação a cada versão |
| Mudança organizacional | Nenhuma |
| Custo único | Permanente |

## Modos de Falha

**Customização acumulada.** O produto vira sistema próprio, sem controle.

**Lacuna descoberta tarde.** Avaliada em demonstração, não com dados reais.

**Diferenciação perdida.**

**Duplicação com sistemas existentes.** A fronteira do produto sobrepõe.

**Modelo do fornecedor no domínio.**

**Antigo nunca desligado.** Custo dobrado permanente.

**Saída inviável.** Os dados não saem em formato utilizável.

## Erros Comuns

**Avaliar em demonstração.**

**Customizar em vez de adaptar o processo.**

**Não verificar a saída de dados antes de assinar.**

**Substituir capacidade diferenciadora.**

**Não isolar com camada de tradução.**

**Não decidir sobre o histórico.**

## Exemplo Real

Uma empresa de serviços substituiu o sistema próprio de gestão de chamados — 9 anos —
por um produto de mercado.

A capacidade não diferenciava: os clientes escolhiam a empresa pelo serviço prestado, não
pela ferramenta de chamados.

A avaliação foi feita com dados reais, não com demonstração: 40 mil chamados históricos
carregados no ambiente de teste do produto, com os fluxos reais exercitados.

Isso revelou três lacunas antes da decisão:

**Aprovação em duas etapas** para chamados acima de um valor — o produto suportava uma
etapa. Adaptado: o processo passou a usar uma etapa com regra de escalonamento
automático, que o produto oferecia.

**Integração com o sistema de faturamento** — não existia conector. Construída, com 3
semanas de trabalho.

**Relatório regulatório** com formato específico — o produto não gerava. Resolvido por
exportação e transformação externa, sem customizar o produto.

E uma decisão importante: uma proposta de customizar o produto para reproduzir o fluxo de
aprovação antigo foi recusada. A análise mostrou que o fluxo de duas etapas era resultado
de uma limitação do sistema antigo, não uma necessidade de negócio.

Dois anos depois:

**Zero customizações.** Três atualizações do produto aplicadas sem trabalho de
adaptação.

**Custo total** cerca de 45% do que a manutenção do sistema próprio consumia.

**Uma frustração recorrente.** O produto não permite um tipo de relatório que a operação
gostaria de ter. A decisão registrada foi conviver — o custo de customizar não se
justificava.

**Sistema antigo desligado** no mês 14, com o histórico migrado para o produto e os dados
anteriores a 2019 arquivados em formato aberto.

O ponto que a equipe sublinha: a decisão de não customizar foi contestada três vezes no primeiro
ano, sempre com um caso razoável. Manter a disciplina é o que preservou a capacidade de
atualizar — e, na terceira contestação, a funcionalidade pedida chegou numa versão nova
do produto.

## Conceitos Relacionados

- [Estratégias de Migração](/16-legacy-modernization/migration-strategies.md).
- [SaaS](/09-cloud-architecture/saas.md) — construir ou comprar.
- [Anti-Corruption Layer](/08-integration-architecture/integration-anti-corruption.md).
- [Migração de Dados](/16-legacy-modernization/data-migration.md).

## Exercício Prático

Para um sistema candidato a substituição, liste as funcionalidades que ele tem e que
existem por limitação do sistema, não por necessidade de negócio.

Elas são as que não precisam ser reproduzidas — e costumam ser mais do que se espera.

## Perguntas de Entrevista

- Por que adaptar o processo é quase sempre melhor que customizar?
- Por que avaliar em demonstração é insuficiente?
- Que risco a fronteira do fornecedor traz?

## Para Aprofundar

- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
- Moore, Geoffrey. *Dealing with Darwin*. Portfolio, 2005.
- Fowler, Martin. *Utility vs Strategic Dichotomy*, 2007.
