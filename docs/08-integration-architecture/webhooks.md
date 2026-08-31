---
id: webhooks
title: Webhooks
sidebar_position: 6
description: Notificar em vez de ser consultado — e por que a outra ponta é um servidor que você não controla.
doc_type: pattern
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta webhooks com as garantias que o receptor precisa,
  e consome webhooks alheios sem confiar no que chega.
prerequisites: [integration-architecture]
related: [messaging-integration, event-driven-integration, integration-contracts]
canonical_for: [webhook, assinatura de webhook, reentrega]
content_version: 1
last_reviewed: 2026-08-27
---

# Webhooks

## Visão Geral

Um webhook é uma chamada HTTP que **você faz para o servidor de outra pessoa**
quando algo acontece.

É a forma dominante de integração assíncrona entre organizações, porque não exige
que o parceiro consuma seu intermediário de mensagens nem adote sua tecnologia —
basta ele expor uma URL.

A diferença que organiza tudo: o destino é um servidor que você não controla, com
disponibilidade que você não conhece e correção que você não pode assumir.

## Problema

Sem webhook, quem precisa saber de uma mudança consulta periodicamente.

Consultar é ineficiente dos dois lados: a maioria das consultas não traz novidade,
e a latência é metade do intervalo. Um parceiro consultando a cada minuto gera
1.440 requisições por dia para talvez três eventos.

Webhook inverte: o publicador avisa quando há o que avisar.

E, ao inverter, transfere para o publicador um problema que a consulta não tinha —
**entregar** para um endpoint que pode estar fora, lento, ou responder errado.

## Conceitos Centrais

### Do lado de quem envia

**Retentativa com espera crescente.** O destino vai estar fora. Sem repetição, o
evento se perde. Ver [backoff](/06-distributed-systems/backoff.md).

**Prazo curto e agressivo.** O receptor precisa responder rápido; se ele demora 30
segundos, sua fila de entregas trava. Cinco a dez segundos é o usual, e precisa
estar no contrato.

**Assinatura.** O receptor precisa provar que a requisição veio de você. Um
cabeçalho com assinatura sobre o corpo, usando um segredo compartilhado, é o
padrão. Sem isso, qualquer um pode forjar eventos.

**Marca de tempo na assinatura.** Impede que uma requisição capturada seja
reenviada depois.

**Identificador único do evento.** Permite ao receptor deduplicar — o que ele vai
precisar fazer, porque sua retentativa vai duplicar.

**Desativação após falhas persistentes.** Um endpoint morto há semanas não deve
consumir sua capacidade indefinidamente. E a desativação precisa ser comunicada,
ou o parceiro descobre pela ausência.

**Painel de reentrega.** O parceiro precisa poder reprocessar o que perdeu.

### Do lado de quem recebe

**Responda rápido, processe depois.** Aceite, enfileire, devolva `200`. Processar
de forma síncrona dentro do webhook é a causa mais comum de timeout e reentrega.

**Verifique a assinatura antes de qualquer coisa.**

**Seja idempotente.** Vai chegar duplicado. Ver
[idempotência](/06-distributed-systems/idempotency.md).

**Não confie na ordem.** Retentativas embaralham. Um evento de cancelamento pode
chegar antes do de criação.

**Não confie no conteúdo.** Vários provedores recomendam usar o webhook apenas
como gatilho e consultar a API para obter o estado real — o que elimina de uma vez
os problemas de ordem e de conteúdo defasado.

**Devolva erro quando falhar.** Responder `200` para o que você não processou faz
o provedor considerar entregue, e o evento se perde para sempre.

### Notificação ou estado

O mesmo trade-off de [eventos de integração](/08-integration-architecture/event-driven-integration.md), com um
peso extra: o corpo do webhook trafega para fora da sua organização.

Um webhook gordo com dados sensíveis os replica no ambiente do parceiro. Um
webhook fino — identificador e tipo — mantém o dado na origem, sob controle de
acesso.

Para dados regulados, o fino costuma ser a única opção defensável.

### A URL do receptor é um risco de segurança

Permitir que um usuário cadastre uma URL arbitrária para a qual seu servidor fará
requisições é, literalmente, pedir ao seu servidor que acesse um endereço
escolhido por terceiros.

Sem restrição, isso permite alcançar endereços internos da sua rede — serviços de
metadados da nuvem, bancos, painéis administrativos.

As defesas: recusar endereços privados e locais, resolver o nome e validar o IP
resolvido, não seguir redirecionamentos, e enviar de uma rede isolada.

Este é o problema de segurança característico de webhooks e o mais frequentemente
esquecido.

## Modelo Mental

**Webhook é uma entrega, não uma publicação.** Você é responsável por ela chegar,
num destino que não é seu.

## Quando Usar

- Notificar sistemas fora da sua organização.
- O parceiro não vai consumir seu intermediário de mensagens.
- Consulta periódica é ineficiente para o volume de eventos.
- O receptor precisa reagir com baixa latência.
- Integração com plataformas que já esperam esse modelo.

## Quando Não Usar

**Internamente, quando já existe mensageria.** Ver
[integração por mensageria](/08-integration-architecture/messaging-integration.md) — ali o intermediário
resolve entrega, ordem e reprocessamento melhor.

