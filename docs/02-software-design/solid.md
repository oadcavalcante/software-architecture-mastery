---
id: solid
title: SOLID
sidebar_position: 1
description: Cinco princípios de design orientado a objetos — o que cada um resolve e a faixa em que se aplica.
doc_type: concept
level: 2
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor aplica cada princípio SOLID a partir do problema que ele
  resolve, e reconhece os casos em que segui-lo piora o código.
prerequisites: [fundamentals]
related: [dependency-inversion, interfaces, encapsulation]
canonical_for: [SOLID, princípio da responsabilidade única, princípio aberto-fechado, substituição de Liskov, segregação de interface]
content_version: 1
last_reviewed: 2026-08-26
---

# SOLID

## Visão Geral

SOLID é um acrônimo para cinco princípios de design orientado a objetos,
reunidos por Robert Martin a partir de trabalhos anteriores.

O valor deles é real e menor do que a reputação sugere. São heurísticas com faixa
de aplicação — não leis. Aplicados por reflexo, produzem código com mais
indireção e não menos acoplamento.

## Problema

Código orientado a objetos degrada de formas previsíveis: classes que acumulam
responsabilidades, hierarquias em que a subclasse quebra o contrato da
superclasse, interfaces largas que forçam implementações vazias, e módulos de
alto nível amarrados a detalhes de baixo nível.

Cada princípio SOLID nomeia uma dessas degradações e propõe uma direção. Essa é a
forma útil de lê-los: **cinco diagnósticos, não cinco regras.**

O problema com o ensino usual é que os princípios chegam como mandamentos, sem o
sintoma que os motiva. O resultado é aplicação preventiva — interfaces criadas
para satisfazer o D, classes fragmentadas para satisfazer o S — em código que não
tinha nenhum dos sintomas.

## Conceitos Centrais

### S — Responsabilidade Única

> Uma classe deve ter uma, e apenas uma, razão para mudar.

A formulação correta é sobre **razão de mudança**, não sobre "fazer uma coisa
só". A leitura errada leva a fragmentar código sem critério; a correta remete
diretamente a
[separação de responsabilidades](../01-fundamentals/separation-of-concerns.md).

Martin refinou depois: a razão de mudança é um *ator* — quem pede a mudança. Uma
classe que muda por pedido do time fiscal e do time de relatórios tem dois atores
e deveria ser duas.

**Sintoma:** a classe aparece em commits de times diferentes, por motivos que não
se relacionam.

### O — Aberto-Fechado

> Aberto para extensão, fechado para modificação.

Deve ser possível adicionar comportamento sem alterar o código existente.

**Sintoma:** cada novo caso exige mais um ramo num `switch` que já tem doze, e o
`switch` está replicado em quatro lugares.

A ressalva que quase nunca é dita: aplicar o princípio exige adivinhar **qual eixo
vai variar**. Adivinhar errado produz uma abstração que precisa ser desmontada
para acomodar a variação real. Por isso ele funciona melhor aplicado depois que
a variação apareceu duas ou três vezes.

### L — Substituição de Liskov

> Subtipos devem ser substituíveis por seus tipos base sem quebrar o programa.

É o único dos cinco que é um teorema, não uma heurística: uma subclasse que
fortalece a pré-condição ou enfraquece a pós-condição quebra código que funcionava.

**Sintoma:** `if (x instanceof Y)` espalhado, ou uma subclasse que lança exceção
num método que a superclasse promete implementar.

O exemplo clássico — `Quadrado` herdando de `Retângulo` — é útil porque mostra
que a violação pode ser invisível no compilador e óbvia no comportamento.

### I — Segregação de Interface

> Nenhum cliente deve ser forçado a depender de métodos que não usa.

Interfaces largas acoplam implementadores a comportamento irrelevante.

**Sintoma:** implementações com métodos que lançam `UnsupportedOperation`.

### D — Inversão de Dependência

> Módulos de alto nível não devem depender de módulos de baixo nível; ambos devem
> depender de abstrações.

É o mais arquitetural dos cinco e o assunto de
[inversão de dependência](dependency-inversion.md), onde o detalhe que mais se
erra — de que lado a interface mora — é tratado.

**Sintoma:** a regra de negócio importa o driver do banco.

## Modelo Mental

**Cada princípio é o nome de um sintoma.** Diante de código, procure o sintoma
antes do princípio. Se o sintoma não está lá, o princípio não se aplica.

## Quando Usar

- Quando o sintoma correspondente está presente e é observável.
- Quando a variação que o princípio absorveria já ocorreu duas ou três vezes.
- Em código de vida longa, que muda com frequência.
- Quando o custo da indireção é menor que o custo da mudança recorrente.

## Quando Não Usar

**Preventivamente, sem sintoma.** É o erro dominante. Aplicar o O sem saber qual
eixo varia produz a abstração errada; aplicar o D onde há uma implementação
produz um arquivo a mais.

**Em código descartável ou estável.** Protótipos, scripts, e módulos que não mudam
há dois anos. O princípio é investimento em mudança futura.

