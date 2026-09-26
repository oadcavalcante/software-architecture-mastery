---
id: disaster-recovery
title: Recuperação de Desastre
sidebar_position: 16
description: Voltar a operar depois do que não deveria acontecer, e por que o plano que ninguém executou não é um plano.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor define objetivos de tempo e de perda com o negócio, e
  escolhe a estratégia que os atende ao menor custo.
prerequisites: [regions]
related: [multi-region, availability-zones, data-replication]
canonical_for: [estratégia de recuperação em nuvem, piloto aceso, espera quente]
content_version: 3
last_reviewed: 2026-08-27
---

# Recuperação de Desastre

## Visão Geral

Recuperação de desastre é o conjunto de decisões e procedimentos para voltar a
operar depois de um evento que a redundância normal não cobre: perda de região,
corrupção de dados, apagamento acidental, ataque com criptografia de dados.

Ela é diferente de alta disponibilidade. Alta disponibilidade evita que falhas
comuns virem indisponibilidade. Recuperação de desastre trata do que acontece
quando isso não bastou.

E ela se resume a dois números, que precisam vir do negócio, não da engenharia.

## Problema

Quase toda empresa tem cópias de segurança. Muito menos empresas conseguem
restaurá-las quando precisam.

Os motivos se repetem de um caso para outro: a restauração nunca foi testada, o procedimento
está desatualizado, a cópia não contém tudo, ou a restauração leva tempo demais para
ser útil.

O resultado é um plano que existe em documento e não em capacidade.

## Conceitos Centrais

### Os dois números

**[RTO](/12-reliability/rto.md) (objetivo de tempo de recuperação).** Quanto tempo até voltar a operar.

**[RPO](/12-reliability/rpo.md) (objetivo de ponto de recuperação).** Quanto dado se pode perder.

```text
RPO ─────────────┤ desastre ├───────────── RTO
    dados perdidos            tempo parado
```

Por que os dois são decisões de negócio com preço, e não estimativas técnicas, está
nos documentos de cada um. Aqui interessa o que eles compram em nuvem: cada
estratégia abaixo é um ponto na troca entre custo contínuo e os dois números, e sem
eles a escolha entre elas é palpite.

### As estratégias, por preço

```text
                     RTO típico           RPO típico   custo
só cópias            dias                 horas        muito baixo
cópias + automação   horas                minutos      baixo
piloto aceso         dezenas de minutos   minutos      médio
espera quente        minutos              segundos     alto
ativo-ativo          segundos             ~zero        muito alto
```

**Piloto aceso** merece atenção: uma versão mínima do ambiente permanece ligada (o
banco replicando, a rede pronta) e a capacidade de computação é criada na
ativação. Custa uma fração da espera quente e entrega RTO de dezenas de minutos.

É o ponto de melhor relação entre custo e resultado para a maioria dos sistemas que
precisam de mais que cópias, e é subutilizado.

O preço que a tabela não mostra: o ambiente em espera diverge da produção entre uma
ativação e outra. A produção ganha versão nova de imagem, variável de configuração,
permissão, e a região de espera não; a cota de instâncias da conta na região de
destino continua no padrão, dimensionada para o piloto e não para a carga. O
desenho em espera só entrega o RTO da tabela se a ativação for exercitada com a
mesma cadência das implantações — e se o retorno à região de origem, que exige
replicar de volta os dados escritos durante o desastre, também tiver sido ensaiado.

Ver [multi-região](/09-cloud-architecture/multi-region.md) para os desenhos superiores.

### Cópia de segurança não é replicação

Ver [replicação de dados](/07-data-architecture/data-replication.md). A distinção
decide se você sobrevive a erro humano.

Replicação copia tudo, inclusive o comando destrutivo. Cópia de segurança tem
histórico: permite voltar a antes do erro.

Os cenários que **só** a cópia cobre: apagamento acidental, corrupção lógica,
migração com defeito, e ataque que cifra os dados.

Esse último merece nota: um ataque desses tipicamente busca as cópias primeiro. Por
isso cópias imutáveis, ou em conta separada com credenciais distintas, deixaram de
ser exagero.

### A restauração é o que importa, não a cópia

Uma cópia que existe e não restaura é pior que nenhuma, porque produz falsa
confiança.

O que precisa ser testado, periodicamente e de verdade:

**A restauração completa funciona**, não só a leitura do arquivo.

