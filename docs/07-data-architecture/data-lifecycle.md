---
id: data-lifecycle
title: Ciclo de Vida do Dado
sidebar_position: 21
description: Retenção, arquivamento e apagamento — as decisões que ninguém toma até a conta ou o regulador chegar.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor define política de retenção por conjunto de dados e projeta
  o apagamento antes de precisar dele.
prerequisites: [data-architecture]
related: [data-ownership, data-partitioning, data-lakes]
canonical_for: [ciclo de vida do dado, política de retenção, arquivamento, apagamento]
content_version: 2
last_reviewed: 2026-08-27
---

# Ciclo de Vida do Dado

## Visão Geral

Todo dado nasce, é usado com frequência decrescente, e em algum momento deveria ser
arquivado ou apagado.

Quase nenhum sistema modela isso. O padrão é guardar tudo para sempre, porque
armazenamento é barato e ninguém quer ser responsável por apagar algo que faça
falta.

O resultado aparece de três formas: custo crescendo sem controle, desempenho
degradando com o volume, e exposição regulatória sobre dados que não deveriam mais
existir.

## Problema

"Guardar tudo" não é uma decisão — é a ausência de uma.

E ela tem custos que se acumulam:

**Custo direto.** Armazenamento, cópia de segurança, replicação. Cada byte é pago
várias vezes.

**Custo de desempenho.** Tabelas maiores, índices maiores, manutenção mais lenta.

**Custo de risco.** Dado pessoal guardado além do necessário é passivo. Um
vazamento expõe o que poderia já ter sido apagado.

**Custo de operação.** Restaurações mais longas, migrações mais arriscadas.

## Conceitos Centrais

### Os estágios

```text
ativo        acesso frequente, armazenamento rápido
morno        acesso ocasional, armazenamento mais barato
frio         acesso raro, arquivamento
apagado      não existe mais
```

A transição entre eles deveria ser automática e baseada em política, não em alguém
lembrar.

A maioria dos sistemas tem apenas o primeiro estágio — e uma tabela que só cresce.

### Retenção é decisão de negócio e jurídica

O time de engenharia não decide sozinho por quanto tempo guardar dados. A pergunta
tem três respostas que precisam ser reconciliadas:

**Requisito legal mínimo.** Fiscal, trabalhista, setorial.

**Requisito legal máximo.** Proteção de dados exige não guardar dado pessoal além
do necessário para a finalidade.

**Necessidade de negócio.** Análise histórica, atendimento, auditoria.

O ponto que surpreende: existe um **máximo**, não só um mínimo. Guardar por
precaução pode violar a regulação tanto quanto apagar cedo demais.

### Apagar precisa ser projetado

Se o sistema nunca apagou nada, ele provavelmente não consegue.

Os obstáculos concretos:

**Referências.** Apagar um cliente com pedidos, notas e registros associados.

**Cópias.** O dado está no banco, na réplica, na cópia de segurança, no warehouse,
no lake, no índice de busca, nos registros de aplicação.

**Imutabilidade.** [Event sourcing](/06-distributed-systems/distributed-event-sourcing.md)
e lakes com arquivos imutáveis.

**Desempenho.** Apagar milhões de linhas de uma tabela grande é operação de horas.

O último é resolvido por [particionamento](/07-data-architecture/data-partitioning.md). Os outros três
exigem decisão de arquitetura antes, não depois.

### Anonimizar como alternativa a apagar

Quando o dado histórico tem valor analítico e o dado pessoal não pode ser mantido,
a saída é remover o que identifica e preservar o resto.

