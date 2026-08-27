---
id: transactions
title: Transações
sidebar_position: 19
description: ACID e níveis de isolamento — o que cada nível permite acontecer, e por que o padrão surpreende.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe nível de isolamento sabendo qual anomalia cada um
  admite, em vez de aceitar o padrão do banco.
prerequisites: [relational-databases]
related: [data-consistency, oltp, indexing]
canonical_for: [transação, ACID, nível de isolamento, leitura suja, leitura não repetível, leitura fantasma]
content_version: 1
last_reviewed: 2026-08-27
---

# Transações

## Visão Geral

Uma transação agrupa operações de forma que todas aconteçam ou nenhuma aconteça, e
que operações concorrentes não interfiram umas nas outras de formas indesejadas.

A parte da atomicidade é bem compreendida. A parte do **isolamento** não é — e é
onde estão os defeitos difíceis: aqueles que passam em todos os testes e aparecem
só sob concorrência real.

Este documento é sobre a segunda parte.

## Problema

Quase todo desenvolvedor sabe que uma transação garante "tudo ou nada".

Quase nenhum sabe qual nível de isolamento o seu banco usa por padrão, nem quais
anomalias esse nível permite.

O resultado: código escrito assumindo isolamento total, rodando num nível que
admite várias interferências. Os defeitos daí são intermitentes, dependentes de
carga e quase impossíveis de reproduzir.

## Conceitos Centrais

### ACID, com a letra que importa

**Atomicidade.** Tudo ou nada.

**Consistência.** As restrições declaradas continuam válidas. É a letra menos
interessante — depende do que você declarou.

**Isolamento.** Transações concorrentes não interferem. É a letra que causa
problemas.

**Durabilidade.** O que foi confirmado sobrevive a falha.

### As anomalias, em ordem de gravidade

**Leitura suja.** Ler dado de uma transação que ainda não confirmou — e que pode
ser desfeita.

**Leitura não repetível.** Ler o mesmo registro duas vezes na mesma transação e
obter valores diferentes, porque outra transação alterou entre as leituras.

**Leitura fantasma.** Executar a mesma consulta duas vezes e obter conjuntos
diferentes de linhas, porque outra transação inseriu registros que satisfazem o
filtro.

**Atualização perdida.** Duas transações leem o mesmo valor, calculam a partir
dele e escrevem. A segunda sobrescreve o efeito da primeira.

**Distorção de escrita.** Duas transações leem o mesmo conjunto, cada uma verifica
uma condição, e ambas escrevem — produzindo estado que nenhuma teria permitido
sozinha.

As duas últimas são as que mais causam prejuízo real, e a última é a mais sutil.

### Os níveis e o que cada um admite

```text
                        leitura   não        leitura   atualização
                        suja      repetível  fantasma  perdida
não confirmado          sim       sim        sim       sim
confirmado              não       sim        sim       sim
leitura repetível       não       não        varia     não
serializável            não       não        não       não
```

**Leitura confirmada** é o padrão da maioria dos bancos. Ele permite leitura não
repetível, fantasma e atualização perdida.

Isso significa que o comportamento padrão do seu banco admite atualização perdida —
e é a origem do defeito clássico de "ler saldo, calcular, gravar saldo".

### Distorção de escrita é a que engana

```text
regra: sempre ao menos um médico de plantão
estado: dois médicos de plantão

transação A                     transação B
lê: 2 de plantão                lê: 2 de plantão
verifica: ok, posso sair        verifica: ok, posso sair
remove A do plantão             remove B do plantão
confirma                        confirma

resultado: zero médicos de plantão
```

Nenhuma transação leu dado sujo. Nenhuma sobrescreveu escrita da outra. Cada uma
verificou a regra corretamente.

E a regra foi violada. Isso é distorção de escrita, e só o nível serializável
impede — ou um bloqueio explícito.

### Bloqueio explícito é a saída prática

Serializável tem custo e nem todo banco o implementa da mesma forma. Na prática, o
padrão mais usado é ler com bloqueio explícito nas operações críticas:

```sql
SELECT saldo FROM contas WHERE id = ? FOR UPDATE
```

Isso serializa o acesso àquele registro sem elevar o isolamento de tudo. É a
técnica que resolve atualização perdida em código de negócio.

A alternativa sem bloqueio é controle otimista: ler a versão, escrever verificando
que ela não mudou, repetir se mudou.

### Transação longa é o problema operacional

Uma transação aberta segura bloqueios e impede limpeza de versões antigas.

O erro característico: abrir transação, chamar um serviço externo, e confirmar
depois. Se o serviço demora 30 segundos, os bloqueios duram 30 segundos.

Regra: nenhuma chamada de rede dentro de transação.

## Modelo Mental

**Isolamento é um espectro, e o padrão do seu banco está longe do topo.** Saber
qual anomalia cada nível admite é a diferença entre código correto e código que
funciona na maior parte das vezes.

## Quando Usar

