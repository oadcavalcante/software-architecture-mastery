---
id: cdn
title: CDN
sidebar_position: 10
description: Cache na borda, perto do usuário — e o que decide se ele serve ao seu conteúdo.
doc_type: concept
level: 3
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor decide o que colocar atrás de CDN e configura invalidação
  sem depender de purga manual.
prerequisites: [caching]
related: [caching, load-balancing, cloud-architecture]
canonical_for: [CDN, cache de borda]
content_version: 1
last_reviewed: 2026-08-26
---

# CDN

## Visão Geral

Uma CDN é uma rede de servidores distribuídos geograficamente que guardam cópias
do seu conteúdo perto de quem o consome.

O ganho é físico e não tem alternativa: **a luz leva tempo para atravessar o
planeta**. Um servidor em São Paulo respondendo a um usuário em Lisboa paga cerca
de 100 ms só de ida e volta, independentemente de quão rápido o servidor seja.

## Problema

Dois problemas diferentes, que a CDN resolve juntos.

**Distância.** Latência de rede é dominada pela distância física. Nenhuma
otimização de código reduz isso.

**Carga.** Todo asset servido pela origem consome banda, conexão e CPU dela — para
entregar bytes idênticos milhares de vezes.

Servir de um ponto próximo resolve os dois: a resposta viaja menos e a origem
nem é consultada.

## Conceitos Centrais

### O que vai atrás de CDN

O critério é **quantos usuários recebem exatamente a mesma resposta**.

| Conteúdo | Cabe em CDN? |
|---|---|
| Imagens, CSS, JavaScript, fontes | Sim, é o caso ideal |
| Vídeo e download | Sim, é onde a economia de banda é maior |
| Páginas públicas idênticas para todos | Sim |
| Resposta de API pública e imutável | Sim, com cabeçalho adequado |
| Página personalizada por usuário | Não, salvo com técnicas específicas |
| Resposta que depende de autenticação | Não, e cachear isso vaza dado |

A última linha é o modo de falha mais grave da CDN: cachear uma resposta
autenticada faz um usuário receber o conteúdo de outro. Acontece, e a causa
costuma ser um cabeçalho de cache mal configurado.

### O cabeçalho é o contrato

A CDN obedece ao que a origem manda. Os que decidem:

**`Cache-Control: max-age`** — por quanto tempo o cliente pode guardar.

**`s-maxage`** — por quanto tempo a CDN pode guardar. Permite a CDN guardar por
muito tempo e o navegador por pouco.

**`private`** — proíbe a CDN de guardar. É o que protege resposta autenticada.

**`stale-while-revalidate`** — a CDN pode servir a versão velha enquanto busca a
nova. Elimina a penalidade de expiração para o usuário.

O último é o mecanismo mais útil e o menos usado: ele dá frescor razoável sem que
ninguém pague a latência da revalidação.

### Invalidação: versionar em vez de purgar

Purgar cache de CDN é lento, tem limite de taxa e frequentemente custa dinheiro.

A técnica que dispensa purga é **versionar a URL**: em vez de invalidar
`/app.css`, publique `/app.a3f9c2.css`. O nome muda quando o conteúdo muda, e a
URL antiga simplesmente deixa de ser referenciada.

É o que geradores de site fazem por padrão, e é a razão de poder configurar cache
de um ano com segurança.

Purga fica para o caso excepcional: conteúdo publicado por engano, correção
urgente.

### CDN não é só cache

CDNs modernas também terminam TLS na borda, comprimem, protegem contra ataques de
volume, e permitem executar lógica na borda.

Terminar TLS perto do usuário reduz o custo do aperto de mão, que é vários
retornos de rede — frequentemente um ganho maior que o do cache em si.

## Modelo Mental

**Se mil usuários recebem a mesma resposta, ela deveria ser servida da borda.** Se
cada um recebe uma diferente, não.

## Quando Usar

- Conteúdo estático: assets, imagens, mídia, downloads.
- Usuários geograficamente distribuídos.
- A banda da origem é custo ou gargalo.
- Páginas públicas idênticas para todos.
- Proteção contra ataques de volume é necessária.

## Quando Não Usar

**Para respostas personalizadas.** Cada usuário recebe uma coisa; taxa de acerto
próxima de zero.

**Para conteúdo autenticado, sem `private`.** Risco de vazamento entre usuários.

**Quando todos os usuários estão perto da origem.** Um sistema interno com
usuários numa cidade não ganha em distância — pode ganhar em banda.

**Para APIs de escrita.** Não há o que cachear, e a CDN adiciona um salto.

**Quando a invalidação seria por purga constante.** Se o conteúdo muda a cada
minuto e não pode ser versionado, a CDN atrapalha.

## Alternativas

- **Cache no navegador** — cabeçalhos HTTP, sem componente algum. É o cache mais
  barato e o primeiro a configurar.
