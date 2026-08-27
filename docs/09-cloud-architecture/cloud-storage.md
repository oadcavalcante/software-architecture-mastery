---
id: cloud-storage
title: Armazenamento em Nuvem
sidebar_position: 12
description: Objetos, blocos e arquivos — três modelos com propriedades diferentes, e o que cada um cobra.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe o tipo de armazenamento pelo padrão de acesso e
  configura classes e retenção conscientemente.
prerequisites: [cloud-architecture]
related: [cloud-compute, cost-architecture, data-lifecycle]
canonical_for: [armazenamento de blocos, classe de armazenamento, regra de ciclo de vida]
content_version: 1
last_reviewed: 2026-08-27
---

# Armazenamento em Nuvem

## Visão Geral

Três modelos, com propriedades e preços muito diferentes:

**Objetos.** Arquivos identificados por chave, acessados por API. Escala
praticamente ilimitada, durabilidade altíssima, e não é um sistema de arquivos.

**Blocos.** Discos virtuais anexados a uma máquina. Comportam-se como disco local,
e pertencem a uma [zona](availability-zones.md).

**Arquivos.** Sistema de arquivos compartilhado, montável por várias máquinas.
Conveniente e mais caro.

Escolher errado entre eles é a origem de custos altos e de limitações que aparecem
tarde.

## Problema

O reflexo é usar o que é familiar: disco. Uma aplicação que grava arquivos no
sistema de arquivos continua fazendo isso na nuvem, com disco anexado.

Isso funciona e prende: o disco pertence a uma zona, não é compartilhável, tem
tamanho fixo a gerenciar, e custa por gigabyte provisionado — não usado.

Para a maior parte dos casos de "guardar arquivos", armazenamento de objetos é mais
barato, mais durável e mais escalável. A migração raramente acontece porque ninguém
revisita a escolha.

## Conceitos Centrais

### Objetos não são um sistema de arquivos

A semelhança superficial engana:

**Não há diretórios.** As barras na chave são convenção; a estrutura é plana.

**Não há alteração parcial.** Substituir um objeto reescreve o objeto inteiro.

**Listar é caro.** Listar milhões de chaves com um prefixo é uma operação
custosa, em tempo e em cobrança.

**Consistência.** Hoje a leitura após escrita é forte na maioria dos provedores;
listagem pode demorar a refletir.

Tratar objetos como disco produz padrões de acesso ruins — o mais comum é listar
para encontrar, quando a chave deveria ser derivável.

### Classes de armazenamento e o custo de recuperar

```text
acesso frequente     mais caro por gigabyte, sem custo de recuperação
acesso infrequente   mais barato, com custo por recuperação
arquivamento         muito barato, recuperação lenta e cobrada
```

A economia é real e tem uma armadilha: mover dados para classe fria e depois
acessá-los com frequência sai **mais caro** que tê-los deixado na classe quente.

A regra: baseie a transição em dados de acesso real, não em idade presumida. E
verifique se a aplicação tolera a latência de recuperação da classe de destino — em
arquivamento profundo, ela pode ser de horas.

### Ciclo de vida é configuração, não código

Regras que movem e apagam objetos automaticamente por idade são a forma mais barata
de controlar custo de armazenamento.

E são também onde o requisito de retenção precisa estar. Ver
[ciclo de vida do dado](../07-data-architecture/data-lifecycle.md).

Sem regras de ciclo de vida, o armazenamento só cresce — e é o item da fatura que
cresce mais silenciosamente, porque não gera erro nem lentidão.

### Versionamento protege contra você mesmo

Com versionamento, sobrescrever ou apagar cria uma versão nova em vez de destruir a
anterior.

É a proteção contra apagamento acidental e contra ataque que cifra dados. Ver
[recuperação de desastre](disaster-recovery.md).

Duas consequências a gerenciar: versões antigas ocupam espaço e são cobradas, e a
regra de ciclo de vida precisa tratá-las explicitamente — do contrário, apagar não
libera nada.

### Durabilidade não é disponibilidade

Armazenamento de objetos costuma prometer durabilidade altíssima — a chance de
perder um objeto é remota.

Isso não diz nada sobre **disponibilidade**: o serviço pode estar temporariamente
inacessível, e vários incidentes de grande alcance foram exatamente isso.

E durabilidade não protege contra apagamento: se você mandar apagar, ele apaga com
altíssima confiabilidade.

### Bloco tem desempenho provisionado

Discos virtuais têm limites de operações por segundo e de vazão, geralmente
proporcionais ao tamanho ou provisionados à parte.

Um disco pequeno pode ser o gargalo de um banco, e o sintoma é lentidão sem CPU
alta — diagnóstico que costuma demorar porque ninguém suspeita do disco.

E o mecanismo de crédito de rajada, presente em algumas classes, produz o pior tipo
de problema: desempenho bom nos testes, ruim sob carga sustentada.

## Modelo Mental

**Objetos para o que é lido e escrito inteiro; bloco para o que precisa de disco;
arquivo quando precisa ser compartilhado.** A escolha errada aparece na fatura ou
no limite.

## Quando Usar

**Objetos** — arquivos de usuário, mídia, cópias, dados analíticos, artefatos,
qualquer coisa lida inteira.

