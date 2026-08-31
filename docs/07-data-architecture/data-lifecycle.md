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
content_version: 1
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

O time de engenharia não pode definir por quanto tempo guardar dados. A pergunta
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

Duas armadilhas:

**Anonimização insuficiente.** Um conjunto sem nome mas com CEP, data de nascimento
e sexo frequentemente reidentifica indivíduos.

**Anonimização quebrada por cruzamento.** Dois conjuntos anonimizados
separadamente podem reidentificar quando combinados.

Anonimizar é mais difícil do que parece, e "removemos o nome" não é anonimização.

### Criptografia por titular resolve o caso imutável

Para dados que não podem ser apagados fisicamente — event sourcing, arquivos
imutáveis — a técnica é guardar os dados pessoais cifrados com uma chave por
titular.

Apagar passa a ser descartar a chave. O registro permanece, e o conteúdo pessoal
fica irrecuperável.

Precisa ser projetado desde o início. Retroagir exige reescrever o histórico.

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

**Apagar dados com requisito legal de retenção.** O mínimo legal vem primeiro.

**Apagar sem inventariar as cópias.** Apagar da origem e manter no warehouse não
cumpre nada.

**Arquivar sem testar a recuperação.** Arquivo irrecuperável é dado perdido.

**Anonimização ingênua.** Remover o nome não basta.

**Retenção definida só pela engenharia.**

**Apagamento sem trilha de auditoria.** É preciso provar que foi feito.

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
| Recuperação lenta | — |

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

**Não definir retenção.**

**Definir sem consultar o jurídico.**

**Não inventariar as cópias.**

**Não testar recuperação de arquivo.**

**Não projetar apagamento em sistemas imutáveis.**

**Ignorar registros de aplicação.** Eles frequentemente contêm dados pessoais e
raramente entram na política.

## Exemplo Real

Uma empresa de comércio eletrônico recebeu uma solicitação de exclusão de dados
pessoais de um cliente.

A resposta levou cinco semanas e foi incompleta.

O inventário feito às pressas encontrou o dado pessoal em onze lugares:

```text
banco transacional          esperado
réplicas                    consequência da replicação
cópias de segurança         retenção de 90 dias
warehouse                   dimensão de cliente
data lake                   camada bruta, arquivos imutáveis
índice de busca             perfil indexado
cache                       sessões
registros de aplicação      retenção de 1 ano, com dados de cadastro
sistema de atendimento      terceiro
plataforma de e-mail        terceiro
exportações em planilha     compartilhadas por analistas
```

Os três últimos não estavam sob controle direto. As exportações eram
desconhecidas até alguém mencioná-las numa reunião.

O lake era o problema mais difícil: arquivos imutáveis, sem inventário de quais
continham dados daquele cliente.

O que foi feito depois:

**Inventário de dados pessoais** por conjunto, obrigatório na ingestão. Sem
classificação declarada, a ingestão é recusada.

**Criptografia por titular** na camada bruta do lake, permitindo apagar por
descarte de chave. Retroagir sobre o histórico existente levou quatro meses.

**Retenção definida por conjunto**, com jurídico, produto e engenharia. A discussão
revelou que 60% dos dados guardados não tinham nem requisito legal nem uso de
negócio.

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
