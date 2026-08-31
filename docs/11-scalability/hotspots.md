---
id: hotspots
title: Pontos Quentes
sidebar_position: 11
description: Quando a média engana — uma partição saturada com o resto ocioso, imune a qualquer quantidade de máquinas.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor detecta desequilíbrio de distribuição e escolhe a técnica de
  dispersão adequada ao padrão de acesso.
prerequisites: [scalability]
related: [scaling-partitioning, performance-vs-scalability, database-scaling]
canonical_for: [ponto quente, chave quente, distribuição desigual, dispersão de chave]
content_version: 2
last_reviewed: 2026-08-28
---

# Pontos Quentes

## Visão Geral

Um ponto quente é uma parte do sistema que recebe carga desproporcional: uma partição,
uma chave, uma instância, um registro.

Ele é o modo de falha que **sobrevive a qualquer quantidade de capacidade**. Adicionar
nós não ajuda, porque o problema não é capacidade total — é distribuição.

E ele é difícil de ver, porque as métricas agregadas escondem: a média de utilização
parece confortável enquanto uma partição está a 100%.

## Problema

O sistema tem dez partições. Nove operam a 15% de utilização; uma está saturada.

A média é 23%. Todos os painéis mostram folga. E o sistema está indisponível para os
usuários daquela partição.

A reação natural — adicionar mais partições — não resolve: a chave quente continua
indo para uma só. Frequentemente piora, porque o rebalanceamento consome capacidade e
a distribuição continua desigual.

Isso explica a frase que aparece em muitos post-mortems: "temos dez réplicas e mesmo
assim caiu".

## Conceitos Centrais

### As origens são poucas e reconhecíveis

**Distribuição natural desigual.** Poucos clientes com volume desproporcional. É a
regra, não a exceção — em quase todo negócio, uma fração pequena dos clientes gera a
maior parte do tráfego.

**Chave de partição de baixa cardinalidade.** Particionar por estado, por tipo, por
status. O valor mais comum concentra tudo.

**Chave sequencial.** Particionar por tempo ou por identificador crescente faz toda a
escrita ir para a última partição. As demais ficam ociosas.

**Evento concentrado.** Um produto em promoção, um vídeo viral, um lote de mensagens
com a mesma chave.

**Registro de referência.** Um contador global, uma configuração lida por tudo, uma
linha de agregação atualizada por toda transação.

A terceira é a mais comum em bancos de dados, e a menos percebida: identificadores
sequenciais parecem uma escolha neutra.

### Detectar exige métrica por partição

A regra: **toda métrica de recurso particionado precisa existir por partição, não só
agregada.**

```text
agregado         utilização média 23%   → parece saudável
por partição     máximo 100%, mínimo 8% → saturado
```

E a métrica que importa é a **razão entre o máximo e a mediana**. Acima de 3, há
desequilíbrio; acima de 10, há ponto quente.

Sem isso, o diagnóstico depende de alguém suspeitar e ir olhar — o que acontece depois
do incidente.

### As técnicas de dispersão

**Sufixo aleatório na chave.** Uma chave quente vira várias — `produto:123:0` a
`produto:123:9`. A escrita dispersa; a leitura precisa consultar as dez e somar.

Funciona bem para contadores e agregações. Custa complexidade na leitura.

**Chave composta.** Combinar a dimensão desigual com outra mais uniforme. Particionar
por cliente **e** por período, em vez de só por cliente.

**Resumo criptográfico da chave.** Distribui uniformemente, e elimina a capacidade de
consultar por intervalo. Ver
[particionamento](/06-distributed-systems/partitioning.md).

**Isolamento do quente.** Os poucos clientes com volume desproporcional recebem
partição ou infraestrutura dedicada. É a solução mais simples de operar e a mais
usada em plataformas maduras.

**Cache na frente.** Para leitura, um cache absorve a chave quente antes que ela
chegue ao armazenamento. Ver [cache para escala](/11-scalability/scaling-cache.md).