**Bloco** — sistema operacional, banco de dados, qualquer coisa que exija sistema de
arquivos com desempenho.

**Arquivo** — quando várias máquinas precisam do mesmo sistema de arquivos e
reescrever a aplicação não é opção.

## Quando Não Usar

**Objetos como sistema de arquivos**, com listagem para localizar.

**Bloco para arquivos de usuário.** Caro, preso a uma zona, com tamanho a
gerenciar.

**Arquivo por conveniência**, quando objetos resolvem. É o mais caro dos três.

**Classe fria sem verificar o padrão de acesso.**

**Sem regras de ciclo de vida.**

**Versionamento sem regra para as versões antigas.**

## Alternativas

- **Rede de distribuição de conteúdo** na frente de objetos — reduz custo de saída e
  latência.
- **Banco de dados** para dados estruturados — armazenamento não substitui.
- **Cache** para o que é lido repetidamente.
- **Armazenamento efêmero local** para dados temporários de processamento — mais
  rápido e mais barato que disco persistente.

## Trade-offs

| Objetos | Bloco |
|---|---|
| Escala ilimitada | Tamanho definido |
| Acesso por API | Sistema de arquivos |
| Compartilhável | Uma máquina |
| Cobra por uso | Por provisionado |
| Independente de zona | Preso a uma |
| Sem alteração parcial | Escrita aleatória |

| Classe quente | Fria | Arquivamento |
|---|---|---|
| Mais cara | Média | Muito barata |
| Sem custo de recuperação | Com | Alto |
| Acesso imediato | Imediato | Minutos a horas |

## Modos de Falha

**Crescimento sem controle.** Sem ciclo de vida.

**Recuperação cara.** Dados em classe fria acessados com frequência.

**Versões antigas cobradas.** Apagar não liberou espaço.

**Disco como gargalo.** Limite de operações por segundo atingido.

**Crédito de rajada esgotado.** Desempenho despenca sob carga sustentada.

**Objeto exposto publicamente.** Configuração de acesso permissiva — um dos
vazamentos mais comuns em nuvem.

**Listagem cara.** Um laço que lista milhões de chaves.

## Erros Comuns

**Usar disco para arquivos de usuário.**

**Não configurar ciclo de vida.**

**Mover para classe fria por idade, sem dados de acesso.**

**Não tratar versões antigas.**

**Dimensionar disco só por tamanho**, ignorando o limite de operações.

**Não verificar permissões de acesso público.**

## Exemplo Real

Uma plataforma de educação guardava vídeos, materiais e uploads de alunos em discos
anexados às máquinas da aplicação.

Três consequências:

**Escala.** Cada máquina precisava do mesmo conteúdo, e a sincronização entre elas
era um processo próprio, frágil. Adicionar uma instância levava 40 minutos copiando
arquivos.

**Custo.** Os discos eram provisionados com folga — 60% de espaço ocioso pago
integralmente. E o conteúdo estava replicado em cada máquina.

**Zona.** Todo o conteúdo estava preso à zona das instâncias.

A migração para armazenamento de objetos resolveu os três, e trouxe decisões novas:

**Ciclo de vida.** Materiais de cursos encerrados havia mais de dois anos foram para
classe de arquivamento. A economia foi grande — e um mês depois, um professor pediu
o material de um curso antigo, e a recuperação levou 5 horas. A regra foi ajustada
para arquivar apenas após quatro anos, com aviso na interface sobre a latência.

**Versionamento.** Habilitado após um incidente em que um script apagou uploads de
alunos. Salvou os dados. Seis meses depois, o custo de armazenamento tinha subido
40% — as versões antigas nunca eram removidas. A regra de ciclo de vida passou a
apagar versões não atuais após 90 dias.

**Exposição.** Uma revisão de segurança encontrou um conjunto de objetos com acesso
público, criado durante a migração para testar e nunca corrigido. Continha uploads
de alunos.

**Rede de distribuição de conteúdo** na frente dos vídeos. O custo de saída caiu
substancialmente, e a experiência melhorou.

O que a equipe registra: a migração foi tratada como troca de tecnologia — "de disco
para objetos" — e as três decisões que vieram depois (classe, versionamento,
permissões) não estavam no plano. Cada uma gerou um incidente antes de virar
configuração.

## Conceitos Relacionados

- [Computação em Nuvem](cloud-compute.md).
- [Arquitetura de Custo](cost-architecture.md).
- [Ciclo de Vida do Dado](../07-data-architecture/data-lifecycle.md).
- [Recuperação de Desastre](disaster-recovery.md).

## Exercício Prático

Descubra quanto do seu armazenamento não é acessado há mais de um ano, e em qual
classe ele está.

Depois verifique se há regra de ciclo de vida e se ela trata versões antigas. As
duas respostas costumam explicar boa parte da fatura de armazenamento.

## Perguntas de Entrevista

- Por que armazenamento de objetos não é um sistema de arquivos?
- Qual a armadilha das classes frias?
- Por que durabilidade não é disponibilidade?

## Para Aprofundar

- Documentação de classes de armazenamento dos principais provedores.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2ª ed. O'Reilly, 2023.