**Quanto tempo leva.** Restaurar vários terabytes pode levar mais que o RTO.

**O que está incluído.** Bancos, arquivos, configuração, segredos, filas em
trânsito. Costuma faltar algo.

**Quem sabe fazer.** Um procedimento que só uma pessoa conhece não é um plano.

### O plano vai além dos dados

O escopo do plano (configuração, segredos, certificados, comunicação), a
autoridade de acionamento e a ordem em que as funções voltam estão em
[planejamento de recuperação](/12-reliability/disaster-recovery-planning.md). Este
documento trata da estratégia técnica que o plano aciona.

Dois itens do escopo mudam de natureza quando a recuperação é para outra região.
**DNS**: o registro com tempo de vida de um dia mantém clientes apontando para a
região morta por um dia, por mais rápido que o resto suba. O tempo de vida precisa
caber no RTO antes do desastre. **Dependências externas**: o gateway de pagamento ou
o parceiro que libera chamadas por lista de endereços de origem recusa a região nova
até que alguém, do lado de lá, atualize a lista.

## Modelo Mental

**Cada estratégia é um aluguel contínuo pago para encurtar os dois números, e o
que se aluga só existe se a ativação foi ensaiada.** Capacidade em espera que nunca
recebeu tráfego é custo, não RTO.

## Quando Usar

Todo sistema precisa de alguma estratégia. O nível depende de:

- Custo por hora de parada.
- Requisito regulatório.
- Criticidade para a operação do negócio.
- Compromissos contratuais.

## Quando Não Usar

**Espera quente ou ativo-ativo quando a parada não paga a capacidade.** Se a perda
de uma parada de dezenas de minutos, multiplicada pela frequência esperada de perda
de região, fica abaixo da diferença anual de custo contínuo entre piloto aceso e
espera quente, a capacidade em espera compra um RTO que o negócio não vai usar.

**Só cópias quando o volume não cabe no RTO.** Restaurar 20 TB a 2 TB por hora leva
dez horas; com RTO de quatro, nenhum teste torna a cópia suficiente, e a estratégia
precisa de dado já replicado no destino.

**Estratégia multi-região sem segundo destino viável.** Quando a residência de
dados obriga a uma única região, ou quando um serviço gerenciado do qual o sistema
depende não existe na região de destino, o desenho em espera não sobe. A
recuperação passa a ser na mesma região, a partir de cópia isolada, ou em outro
provedor, com RTO de outra ordem.

**RTO de minutos para sistema com contingência manual.** Se a operação consegue
funcionar um dia em processo manual, cópias com automação de restauração atendem, e
qualquer degrau acima é custo que não se paga.

## Alternativas

- **Três [zonas de disponibilidade](/09-cloud-architecture/availability-zones.md)**: cobre a maior parte
  das falhas reais e não é recuperação de desastre.
- **Cópias com automação de restauração**: o mínimo viável, e suficiente para
  muitos sistemas.
- **Piloto aceso**: a melhor relação custo-benefício quando o RTO exigido está na
  faixa de dezenas de minutos e o custo de parada não paga espera quente.
- **Réplica atrasada**: proteção barata contra erro humano. Ver
  [replicação de dados](/07-data-architecture/data-replication.md).

## Trade-offs

| RTO baixo | RTO alto |
|---|---|
| Capacidade em espera | Criada na hora |
| Custo contínuo | Baixo |
| Menos perda de receita | Mais |
| Mais complexidade | Menos |

| Cópias | Replicação |
|---|---|
| Cobre erro humano | Não |
| Restauração lenta | Promoção rápida |
| Custo baixo | Capacidade duplicada |
| RPO de horas | De segundos |

## Modos de Falha

**Restauração que falha.** Nunca testada.

**Restauração lenta demais** para o RTO.

**Cópia incompleta.** Falta configuração, segredo ou um banco secundário.

**Cópias cifradas por ataque.** Acessíveis com as mesmas credenciais.

**Retenção insuficiente.** A corrupção começou antes da cópia mais antiga.

**Ninguém sabe executar.**

**Autoridade indefinida.** A primeira hora se perde decidindo se aciona.

**Ativação que falha no destino.** A computação não sobe por cota da conta na
região, imagem desatualizada ou permissão que só existe na origem. Aparece como
RTO de horas numa estratégia vendida como de dezenas de minutos.