- **[Cache](/05-system-design/caching.md) na aplicação** — para dado dinâmico compartilhado.
- **Réplica de leitura por região** — quando o conteúdo é dinâmico mas
  regionalizado.

## Trade-offs

| Com CDN | Servindo da origem |
|---|---|
| Latência de borda | Latência da distância |
| Origem descarregada | Toda requisição chega |
| Banda de saída barata | Cara na origem |
| Mais um componente e fornecedor | Menos peças |
| Invalidação com atraso | Imediata |
| Risco de servir conteúdo errado | Sem esse risco |

## Modos de Falha

**Resposta autenticada em cache.** Um usuário recebe o dado de outro. O modo mais
grave.

**Cabeçalho de cache ausente.** A CDN aplica um padrão que ninguém escolheu.

**Purga que não propaga.** Conteúdo velho servido em algumas regiões.

**Cache de erro.** Um erro 500 cacheado por horas.

**Origem exposta.** A CDN é contornada indo direto no IP da origem, anulando a
proteção.

## Erros Comuns

**Não usar `private` em resposta autenticada.**

**Depender de purga em vez de versionar URL.**

**Não configurar `stale-while-revalidate`.**

**Cachear erro.** Configure para não cachear respostas de erro, ou com prazo
mínimo.

**Esquecer de bloquear acesso direto à origem.**

## Exemplo Real

Um portal de notícias colocou CDN na frente de tudo, com `max-age` de 5 minutos
uniforme.

Três consequências.

**A boa:** a banda da origem caiu 94% e a latência para leitores fora do estado
caiu de 380 ms para 40 ms.

**A ruim:** a área logada — perfil, comentários, preferências — também passou pela
CDN. Um leitor relatou ver o nome de outra pessoa no cabeçalho. A resposta
autenticada tinha sido cacheada porque não havia `private`.

Foi resolvido em minutos e o incidente exigiu comunicação aos usuários.

**A instrutiva:** matérias corrigidas demoravam 5 minutos para atualizar, e para
correção de erro factual isso era inaceitável. A equipe passou a purgar
manualmente a cada correção, o que era lento e frequentemente esquecido.

A configuração final separou três perfis.

Assets com URL versionada: `max-age` de um ano, imutável.

Conteúdo público: `s-maxage` de 60 segundos com `stale-while-revalidate` de 300 —
a CDN serve a versão anterior enquanto busca a nova, então o usuário nunca espera,
e a atualização chega em cerca de um minuto sem purga.

Área autenticada: `Cache-Control: private, no-store`, e uma regra na CDN que
recusa cachear qualquer resposta com cabeçalho de autenticação — defesa em
profundidade, para o caso de alguém esquecer o cabeçalho de novo.

## Proteger a origem

Uma CDN só descarrega a origem se ninguém puder contorná-la. Se o endereço da
origem for alcançável diretamente, três coisas deixam de valer: a economia de
banda, a proteção contra volume, e as políticas aplicadas na borda.

Três mecanismos, em ordem de força:

**Segredo compartilhado.** A origem só aceita requisições que trazem um cabeçalho
que apenas a CDN conhece. Simples, e depende de rotacionar o segredo.

**Lista de endereços.** A origem só aceita conexões das faixas da CDN, publicadas
pelo provedor. Mais forte, e exige acompanhar mudanças nas faixas.

**Túnel privado.** A origem não tem endereço público; a CDN se conecta por um
canal dedicado. Mais forte de todos, e mais trabalhoso de estabelecer.

O segundo é o mais comum e o mais frequentemente desatualizado — as faixas mudam e
a lista não é revisada, o que causa uma indisponibilidade difícil de diagnosticar.

Vale também considerar o inverso: **o que precisa contornar a CDN**. Verificações
de saúde, ferramentas de implantação e alguns fluxos administrativos costumam
precisar de acesso direto, e essa exceção precisa ser explícita em vez de acidental.

## Conceitos Relacionados

- [Cache](/05-system-design/caching.md) — o conceito geral.
- [Balanceamento de Carga](/05-system-design/load-balancing.md) — distribuição na origem.
- [Nuvem](/09-cloud-architecture/index.md) — regiões e rede.
- [Segurança](/10-security/index.md) — o risco de vazamento por cache.

## Exercício Prático

Verifique os cabeçalhos de cache das respostas do seu sistema — especialmente as
autenticadas.

Qualquer resposta que dependa de quem está logado e não tenha `private` ou
`no-store` é um vazamento esperando uma CDN ou um proxy no caminho.

## Perguntas de Entrevista

- O que decide se um conteúdo cabe em CDN?
- Por que versionar URL é preferível a purgar?
- Qual o risco mais grave de configuração de CDN?

## Para Aprofundar

- Grigorik, Ilya. *High Performance Browser Networking*. O'Reilly, 2013.
- RFC 9111 — HTTP Caching.