**Operação relativa.** Um contador atualizado com incremento, em vez de ler-somar-
gravar, remove a contenção sem mudar a distribuição.

### O quente muda de lugar

Um ponto quente não é estático. O produto em promoção de hoje é outro amanhã; o
cliente que cresceu vira o maior.

Isso significa que uma dispersão fixa — decidida uma vez, com base na distribuição
observada — envelhece.

As soluções que sobrevivem são adaptativas: detectar a chave quente em tempo de
execução e dispersá-la sob demanda, ou rebalancear automaticamente.

### Contenção de escrita é ponto quente sem partição

O caso em que não há distribuição errada: todas as operações precisam do **mesmo
registro**.

```text
saldo de uma conta com muitas transações
contador de estoque de um produto popular
linha de agregação atualizada por toda venda
```

Aqui a dispersão não é de chave — é de modelagem. Um contador único vira contadores
parciais somados na leitura. Um saldo vira um livro de movimentações, com o saldo
derivado.

Ver [transações](/07-data-architecture/transactions.md) — é a mesma contenção,
vista pelo ângulo da escala.

## Modelo Mental

**Ponto quente é problema de distribuição, não de capacidade.** Mais máquinas não
mudam para onde a carga vai.

## Quando Usar

Atenção a pontos quentes é necessária quando:

- Há particionamento ou distribuição de qualquer tipo.
- A distribuição de uso entre clientes é desigual — quase sempre.
- Existem chaves sequenciais ou de baixa cardinalidade.
- Há registros de referência lidos ou escritos por tudo.
- Eventos concentrados são parte do negócio — promoções, lançamentos.

## Quando Não Usar

**Dispersar sem medir.** Adicionar complexidade para um desequilíbrio que não existe.

**Sufixo aleatório quando a leitura por chave é o padrão dominante.** A leitura passa
a custar N vezes.

**Resumo criptográfico quando há consulta por intervalo.** Elimina a capacidade.

**Isolar clientes grandes cedo demais.** Complexidade operacional antes de a
concentração doer.

**Adicionar capacidade** como resposta.

## Alternativas

- **Cache** — absorve leitura quente sem tocar na distribuição.
- **Isolamento por cliente** — a solução operacionalmente mais simples.
- **Modelagem sem contenção** — contadores parciais, livro de movimentações.
- **Limite de taxa por chave** — não resolve a distribuição, e impede que uma chave
  consuma toda a capacidade. Ver
  [rate limiting](/05-system-design/rate-limiting.md).

## Trade-offs

| Sufixo aleatório | Chave direta |
|---|---|
| Escrita dispersa | Concentrada |
| Leitura consulta N e agrega | Uma consulta |
| Complexidade na aplicação | Nenhuma |

| Resumo criptográfico | Chave natural |
|---|---|
| Distribuição uniforme | Desigual |
| Sem consulta por intervalo | Possível |
| Sem localidade | Preservada |

| Isolar o quente | Dispersar |
|---|---|
| Operação simples de entender | Transparente |
| Infraestrutura dedicada a manter | Compartilhada |
| Limite claro por cliente | Difuso |

## Modos de Falha

**Saturação com média confortável.**

**Rebalanceamento sem efeito.** A chave quente continua concentrando.

**Escrita toda na última partição.** Chave sequencial.

**Cache não ajudando.** A chave quente é de escrita, não de leitura.

**Dispersão envelhecida.** O quente mudou de lugar.

**Isolamento vazando.** O cliente grande foi isolado, e um recurso compartilhado
permaneceu.

**Ponto quente no cache.** Uma chave muito acessada satura um nó do cache — o mesmo
problema, uma camada acima.

## Erros Comuns

**Não ter métrica por partição.** A média entre partições esconde a que está saturada. Enquanto o painel mostra 30% de uso, uma partição está a 100% e é ela que define a experiência.

**Particionar por chave sequencial.** Identificador crescente ou carimbo de tempo concentram toda a escrita nova na última partição — o pior caso possível, e o mais fácil de criar sem perceber.