- Múltiplas escritas que precisam ser atômicas.
- Leitura seguida de escrita baseada no que foi lido.
- Invariantes que envolvem mais de um registro.
- Qualquer operação em que estado parcial seja inaceitável.

## Quando Não Usar

**Isolamento serializável para tudo.** Custo alto e contenção.

**Transação envolvendo chamada externa.**

**Transação para operação de leitura única.** Não há o que isolar.

**Transação longa para processamento em lote.** Divida em lotes menores.

**Contar com o padrão do banco sem saber qual é.**

**Transação distribuída.** Ver
[transações distribuídas](../06-distributed-systems/distributed-transactions.md) —
outro problema, outro custo.

## Alternativas

- **Bloqueio explícito** — serializa o registro crítico sem elevar tudo.
- **Controle otimista por versão** — sem bloqueio, com repetição.
- **Operação atômica do banco** — `UPDATE saldo = saldo - ?` evita o ciclo
  ler-calcular-gravar inteiro.
- **Restrição de unicidade** — deixa o banco rejeitar a duplicata.

A terceira é a mais subestimada: boa parte dos casos de atualização perdida
desaparece ao expressar a mudança como operação relativa em vez de valor absoluto.

## Trade-offs

| Isolamento alto | Baixo |
|---|---|
| Menos anomalias | Mais |
| Mais contenção | Menos |
| Vazão menor | Maior |
| Raciocínio simples | Exige cuidado no código |

| Bloqueio pessimista | Otimista |
|---|---|
| Sem conflito | Repetição no conflito |
| Bloqueia outros | Não bloqueia |
| Bom sob alta contenção | Bom sob baixa |
| Risco de impasse | Sem impasse |

## Modos de Falha

**Atualização perdida.** O ciclo ler-calcular-gravar sob concorrência.

**Distorção de escrita.** A invariante quebra sem nenhuma anomalia clássica.

**Impasse.** Duas transações esperando bloqueios uma da outra.

**Transação longa.** Segura bloqueios e impede limpeza.

**Contenção em registro quente.** Todas as operações serializam num único
registro.

**Rollback silencioso.** A aplicação não verifica se a confirmação sucedeu.

## Erros Comuns

**Não saber o nível de isolamento padrão.**

**Ler, calcular na aplicação e gravar** sem bloqueio nem verificação de versão.

**Chamada de rede dentro da transação.**

**Não tratar impasse.** Ele acontece; o código precisa repetir.

**Assumir que transação resolve concorrência.** Ela resolve a que o nível cobre.

**Confundir transação local com distribuída.**

## Exemplo Real

Um sistema de créditos internos tinha a operação de consumo implementada assim:
ler saldo, verificar se é suficiente, subtrair na aplicação, gravar o novo valor —
tudo dentro de uma transação.

O banco usava leitura confirmada, o padrão.

Sob uso normal, funcionava. Quando um cliente disparava várias operações
simultâneas — o que acontecia em integrações automatizadas — o saldo ficava
errado.

Duas transações liam 100, ambas subtraíam 30, ambas gravavam 70. Duas operações
consumiram 60 e o saldo caiu 30.

Clientes com integração intensa acumularam saldo indevido por dezoito meses. O
total chegou à casa das centenas de milhares.

O defeito não aparecia em teste porque exigia concorrência real sobre o mesmo
registro.

As correções, em ordem de aplicação:

**Operação relativa.** `UPDATE saldos SET saldo = saldo - ? WHERE id = ? AND saldo
>= ?`, verificando quantas linhas foram afetadas. Isso elimina o ciclo
ler-calcular-gravar e a anomalia junto. Uma linha.

**Restrição de verificação** garantindo saldo não negativo — a rede de segurança no
armazenamento, valendo para todo escritor.

**Registro de movimentação** em vez de apenas o saldo, permitindo auditar e
reconciliar. Isso foi o que permitiu quantificar o prejuízo passado.

O que a equipe registra: o código estava dentro de uma transação, e todo mundo
acreditava estar protegido por isso. A palavra "transação" foi lida como
"exclusão mútua", e não é.

## Conceitos Relacionados

- [Consistência de Dados](data-consistency.md) — o tema no nível do armazenamento.
- [OLTP](oltp.md) — onde contenção aparece.
- [Transações Distribuídas](../06-distributed-systems/distributed-transactions.md).
- [Bancos Relacionais](relational-databases.md).

## Exercício Prático

Descubra o nível de isolamento padrão do seu banco. Depois procure no código
trechos que leem um valor, calculam na aplicação e gravam o resultado.

Cada um é um caso de atualização perdida esperando concorrência suficiente.

## Perguntas de Entrevista

- O que leitura confirmada permite que aconteça?
- O que é distorção de escrita e por que ela engana?
- Por que expressar a mudança como operação relativa elimina a anomalia?

## Para Aprofundar

- Berenson, Hal et al. *A Critique of ANSI SQL Isolation Levels*. SIGMOD, 1995.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 7.
- Bailis, Peter et al. *Highly Available Transactions*. VLDB, 2014.