**Sem caminho de volta.** A região de origem se recupera, mas os dados escritos no
destino durante o desastre não têm replicação reversa configurada, e o sistema fica
preso na região de espera, dimensionada para o piloto.

## Erros Comuns

**Não definir RTO e RPO com o negócio.** Sem esses dois números, a estratégia é escolhida por intuição de engenharia. A intuição costuma comprar mais do que o negócio precisa, ou menos do que ele tolera.

**Não testar restauração.** A existência do backup não diz nada sobre quanto tempo leva restaurar nem se o que volta está íntegro. Backup nunca restaurado é uma hipótese, não um plano.

**Não cobrir configuração e segredos.** O banco volta e o sistema não sobe, porque faltam variáveis, certificados e chaves que ninguém incluiu no escopo do plano.

**Confiar em replicação contra erro humano.** A réplica reproduz a exclusão acidental imediatamente. Contra erro e contra corrupção, o que protege é a cópia com histórico.

**Não isolar as cópias.** Backup acessível com a mesma credencial do ambiente principal é apagado junto num ataque de ransomware. Conta separada e retenção imutável são o que faz diferença.

**Não priorizar o que volta primeiro.** Sem ordem definida, a recuperação tenta subir tudo ao mesmo tempo e trava em dependências. A lista de prioridade precisa ser decidida antes, com o negócio.

## Exemplo Real

Uma empresa de serviços tinha cópias diárias de todos os bancos, retenção de 30
dias, e um documento de recuperação de desastre exigido pela auditoria.

O documento nunca havia sido executado.

Um ataque com criptografia de dados atingiu o ambiente. O que se descobriu, na
ordem em que se descobriu:

**As cópias estavam na mesma conta**, acessíveis com as mesmas credenciais que o
atacante obteve. As dos últimos 30 dias foram cifradas junto.

**Existia uma cópia em outra conta**, feita mensalmente por um processo antigo que
ninguém lembrava. Ela tinha 26 dias.

**A restauração nunca fora testada.** A primeira tentativa falhou por incompatibilidade
de versão: a cópia era de uma versão anterior do banco, e o ambiente novo não a
aceitava diretamente.

**Faltava configuração.** Os segredos da aplicação não estavam em nenhuma cópia. Foi
preciso regenerar todos e reconfigurar as integrações.

**Ninguém sabia o procedimento.** A pessoa que escrevera o documento tinha saído da
empresa 8 meses antes.

Tempo total até operação parcial: **9 dias**. Perda de dados: 26 dias de
transações, reconstruídas parcialmente a partir de sistemas parceiros e registros
fiscais.

Depois:

**RTO e RPO definidos com a diretoria**: 4 horas e 15 minutos, respectivamente,
para as funções essenciais.

**Piloto aceso** em outra região, com replicação contínua.

**Cópias imutáveis** em conta separada, com credenciais que a produção não tem.

**Teste trimestral de restauração completa**, cronometrado. O primeiro levou 11
horas; o quarto, 3h20.

**Priorização de funções.** Três funções essenciais definidas para voltar primeiro.

**Autoridade de acionamento** definida em três nomes.

O que se registrou depois: eles cumpriam a exigência de auditoria (havia cópias e
havia documento). A auditoria nunca pediu um teste, e ninguém ofereceu.

## Conceitos Relacionados

- [Multi-Região](/09-cloud-architecture/multi-region.md): os desenhos de RTO baixo.
- [Zonas de Disponibilidade](/09-cloud-architecture/availability-zones.md).
- [Replicação de Dados](/07-data-architecture/data-replication.md).
- [Planejamento de Recuperação](/12-reliability/disaster-recovery-planning.md): o
  escopo do plano, a autoridade de acionamento e a ordem de retomada.
- [RTO](/12-reliability/rto.md) e [RPO](/12-reliability/rpo.md) : os dois números.
- [Confiabilidade](/12-reliability/index.md).

## Exercício Prático

Descubra quando foi o último teste de restauração completa do seu sistema (não a
verificação de que a cópia existe, a restauração de verdade).

Depois pergunte a alguém do negócio: quanto custa cada hora parada? Se os dois
números não conversarem, essa é a lacuna.

## Perguntas de Entrevista

- O que RTO e RPO significam, e quem os define?
- Por que replicação não protege contra erro humano nem contra ataque?
- Por que cópias precisam estar isoladas da produção?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- ISO 22301 — gestão de continuidade de negócios.
- NIST SP 800-34 — guia de planejamento de contingência.
