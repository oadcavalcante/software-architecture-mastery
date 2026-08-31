---
id: diagram-quality
title: Qualidade de Diagrama
sidebar_position: 13
description: O que separa um diagrama que comunica de um que polui — e a legenda que quase nunca existe.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor produz diagramas legíveis por quem não os desenhou, com notação
  explícita e escopo definido.
prerequisites: [documentation-principles]
related: [c4-model, documentation-principles, living-documentation]
canonical_for: [qualidade de diagrama, legenda, notação consistente, ruído visual]
content_version: 1
last_reviewed: 2026-08-29
---

# Qualidade de Diagrama

## Visão Geral

Um diagrama existe para comunicar. Ele falha quando exige que alguém explique.

O teste é direto: **entregue o diagrama a alguém que não participou de desenhá-lo, sem
dizer nada, e observe.** As perguntas que essa pessoa faz são os defeitos do diagrama.

A maior parte deles é evitável, e as causas são poucas: falta de legenda, notação
inconsistente, escopo indefinido, e ruído.

## Problema

Diagramas de arquitetura costumam ser produzidos para uma apresentação, com alguém
narrando. Nesse contexto, eles funcionam — a narração preenche as lacunas.

Depois, eles ficam. E são lidos sem narração, por pessoas que não estavam na
apresentação.

```text
o que essa cor significa?
por que essa caixa é diferente?
essa seta é chamada ou fluxo de dados?
o que é uma linha tracejada?
esse retângulo é um sistema ou um servidor?
```

Cada pergunta dessas é informação que existia na cabeça de quem desenhou e não foi para o
papel.

## Conceitos Centrais

### Legenda não é opcional

A regra mais simples e a mais violada: **toda distinção visual precisa estar na legenda**.

```text
cores diferentes    o que cada uma significa
formas diferentes   idem
linhas sólidas e tracejadas  a diferença
espessuras          se houver, o que indicam
```

E o inverso: se uma distinção não está na legenda, ela não deveria existir no diagrama.
Uma caixa com cor diferente "porque ficou melhor" é ruído que o leitor tenta interpretar.

A legenda custa alguns minutos e resolve a maior parte das perguntas.

### Notação consistente entre diagramas

Se um retângulo azul é um serviço num diagrama e um banco em outro, o leitor precisa
reaprender a cada documento.

```text
mesma notação em toda a organização
poucos elementos — três ou quatro formas bastam
significado estável
```

Ver [modelo C4](/17-architecture-documentation/c4-model.md) — ele não prescreve notação, e prescreve consistência
semântica.

Um conjunto pequeno de convenções, documentado uma vez e reusado, é o que torna diagramas
comparáveis.

### Rótulos em setas, sempre

Uma seta sem rótulo comunica que existe uma relação e nada sobre ela.

```text
ruim   A → B
bom    A → B: "consulta saldo"
melhor A → B: "consulta saldo antes de autorizar, HTTPS síncrono"
```

E o rótulo precisa dizer **o quê**, não apenas o mecanismo. "HTTP" não informa; "consulta
saldo, HTTP" informa.

Setas bidirecionais merecem atenção: elas frequentemente escondem duas relações
diferentes, que valem ser separadas.

### Escopo e data visíveis

```text
título        o que este diagrama mostra
escopo        qual sistema, qual nível de abstração
data          quando foi atualizado
versão        se aplicável
autor ou dono quem responde por ele
```

A data é a que mais importa: um diagrama sem data é confiável indefinidamente, o que é
exatamente o problema. Ver
[princípios de documentação](/17-architecture-documentation/documentation-principles.md).

### Menos elementos

```text
alvo         até 12 caixas por diagrama
acima de 20  o leitor não consegue segurar o conjunto
```

Um diagrama com 40 caixas não comunica — ele arquiva.

Quando o sistema é grande, a saída é **decompor em vários diagramas**, cada um com um
recorte e um propósito, e não espremer tudo num só.

E há uma verificação útil: se você precisa ampliar para ler os rótulos, há elementos
demais.

### Layout comunica

A disposição espacial transmite significado, queira você ou não:

```text
fluxo da esquerda para a direita, ou de cima para baixo
elementos relacionados próximos
sem linhas cruzando desnecessariamente
alinhamento consistente
```

Linhas que se cruzam são o defeito visual mais comum, e frequentemente indicam que a
disposição não foi pensada — ou que há elementos demais.

Ferramentas de geração automática produzem layouts razoáveis e nem sempre bons. Ver
[documentação viva](/17-architecture-documentation/living-documentation.md) — o trade-off entre layout controlado e
diagrama derivado é real.

### O que não colocar

```text
detalhe que envelhece rápido        versões, nomes de instância
tudo que existe                     só o que serve à pergunta
elementos decorativos               ícones que não significam nada
sobreposição de níveis              ver modelo C4
```

O terceiro merece nota: ícones de tecnologia — o logotipo do banco, da nuvem, da
linguagem — são atraentes e frequentemente redundantes com o rótulo. Eles ocupam espaço e
não acrescentam.

### O teste do leitor ausente

Existe uma verificação barata que resume todas as anteriores: **releia o diagrama
imaginando que quem o desenhou não está disponível para perguntas.**

```text
os elementos têm nomes que dizem o que são?
as setas dizem o que trafega?
a legenda explica cada distinção?
o título diz qual é o escopo?
a data diz se ainda vale?
```

