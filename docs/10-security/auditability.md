---
id: auditability
title: Auditabilidade
sidebar_position: 13
description: Provar o que aconteceu — e por que registro que pode ser apagado por quem age não serve.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta trilha de auditoria que sustenta investigação e
  resiste a quem tem acesso ao sistema.
prerequisites: [security]
related: [security-failure-modes, data-protection, least-privilege]
canonical_for: [trilha de auditoria, não repúdio, registro imutável, detecção de anomalia]
content_version: 1
last_reviewed: 2026-08-28
---

# Auditabilidade

## Visão Geral

Auditabilidade é a capacidade de responder, depois do fato: **quem fez o quê, quando,
e a partir de onde.**

Ela serve a três propósitos distintos, que costumam ser confundidos:

```text
investigação   reconstruir um incidente
conformidade   provar a um regulador que os controles funcionam
detecção       perceber o anômalo enquanto acontece
```

Os três exigem coisas diferentes do registro, e um sistema que atende apenas ao
segundo — o caso comum — não serve para os outros dois.

## Problema

A maioria dos sistemas tem registros. Poucos conseguem responder às perguntas de uma
investigação.

Os motivos se repetem:

O registro tem o que era fácil de registrar, não o que a pergunta exige. Não há
identificação de quem agiu — apenas o serviço. A retenção é menor que o tempo até a
descoberta. E, o mais grave, o registro está no mesmo lugar que o sistema auditado,
acessível a quem o comprometeu.

## Conceitos Centrais

### O que registrar

Um evento de auditoria útil responde as cinco perguntas:

```text
quem      identidade verificada — não o endereço IP, não o serviço
o quê     ação e recurso específico, com identificador
quando    instante, com fuso, de fonte confiável
onde      origem da requisição, dispositivo, sessão
resultado sucesso ou falha, e por quê
```

Duas ausências comuns tornam o registro inútil: **quem**, quando o sistema registra
apenas o serviço que executou; e **falhas**, quando só o sucesso é registrado — e a
tentativa negada é justamente o sinal de ataque.

### O registro precisa ser inviolável

Este é o ponto que separa auditoria de registro de aplicação.

Se quem tem acesso ao sistema pode apagar ou alterar o registro do que fez, o registro
não sustenta investigação nem prova nada.

As propriedades necessárias:

**Escrita permitida, exclusão negada.** Nem administradores apagam.

**Armazenamento separado.** Conta ou ambiente distinto do sistema auditado. Ver
[identidade em nuvem](../09-cloud-architecture/cloud-identity.md).

**Verificação de integridade.** Encadeamento por resumo, ou assinatura, permitindo
detectar alteração.

Sem isso, um atacante com acesso administrativo apaga o rastro — e essa é a primeira
coisa que ele faz.

### Não repúdio exige mais que registro

Provar que **aquela pessoa** fez algo, de forma que ela não possa negar, exige:

**Identidade individual.** Contas compartilhadas destroem não repúdio — não há como
atribuir a ação a uma pessoa.

**Autenticação forte.** Se a credencial é facilmente roubada, "foi a conta dela" não
prova "foi ela".

**Registro íntegro.**

A primeira é a mais violada: contas administrativas compartilhadas continuam comuns, e
elas tornam qualquer investigação inconclusiva.

### Retenção é definida pelo tempo até a descoberta

Incidentes levam meses para serem descobertos. Uma retenção de 30 dias significa que a
investigação começa sem os dados do início.

A retenção precisa cobrir o tempo típico até a detecção, mais margem — o que
tipicamente significa um ano ou mais para eventos de segurança, e o que a regulação
exigir para os demais.

E os registros antigos podem ir para armazenamento frio. Ver
[ciclo de vida do dado](../07-data-architecture/data-lifecycle.md).

### O registro não pode conter o que ele protege

O paradoxo prático: registros de auditoria frequentemente contêm dados sensíveis —
corpo de requisição, parâmetros, cabeçalhos com credenciais.

O registro passa a ser um alvo, com acesso mais amplo que o sistema original. É um
padrão recorrente: dados protegidos no banco, expostos em texto legível no sistema de
registros.

A regra: registrar **identificadores e ações**, não conteúdo. E filtrar credenciais na
origem. Ver [segredos](secrets.md).

### Detecção exige alertas, não relatórios

Um registro consultado apenas quando alguém suspeita serve à investigação e não à
detecção.

Os sinais que valem alerta automático:

```text
volume anômalo por usuário       exportação em massa
acesso fora do padrão            horário, localização, tipo de recurso
sequência de negações            varredura de permissões
alteração de permissão            especialmente autoconcedida
acesso a registro de alto valor  executivos, casos sensíveis
desativação de controle           inclusive do próprio registro
```

O último merece destaque: alertar quando alguém desliga a auditoria é o controle que
protege todos os outros.

## Modelo Mental

**Auditoria é o que resta quando tudo o mais falha.** Se ela pode ser apagada por quem
falhou, não resta nada.

## Quando Usar

- Acesso a dados sensíveis ou regulados.
- Operações privilegiadas e administrativas.
- Alterações de permissão e de configuração de segurança.
- Requisito regulatório de rastreabilidade.
- Sistemas com ameaça interna relevante.

## Quando Não Usar

