---
id: generic-domain
title: Generic Domain
sidebar_position: 5
description: Necessário e já resolvido pelo mercado — compre, e a decisão de construir precisa de justificativa.
doc_type: foundation
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor reconhece subdomínios genéricos e avalia comprar versus
  construir com o custo total na mesa.
prerequisites: [subdomain]
related: [core-domain, supporting-domain, anti-corruption-layer]
canonical_for: [generic domain, subdomínio genérico]
content_version: 1
last_reviewed: 2026-08-26
---

# Generic Domain

## Visão Geral

Um generic domain é necessário, não diferencia a empresa, e já foi resolvido bem
pelo mercado.

Autenticação, envio de e-mail, emissão fiscal, gestão de assinaturas,
processamento de pagamento, armazenamento de arquivos.

A decisão padrão é **comprar ou adotar**. Construir precisa de justificativa
explícita, e não o contrário.

## O Problema

Times constroem generic domains com frequência, por razões que soam boas e quase
nunca resistem à análise.

*"Nosso caso é diferente."* Quase nunca é. Costuma ser 5% diferente, e esses 5%
frequentemente podem ser adaptados.

*"Fica mais barato."* Compara-se o custo de construir com o preço da licença, e
esquece-se o custo de manter, atualizar, corrigir e operar por anos.

*"Não queremos depender de terceiros."* A dependência existe de qualquer forma —
de bibliotecas, do provedor de nuvem, do sistema operacional. A questão é onde
ela é aceitável.

*"É simples."* Autenticação parece simples até que se precise de recuperação de
senha segura, proteção contra força bruta, sessão em múltiplos dispositivos,
segundo fator, e conformidade com regulação de dados.

## Conceitos Centrais

### O custo real de construir

A comparação honesta inclui o que não aparece na estimativa inicial:

| | Construir | Comprar |
|---|---|---|
| Desenvolvimento inicial | Alto | Integração |
| Manutenção por ano | Contínuo | Incluído |
| Correção de segurança | Sua responsabilidade | Do fornecedor |
| Conformidade regulatória | Sua | Frequentemente do fornecedor |
| Operação e plantão | Seu | Do fornecedor |
| Capacidade de engenharia ocupada | Permanentemente | Uma vez |
| Custo de saída | Nenhum | Migração |

A linha de segurança é decisiva em vários generic domains. Uma implementação
própria de autenticação é uma superfície de ataque que a empresa passa a ter que
defender indefinidamente.

### Isole com anti-corruption layer

Adotar solução externa traz o modelo dela para dentro. Sem isolamento, os tipos
do fornecedor se espalham e a substituição futura fica cara.

A defesa é uma [anti-corruption layer](anti-corruption-layer.md): a solução
externa fica atrás de uma interface no seu vocabulário, e o resto do sistema não
a conhece.

Isso é o que torna a decisão de comprar reversível — e a reversibilidade é o que
responde ao argumento de dependência.

### Quando construir se justifica

Existem casos legítimos, e vale nomeá-los:

Restrição regulatória que nenhum fornecedor atende — residência de dados, por
exemplo.

Escala em que o custo por transação do fornecedor supera o de construir e operar.
É um cálculo, não uma impressão, e o ponto de virada costuma estar muito acima do
que se imagina.

Requisito genuinamente incomum, verificado contra pelo menos três alternativas de
mercado.

Ausência de opção madura — o que acontece, e diminui com o tempo.

### Generic hoje, não necessariamente ontem

Muitos generic domains eram supporting há dez anos. Sistemas construídos naquela
época carregam implementações próprias que hoje poderiam ser substituídas.

Revisar isso periodicamente libera capacidade.

## Por Que Isso Importa

**Porque construir generic domain é o desperdício mais comum de capacidade de
engenharia.** E o mais fácil de evitar, uma vez classificado.

**Porque a decisão precisa inverter o ônus.** O default deve ser comprar, e
construir deve exigir justificativa — não o contrário.

**Porque a superfície de segurança importa.** Em vários generic domains,
construir é assumir risco que o fornecedor absorveria.

## Erros Comuns

**Comparar custo de construir com preço de licença.** Ignora o custo total.

**Presumir que o caso é diferente.** Verifique contra alternativas reais antes.

**Não isolar a solução adotada.** Sem anti-corruption layer, a troca fica cara e
o argumento de dependência se torna verdadeiro.

**Construir por preferência técnica.** É agradável construir; isso não é
justificativa.

**Não reavaliar implementações antigas.**

## Exemplo Real

Uma empresa de educação construiu o próprio sistema de assinaturas: planos, ciclos
de cobrança, tentativas de retentativa, upgrade e downgrade proporcional, cupons,
períodos de teste.

Dois engenheiros, quatorze meses. Depois disso, manutenção contínua — cerca de 20%
do tempo de um engenheiro, indefinidamente.

Quando o financeiro pediu suporte a cobrança anual com desconto e a faturamento
por nota fiscal com retenção de imposto, a estimativa foi de mais quatro meses.

A avaliação de alternativas de mercado, feita nesse ponto, encontrou três
produtos que faziam tudo isso e mais. O custo anual equivalia a cerca de dois
meses de um engenheiro.

A migração levou cinco meses — mais do que teria levado adotar desde o início,
porque o modelo de assinaturas estava espalhado por todo o sistema sem isolamento.

O que a equipe registrou no ADR: a decisão original de construir foi tomada em
2019, quando as opções eram de fato imaturas para o mercado brasileiro. A decisão
estava certa **naquele contexto**. O erro foi não reavaliar por cinco anos.

Isso é o padrão mais comum com generic domains: não a decisão inicial, mas a
ausência de revisão.

## O ciclo de revisão

A decisão de construir um generic domain quase nunca está errada no momento em que
é tomada. O que falha é a ausência de revisão.

Um ciclo simples que funciona, revisado uma vez por ano:

**Liste o que foi construído internamente e não diferencia a empresa.** A lista
costuma surpreender pelo tamanho.

**Para cada item, verifique se existe alternativa madura hoje.** O mercado se move;
o que não existia há três anos frequentemente existe agora.

**Estime o custo anual de manter.** Tempo de engenharia, correções, atualizações
de dependência, incidentes. Este número raramente é conhecido e costuma ser maior
que a intuição.

**Estime o custo de migrar.** Aqui o isolamento importa: se há
[anti-corruption layer](anti-corruption-layer.md), a migração é local; se não há,
é um projeto.

A quarta estimativa é o que trava a maioria das migrações — e é consequência de uma
decisão tomada anos antes de não isolar.

Isso dá um argumento adicional para o isolamento no momento da adoção: ele não
protege apenas contra o fornecedor mudar. Protege contra a própria decisão de
construir envelhecer.

## Conceitos Relacionados

- [Subdomínio](subdomain.md) — a classificação.
- [Core Domain](core-domain.md) — onde construir sempre.
- [Anti-Corruption Layer](anti-corruption-layer.md) — como isolar o que se adota.
- [Build vs. Buy](../20-trade-offs/index.md) — o trade-off em detalhe.

## Exercício Prático

Liste os subdomínios genéricos do seu sistema e, para cada um, verifique se foi
construído ou adotado.

Para os construídos, estime: quanto tempo de engenharia consomem por ano? Existe
alternativa madura hoje? Quanto custaria migrar?

## Perguntas de Entrevista

- Como avaliar construir versus comprar num generic domain?
- Que custos são esquecidos na comparação?
- Por que isolar a solução adotada muda o argumento de dependência?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003.
- Vernon, Vaughn. *Domain-Driven Design Distilled*. Addison-Wesley, 2016.