A saída só vale se for anonimização de fato, e não pseudonimização — a diferença, e
por que "removemos o nome" não basta, está em
[proteção de dados](/10-security/data-protection.md#pseudonimização-e-anonimização-não-são-a-mesma-coisa).

O que o ciclo de vida acrescenta: dado pseudonimizado continua pessoal e continua
sujeito ao máximo de retenção; só o anonimizado sai do relógio. Por isso a
anonimização é uma transição com data — executada quando o prazo do dado pessoal
vence —, e quando a análise precisa só de totais, a
agregação é a transição mais segura, porque descarta o detalhe que permitiria
reidentificar.

### Criptografia por titular resolve o caso imutável

Para dados que não podem ser apagados fisicamente — event sourcing, arquivos
imutáveis — a técnica é a
[cifragem por titular](/10-security/encryption.md#cifragem-por-titular-resolve-o-apagamento):
apagar passa a ser descartar a chave, e retroagir exige reescrever o histórico.

O que ela traz para o ciclo de vida é que a retenção se desloca do dado para a
chave. O cofre de chaves passa a ter a política mais sensível do sistema: se as
cópias de segurança dele guardam chaves por mais tempo que a retenção do titular, a
chave "descartada" volta na restauração, e o apagamento é desfeito. O descarte
intencional convive com a regra oposta da
[gestão de chaves](/10-security/key-management.md), que proíbe descartar chave
enquanto houver dado que dependa dela.

### O inventário é o pré-requisito

Nada disso é possível sem saber onde os dados estão.

Um inventário mínimo por conjunto: quais dados pessoais contém, qual a base legal,
qual a retenção definida, quem é o [dono](/07-data-architecture/data-ownership.md), quais são as cópias.

Sem isso, uma solicitação de apagamento não pode ser atendida com honestidade — o
que se responde é "apagamos onde achamos".

## Modelo Mental

**Não decidir a retenção é decidir guardar para sempre.** E "para sempre" tem custo
e risco crescentes.

## Quando Usar

Política de ciclo de vida se paga sempre que:

- Os dados crescem continuamente.
- Há dados pessoais envolvidos.
- Existe requisito regulatório.
- O custo de armazenamento é relevante.
- O desempenho degrada com o volume.
- Há dados que ninguém consulta há anos.

## Quando Não Usar

**Conjunto pequeno, de volume estável e sem dado pessoal.** Tabelas de referência e
catálogos de configuração: o custo de construir e operar transições automáticas
supera o de guardar tudo, e não há máximo legal a respeitar. Basta a decisão
registrada de guardar.

**Dado sob obrigação de preservação.** Litígio, investigação ou fiscalização em
curso congelam o apagamento daquele conjunto ou titular. O ciclo automático não se
aplica enquanto durar a obrigação — apagar nesse período é destruição de prova —, e
por isso a política precisa de um mecanismo de suspensão antes de precisar dele.

**Sistema com desligamento datado.** Se o sistema sai de operação em meses e os
dados migram com ele, a política vale para o destino. Construir estágios no sistema
que vai morrer é trabalho perdido; basta garantir que a migração não carregue o que
já deveria ter sido apagado.

## Alternativas

- **Arquivamento** — mover para armazenamento frio em vez de apagar.
- **Anonimização** — preservar valor analítico sem dado pessoal.
- **Agregação** — guardar o resumo e descartar o detalhe.
- **Criptografia por titular** — para armazenamentos imutáveis.
- **Retenção por partição** — descarte instantâneo. Ver
  [particionamento](/07-data-architecture/data-partitioning.md).

## Trade-offs

| Retenção longa | Curta |
|---|---|
| Histórico disponível | Perdido |
| Custo crescente | Controlado |
| Exposição maior | Menor |
| Desempenho degrada | Estável |
| Conformidade em risco | Facilitada |

| Arquivar | Apagar |
|---|---|
| Recuperável | Irreversível |
| Custo residual | Zero |
| Ainda é exposição | Elimina |
| Pedido de exclusão exige varrer o arquivo | Nada a varrer |

## Modos de Falha

**Crescimento sem limite.** Custo e degradação.

**Apagamento incompleto.** O dado permanece em cópias.

**Apagamento acidental de dado com retenção obrigatória.**

**Arquivo não recuperável.** Formato obsoleto, mídia falha, chave perdida.

**Anonimização reversível.**

**Solicitação de apagamento não atendível.**

**Cópia de segurança guardando o que foi apagado.** A retenção da cópia precisa
entrar na conta.

## Erros Comuns

**Não definir retenção.** O padrão vira guardar para sempre, e a primeira discussão
de prazo acontece sob pressão — na conta que dobrou ou no pedido de exclusão que não
se consegue atender.

**Definir retenção só na engenharia, sem o jurídico.** A engenharia escolhe um
número redondo, e ele fica abaixo do mínimo fiscal ou acima do máximo de proteção de
dados; o erro só aparece na fiscalização ou no pedido de exclusão.

**Apagar da origem sem inventariar as cópias.** O dado some do banco e continua no
warehouse, no índice de busca e nas cópias de segurança; a resposta ao titular diz
"apagado" e não é verdade.

**Arquivar sem testar a recuperação.** Formato obsoleto, mídia falha ou chave
perdida só se revelam no dia em que uma auditoria ou um processo pede o dado — e aí
o arquivo é dado perdido.

**Tratar remoção do nome como anonimização.** O conjunto é mantido além do prazo
como se tivesse saído do escopo, e continua reidentificável: é dado pessoal guardado
além do máximo.

**Não projetar apagamento em sistemas imutáveis.** O primeiro pedido de exclusão num
lake ou num log de eventos exige reescrever o histórico; no exemplo abaixo, retroagir
levou quatro meses.

**Apagar sem trilha de auditoria.** O apagamento foi feito, mas não há como provar
ao titular nem ao regulador o quê, quando e de onde.

**Ignorar registros de aplicação.** Eles frequentemente contêm dados pessoais e
raramente entram na política.

## Exemplo Real

Uma empresa de comércio eletrônico guardava tudo num único estágio. Sete anos de
pedidos, eventos de navegação e registros de aplicação viviam no banco transacional
e na camada bruta do lake, sem transição para morno ou frio e sem nada jamais
apagado.

O custo aparecia de forma difusa: a conta de armazenamento e de cópias de segurança
crescia junto com o volume, e a manutenção de índices da tabela de pedidos já não
cabia na janela noturna. Ninguém tratava isso como problema de política até que a
solicitação de exclusão de um único cliente levou cinco semanas para ser respondida
— e foi respondida de forma incompleta.

A resposta travou em dois pontos que só existiam porque o dado nunca tinha saído do
primeiro estágio:

**O lake.** Arquivos imutáveis, sem registro de quais continham dados daquele
cliente. Apagar exigia reescrever anos de camada bruta que ninguém consultava.

**As cópias sem política.** Registros de aplicação guardavam dados de cadastro por
um ano, e exportações em planilha, compartilhadas por analistas, eram desconhecidas
até alguém mencioná-las numa reunião.

O que foi feito depois:

**Inventário de dados pessoais** por conjunto, obrigatório na ingestão. Sem
classificação declarada, a ingestão é recusada.

**Criptografia por titular** na camada bruta do lake, permitindo apagar por
descarte de chave. Retroagir sobre o histórico existente levou quatro meses.

**Retenção definida por conjunto**, com jurídico, produto e engenharia, e transição
automática entre estágios. A discussão revelou que 60% dos dados guardados não
tinham nem requisito legal nem uso de negócio.

**Registros de aplicação** com filtro de dados pessoais na origem, e retenção
reduzida de 1 ano para 90 dias.

**Exportações** proibidas fora da plataforma governada, com alternativa que
resolvia a necessidade real dos analistas.

**Processo de apagamento** automatizado, cobrindo os sistemas próprios, com
procedimento documentado para os terceiros — e trilha de auditoria do que foi
apagado.

A leitura que a equipe faz: a solicitação era de um único cliente. O trabalho que ela
desencadeou levou seis meses, e teria sido uma fração disso se a classificação
existisse desde o início.

## Conceitos Relacionados

- [Propriedade do Dado](/07-data-architecture/data-ownership.md) — quem decide a retenção.
- [Particionamento de Dados](/07-data-architecture/data-partitioning.md) — descarte eficiente.
- [Data Lake](/07-data-architecture/data-lakes.md) — onde o problema é mais difícil.
- [Event Sourcing](/06-distributed-systems/distributed-event-sourcing.md).
- [Proteção de Dados](/10-security/data-protection.md) — pseudonimização,
  anonimização e o inventário do ponto de vista da segurança.
- [Criptografia](/10-security/encryption.md) — cifragem por titular.
- [Gestão de Chaves](/10-security/key-management.md) — por que descartar chave é
  exceção, e não regra.

## Exercício Prático

Escolha um conjunto de dados pessoais do seu sistema e liste **todos** os lugares
onde ele existe — incluindo cópias de segurança, registros de aplicação e
exportações.

Depois pergunte quanto tempo levaria para apagá-lo de todos. A resposta é a medida
da sua exposição.

## Perguntas de Entrevista

- Por que existe um máximo de retenção, e não só um mínimo?
- Como apagar dado pessoal de um armazenamento imutável?
- Por que "removemos o nome" não é anonimização?

## Para Aprofundar

- Lei Geral de Proteção de Dados (Lei 13.709/2018) — princípios de necessidade e
  de finalidade.
- Sweeney, Latanya. *Simple Demographics Often Identify People Uniquely*, 2000.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 12.