**Quando o volume é muito alto.** Milhares de eventos por segundo por parceiro
não cabem em requisições individuais; ver
[integração em lote](/08-integration-architecture/batch-integration.md).

**Sem assinatura.** Endpoint forjável.

**Sem retentativa.** Eventos se perdem na primeira instabilidade.

**Sem validação da URL de destino.** Risco de acesso à rede interna.

**Quando o receptor precisa responder com dados.** Webhook é notificação, não
consulta.

## Alternativas

- **Consulta periódica** — simples, sem entrega a garantir, e frequentemente
  suficiente. Não descarte cedo.
- **Fluxo de eventos por assinatura** — o parceiro consome um endpoint que
  mantém a conexão aberta, com posição controlada por ele. Elimina o problema de
  entrega.
- **[Mensageria](/08-integration-architecture/messaging-integration.md) compartilhada** — quando há confiança e
  tecnologia comum.
- **Arquivo periódico** — ver [integração por arquivo](/08-integration-architecture/file-integration.md).

A segunda opção merece consideração: deixar o consumidor puxar no ritmo dele, com
posição controlada, remove retentativa, desativação e reentrega do seu lado.

## Trade-offs

| Webhook | Consulta periódica |
|---|---|
| Latência baixa | Metade do intervalo |
| Requisições só quando há evento | Muitas vazias |
| Você garante a entrega | O consumidor busca |
| Receptor precisa de endpoint público | Não precisa |
| Retentativa e reentrega a operar | Nada |
| Risco de acesso à rede interna | Nenhum |

## Modos de Falha

**Receptor lento travando a fila de entregas.**

**`200` sem processar.** Evento perdido silenciosamente.

**Duplicata processada.**

**Ordem invertida.** Cancelamento antes da criação.

**Endpoint desativado sem aviso.** O parceiro para de receber e não sabe.

**Assinatura não verificada.** Eventos forjados aceitos.

**URL apontando para rede interna.**

**Processamento síncrono no webhook.** Timeout, reentrega, e o efeito acontece
duas vezes.

## Erros Comuns

**Processar de forma síncrona dentro do webhook.**

**Não verificar assinatura.**

**Não validar a URL de destino.**

**Não deduplicar.**

**Assumir ordem.**

**Não oferecer reentrega ao parceiro.**

## Exemplo Real

Uma plataforma de pagamentos notificava lojistas por webhook a cada mudança de
status de transação.

Cinco problemas ao longo de dois anos, três do lado do provedor e dois do lado dos
receptores:

**Receptor lento.** Um lojista com endpoint que levava 25 segundos ocupava
trabalhadores de entrega. Isso atrasou as entregas de **todos** os lojistas em até
8 minutos num pico. Corrigido com prazo de 8 segundos, isolamento por lojista e
fila separada para endpoints lentos.

**Ordem invertida.** Retentativas faziam `pagamento.aprovado` chegar depois de
`pagamento.estornado`. Lojistas marcavam pedidos como pagos após o estorno.
Corrigido documentando que a ordem não é garantida, incluindo o instante do evento
no corpo, e recomendando consulta à API para o estado atual.

**Endpoint desativado em silêncio.** Após 7 dias de falhas, a plataforma
desativava. Um lojista ficou 3 semanas sem receber e sem saber — descobriu ao
conciliar. Passou a haver e-mail no primeiro dia de falha, alerta no painel e
desativação só após 14 dias.

**Assinatura ignorada.** Uma auditoria revelou que cerca de 30% dos lojistas não
verificavam a assinatura. A plataforma passou a exigir verificação para
credenciais novas, e a oferecer bibliotecas prontas — a razão da não verificação
era quase sempre "dava trabalho".

**Acesso à rede interna.** Um pesquisador de segurança cadastrou uma URL apontando
para o serviço de metadados da nuvem e recebeu, no corpo da resposta que a
plataforma registrava em log, credenciais temporárias da instância. Corrigido com
lista de bloqueio de faixas privadas, validação do IP resolvido, proibição de
redirecionamentos e envio a partir de rede isolada.

O último foi classificado como o incidente mais grave da história da plataforma, e
a equipe registra que ele era conhecido na literatura de segurança havia anos —
faltou alguém fazer a pergunta "para onde exatamente nosso servidor está fazendo
requisições?".

## Conceitos Relacionados

- [Integração por Mensageria](/08-integration-architecture/messaging-integration.md) — a alternativa interna.
- [Integração Orientada a Eventos](/08-integration-architecture/event-driven-integration.md).
- [Idempotência](/06-distributed-systems/idempotency.md).
- [Backoff](/06-distributed-systems/backoff.md) — a espera entre tentativas.

## Exercício Prático

Se você envia webhooks: o que acontece hoje se alguém cadastrar
`http://169.254.169.254/` como destino?

Se você recebe: o processamento acontece dentro da requisição ou você enfileira?
E o que seu código faz se o mesmo evento chegar duas vezes?

## Perguntas de Entrevista

- Por que responder `200` sem processar é perigoso?
- Que risco de segurança uma URL de destino arbitrária cria?
- Por que um receptor lento afeta outros receptores?

## Para Aprofundar

- Documentação de webhooks do Stripe — referência prática do padrão.
- OWASP. *Server Side Request Forgery Prevention Cheat Sheet*.
- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*, 2003.