**Quando o S fragmenta o que muda junto.** Duas classes que sempre aparecem no
mesmo commit têm uma razão de mudança, não duas. Separá-las é violação da própria
ideia.

**Quando o resultado piora a legibilidade sem reduzir custo de mudança.** Se
seguir um fluxo passa a exigir nove arquivos e nenhuma mudança ficou mais barata,
os princípios foram aplicados contra o objetivo deles.

**Fora de orientação a objetos, sem tradução.** Em código funcional, vários dos
princípios não têm aplicação direta — o problema que resolvem já não existe da
mesma forma.

## Alternativas

- **As quatro regras de design simples** (Beck) — passa nos testes, revela
  intenção, sem duplicação, mínimo de elementos. Mais enxutas e menos sujeitas a
  aplicação mecânica.
- **Heurísticas de acoplamento e coesão** — mais fundamentais; SOLID pode ser
  lido como cinco corolários delas.
- **Design orientado a dados** — em contextos de desempenho, os princípios de
  OO frequentemente são o problema.

## Trade-offs

O eixo é **flexibilidade a mudanças previstas versus simplicidade imediata**.

| Aplicar | Não aplicar |
|---|---|
| Mudança no eixo previsto é barata | Mudança exige alterar código existente |
| Partes testáveis isoladamente | Teste carrega mais contexto |
| Mais tipos, mais indireção | Fluxo direto e legível |
| Custo pago agora | Custo pago se a mudança vier |
| Risco de prever o eixo errado | Sem abstração errada para desfazer |

## Modos de Falha

**Fragmentação por S mal lido.** Dezenas de classes de um método, que sempre
mudam juntas.

**Abstração no eixo errado por O.** A variação real não é a prevista; cada novo
caso torce a abstração.

**Violação de L silenciosa.** Compila, passa nos testes de unidade, quebra em
produção quando o subtipo chega por um caminho não previsto.

**Interface de um por D.** Ver [abstração](../01-fundamentals/abstraction.md).

## Erros Comuns

**Ler S como "faça uma coisa só".** A formulação é sobre razão de mudança.

**Tratar os cinco como um pacote obrigatório.** São independentes, com faixas de
aplicação diferentes. D é arquitetural; I é local.

**Aplicar antes do sintoma.** O erro que engloba todos os outros.

**Usar SOLID como argumento de autoridade em revisão.** "Isso viola o SRP" não é
um argumento até que se aponte qual mudança fica mais cara por causa disso.

**Achar que SOLID resolve arquitetura.** São princípios de design de classes.
Um sistema pode ser SOLID em cada arquivo e ter arquitetura ruim.

## Exemplo Real

Uma classe `RelatorioFinanceiro` com 400 linhas, que buscava dados, aplicava
regra fiscal, formatava em PDF e enviava por e-mail.

Aplicação mecânica de S produziria quatro classes. O que a análise por **ator**
produziu foi diferente: buscar dados e aplicar regra fiscal mudavam sempre juntos,
pedidos pelo mesmo time e pela mesma razão regulatória. Formatação mudava por
pedido de design. Envio, por mudança de provedor.

Três classes, não quatro. E a mais valiosa foi a de formatação, que passou a ser
alterável sem risco de tocar cálculo fiscal — o que importava porque quem alterava
formatação não conhecia a regra fiscal.

O contraste: no mesmo sistema, uma tentativa anterior tinha aplicado O criando
uma hierarquia de `EstrategiaDeCalculo` para "suportar novos tipos de relatório".
Em três anos, nenhum tipo novo apareceu. A hierarquia tinha uma implementação e
foi removida.

## Conceitos Relacionados

- [Separação de Responsabilidades](../01-fundamentals/separation-of-concerns.md)
  — o princípio do qual S é um caso.
- [Inversão de Dependência](dependency-inversion.md) — o D, em detalhe.
- [Interfaces](interfaces.md) — o I, em detalhe.
- [Heurísticas de Design](design-heuristics.md) — alternativas mais enxutas.

## Exercício Prático

Escolha a maior classe do seu sistema. Para cada método, identifique **quem pede
mudanças nele** — qual time, qual papel.

Agrupe por ator. Os grupos são as classes que deveriam existir.

Compare com a divisão que você faria aplicando "faça uma coisa só". Onde as duas
divergem, a divisão por ator costuma estar certa.

## Perguntas de Entrevista

- Qual a formulação correta do Princípio da Responsabilidade Única?
- Por que o Aberto-Fechado é difícil de aplicar antecipadamente?
- Dê um exemplo de violação de Liskov que o compilador não detecta.

## Para Aprofundar

- Martin, Robert C. *Clean Architecture*. Prentice Hall, 2017 — os cinco
  princípios com a formulação revisada de SRP por ator.
- Liskov, Barbara; Wing, Jeannette. *A Behavioral Notion of Subtyping*. TOPLAS,
  1994 — o resultado formal por trás do L.
- Meyer, Bertrand. *Object-Oriented Software Construction*, 1988 — origem do
  Aberto-Fechado.