**Registro de auditoria na mesma conta que o sistema auditado.**

**Sem identidade individual.** Contas compartilhadas.

**Registrando conteúdo sensível.**

**Retenção curta demais.**

**Só sucessos.** As negações são o sinal.

**Sem alertas.** Vira arquivo morto.

**Auditar tudo indiscriminadamente.** Volume que ninguém consegue analisar, com custo
alto — audite o que importa.

## Alternativas

- **Registro de auditoria da plataforma** — o provedor de nuvem já registra ações de
  infraestrutura; usar isso é mais barato e mais confiável que reimplementar.
- **Captura de mudanças do banco** — para rastrear alterações de dados sem instrumentar
  a aplicação.
- **[Event sourcing](../06-distributed-systems/distributed-event-sourcing.md)** — o
  histórico é o modelo, e a auditoria vem junto.
- **Versionamento temporal** — para saber como um registro estava em cada momento.

## Trade-offs

| Auditoria detalhada | Mínima |
|---|---|
| Investigação possível | Limitada |
| Volume e custo altos | Baixos |
| Risco de conter dado sensível | Menor |
| Análise exige ferramenta | Manual |

| Armazenamento separado | Junto |
|---|---|
| Resiste a comprometimento | Apagável |
| Custo e operação adicionais | Nenhum |
| Correlação mais difícil | Fácil |

## Modos de Falha

**Registro apagado pelo atacante.**

**Sem identidade.** Só o serviço aparece.

**Conta compartilhada.** Ação não atribuível.

**Retenção esgotada.** O início do incidente não existe.

**Dado sensível no registro.**

**Sem alerta.** O evento foi registrado e ninguém viu.

**Auditoria desligada.** Por configuração, por custo, por engano.

**Relógio errado.** Correlacionar eventos entre sistemas fica impossível. Ver
[relógio e tempo](../06-distributed-systems/clock-and-time.md).

## Erros Comuns

**Guardar auditoria no mesmo lugar.**

**Não registrar negações.**

**Não ter identidade individual em contas administrativas.**

**Registrar corpo de requisição.**

**Não alertar sobre desativação da auditoria.**

**Confundir registro de aplicação com trilha de auditoria.** Os dois têm propósitos e
requisitos diferentes.

## Exemplo Real

Uma instituição financeira sofreu acesso indevido a dados de clientes por um
funcionário do time de operações, durante quatro meses.

A investigação encontrou limitações que impediram conclusões:

**Conta compartilhada.** O time de operações usava uma conta administrativa comum, com
senha conhecida por sete pessoas. Os registros mostravam a conta, não a pessoa. Não
foi possível atribuir os acessos a ninguém especificamente.

**Sem registro de leitura.** O sistema registrava alterações, não consultas. Os acessos
indevidos eram leituras, e não deixaram rastro no sistema — a suspeita surgiu de um
cliente que percebeu que seus dados eram conhecidos por alguém.

**Retenção de 60 dias.** Quando a investigação começou, os primeiros dois meses já não
existiam.

**Registros na mesma conta.** Não havia evidência de adulteração, e também não havia
como afirmar que não houve.

O resultado: a instituição soube que houve acesso indevido, não soube por quem nem a
extensão, e teve que notificar todos os clientes potencialmente afetados — cerca de
80 mil — em vez dos efetivamente acessados.

A reformulação:

**Identidade individual obrigatória.** Contas compartilhadas eliminadas; acesso
administrativo por elevação temporária, nominal. Ver
[menor privilégio](least-privilege.md).

**Registro de leitura** para dados sensíveis de clientes, com identificador do registro
acessado.

**Conta separada** para auditoria, com exclusão negada a todos e verificação de
integridade por encadeamento.

**Retenção de dois anos** para eventos de segurança, com arquivamento após 90 dias.

**Alertas** de volume anômalo por usuário, acesso fora do horário e sequência de
consultas a clientes sem relação com o trabalho do operador.

Onze meses depois, o alerta de volume anômalo detectou um caso semelhante em dois
dias — com identificação da pessoa, dos 14 registros acessados, e sem necessidade de
notificação em massa.

O detalhe que a equipe destaca: eles cumpriam a exigência regulatória de "manter trilha de
auditoria". A trilha existia, e não respondia a nenhuma das perguntas que a
investigação fez.

## Conceitos Relacionados

- [Modos de Falha de Segurança](security-failure-modes.md).
- [Menor Privilégio](least-privilege.md) — identidade individual.
- [Proteção de Dados](data-protection.md).
- [Observabilidade](../13-observability/index.md) — o parente próximo, com outro
  propósito.

## Exercício Prático

Escolha um incidente hipotético — alguém acessou indevidamente um registro sensível há
seis meses — e tente responder: quem, o quê, quando, de onde.

As perguntas que você não conseguir responder são as lacunas da sua auditoria.

## Perguntas de Entrevista

- Por que o registro precisa estar fora do sistema auditado?
- O que não repúdio exige além de registro?
- Por que registrar apenas sucessos torna a trilha inútil para detecção?

## Para Aprofundar

- NIST SP 800-92 — guia de gestão de registros de segurança.
- Schneier, Bruce; Kelsey, John. *Secure Audit Logs*, 1999.
- OWASP. *Logging Cheat Sheet*.