**Particionar por dimensão de baixa cardinalidade.** Estado ou categoria com poucos valores limita o número de partições úteis e garante desequilíbrio, porque os valores nunca têm volume parecido.

**Adicionar nós como resposta.** Se a carga está concentrada numa chave, mais nós recebem a parte ociosa e o nó quente continua quente. O problema é de distribuição, não de capacidade.

**Não revisar a distribuição periodicamente.** Uma chave equilibrada hoje desequilibra quando um cliente cresce ou um produto viraliza. É uma propriedade que envelhece.

**Não considerar contenção de escrita** como ponto quente. Um contador único atualizado por todos serializa as transações sem que nenhuma métrica de infraestrutura acuse saturação.

## Exemplo Real

Uma plataforma de comércio eletrônico particionava o banco de pedidos por
identificador do pedido, sequencial.

O resultado: **toda escrita ia para a última partição**. As outras quinze recebiam
apenas leituras de pedidos antigos.

O sintoma em produção: latência de criação de pedido degradando ao longo do dia,
recuperando à noite, e piorando semana a semana. A utilização média das partições era
de 12%.

A primeira reação, meses antes, tinha sido dobrar o número de partições. Não mudou
nada — a última partição continuou recebendo tudo, agora com metade dos dados
históricos.

O diagnóstico veio quando alguém adicionou métrica por partição e viu 100% em uma e
5% nas demais.

As correções foram em três frentes:

**Chave de partição composta.** Passou a ser resumo criptográfico do identificador do
cliente, mais o período. A escrita dispersou, e as consultas por cliente — que eram a
maioria — ficaram melhores, porque os pedidos de um cliente passaram a estar juntos.

A consulta por intervalo de identificador, que existia em dois relatórios, foi
reescrita para usar data.

**Contenção de estoque.** Descoberta durante a mesma investigação: a linha de estoque
de produtos populares era atualizada por toda venda, com leitura-cálculo-escrita. Em
promoções, dezenas de transações competiam pela mesma linha.

Substituída por operação relativa com verificação — `UPDATE estoque SET quantidade =
quantidade - ? WHERE id = ? AND quantidade >= ?`. A contenção caiu drasticamente, e a
anomalia de atualização perdida, que ninguém tinha notado, desapareceu junto.

**Isolamento dos grandes.** Doze clientes corporativos geravam 40% do volume. Eles
foram movidos para partições dedicadas, o que estabilizou a experiência dos demais e
permitiu dimensionar os grandes separadamente.

**Métrica por partição** com alerta na razão entre máximo e mediana acima de 4.

Resultado: a latência de criação de pedido caiu de 900 ms para 60 ms no pico, com a
**mesma quantidade de infraestrutura**.

A conclusão registrada: a duplicação de partições feita meses antes tinha custado
dinheiro e duas semanas de migração, sem nenhum efeito. Ela foi decidida a partir da
métrica agregada, que era o único número disponível.

## Conceitos Relacionados

- [Particionamento para Escala](/11-scalability/scaling-partitioning.md).
- [Desempenho versus Escalabilidade](/11-scalability/performance-vs-scalability.md).
- [Escala de Banco de Dados](/11-scalability/database-scaling.md).
- [Particionamento](/06-distributed-systems/partitioning.md) — os fundamentos.

## Exercício Prático

Para cada recurso particionado do seu sistema, calcule a razão entre a partição mais
carregada e a mediana.

Se você não conseguir calcular, essa é a lacuna — e ela é a razão de o próximo
incidente demorar para ser diagnosticado.

## Perguntas de Entrevista

- Por que adicionar capacidade não resolve um ponto quente?
- Por que chave sequencial concentra escrita, e como se resolve?
- Como contenção de escrita é um ponto quente sem particionamento?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 6.
- DeCandia, Giuseppe et al. *Dynamo: Amazon's Highly Available Key-value Store*, 2007.
- Gregg, Brendan. *Systems Performance*. 2ª ed. Addison-Wesley, 2020.