Se alguma resposta for não, a informação faltante está viva apenas na cabeça de uma pessoa
— o que é precisamente a condição que a documentação existe para eliminar. Um diagrama que
só funciona com seu autor presente não é documentação; é material de apoio para uma
apresentação.

## Modelo Mental

**Se precisa de narração, o diagrama está incompleto.** A legenda e os rótulos são o que
o tornam autônomo.

## Quando Usar

Estas práticas se aplicam a qualquer diagrama destinado a ser lido depois. Prioridade
quando:

- O diagrama será consultado sem quem o desenhou.
- Ele documenta um sistema, não uma conversa.
- Ele será mantido ao longo do tempo.

## Quando Não Usar

**Sem legenda**, quando há mais de uma forma ou cor.

**Com notação diferente** a cada documento.

**Com setas sem rótulo.**

**Sem data.**

**Com mais de vinte caixas.**

**Com detalhe que envelhece rápido.**

E há uma exceção legítima: um esboço descartável, feito para uma conversa, não precisa de
nada disso. Ele cumpre a função e é apagado.

## Alternativas

- **Descrição textual** — para relações simples, um parágrafo pode ser mais claro.
- **Tabela** — para relações muitas-para-muitas, uma matriz comunica melhor que um
  diagrama com linhas cruzadas.
- **Vários diagramas menores** — em vez de um grande.
- **Diagrama gerado** — consistência automática, com menos controle de layout.

A segunda é subestimada: uma matriz de quem chama quem é mais legível que um diagrama com
trinta setas.

## Trade-offs

| Poucos elementos | Muitos |
|---|---|
| Legível | Completo |
| Vários diagramas | Um só |
| Recorte por propósito | Visão global |

| Desenhado à mão | Gerado |
|---|---|
| Layout controlado | Automático |
| Envelhece | Sempre atual |
| Expressa ênfase | Uniforme |

## Modos de Falha

**Sem legenda.** Cada leitor interpreta.

**Notação inconsistente.** Reaprendizado a cada documento.

**Setas mudas.** Relação sem significado.

**Elementos demais.** Arquiva em vez de comunicar.

**Sem data.** Confiável indefinidamente.

**Linhas cruzadas.** Difícil de seguir.

**Decoração sem significado.** Ruído que o leitor tenta interpretar.

## Erros Comuns

**Não fazer legenda.**

**Usar cor sem significado declarado.**

**Setas sem rótulo.**

**Espremer o sistema inteiro num diagrama.**

**Não datar.**

**Testar o diagrama apenas com quem já conhece o sistema.**

## Exemplo Real

Uma empresa de tecnologia fez um exercício simples: pegou os doze diagramas de
arquitetura mais usados e pediu a pessoas de outros times que os lessem, sem explicação,
anotando as dúvidas.

O resultado, agregado:

```text
"o que essa cor significa?"              9 dos 12 diagramas
"essa seta é chamada ou dado?"           11
"isso é um serviço ou um servidor?"      7
"quando isso foi atualizado?"            12
"isso ainda existe?"                     5
```

Nenhum dos doze tinha legenda. Nenhum tinha data.

E dois deles descreviam sistemas que tinham sido substituídos — o que só foi descoberto
porque alguém de fora perguntou.

As correções foram simples e o efeito foi grande:

**Convenção de notação única**, documentada em uma página: quatro formas, três cores, duas
espessuras de linha, cada uma com significado fixo.

**Legenda obrigatória** em todo diagrama, gerada automaticamente a partir da convenção.

**Cabeçalho padrão** com título, escopo, data e dono.

**Rótulos em todas as setas**, com o propósito antes do protocolo.

**Diagramas gerados a partir de texto**, versionados no repositório — o que resolveu a
data e a existência: um diagrama de sistema desativado desaparece quando o repositório é
arquivado. Ver
[documentação viva](/17-architecture-documentation/living-documentation.md).

**Teste de leitura** incorporado à revisão: um diagrama novo é lido por alguém de fora
antes de ser publicado.

Seis meses depois, o mesmo exercício foi repetido com diagramas novos. A média de dúvidas
por diagrama caiu de 4,3 para 0,6.

O que a equipe registra: a mudança de maior impacto foi a mais simples — exigir legenda.
Ela resolveu sozinha a maior parte das dúvidas, e custou uma linha na lista de verificação
de revisão.

## Conceitos Relacionados

- [Princípios de Documentação](/17-architecture-documentation/documentation-principles.md).
- [Modelo C4](/17-architecture-documentation/c4-model.md) — a consistência semântica.
- [Documentação Viva](/17-architecture-documentation/living-documentation.md) — diagramas gerados.
- [Padrões de Documentação](/17-architecture-documentation/documentation-standards.md).

## Exercício Prático

Pegue um diagrama do seu time e entregue a alguém de outro time, sem dizer nada.

Anote as perguntas. Cada uma é uma informação que estava na sua cabeça e não no diagrama.

## Perguntas de Entrevista

- Por que toda distinção visual precisa estar na legenda?
- Por que setas sem rótulo comunicam pouco?
- Quando uma tabela é melhor que um diagrama?

## Para Aprofundar

- Tufte, Edward. *The Visual Display of Quantitative Information*. 2ª ed., 2001.
- Brown, Simon. *Software Architecture for Developers*. Leanpub, 2015.
- Moody, Daniel. *The Physics of Notations*. IEEE TSE, 2009.
