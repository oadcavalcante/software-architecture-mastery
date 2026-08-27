---
id: containers-in-delivery
title: Contêineres na Entrega
sidebar_position: 3
description: O artefato imutável que atravessa os ambientes — construído uma vez, promovido, nunca reconstruído.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor promove o mesmo artefato entre ambientes e garante que o que
  foi testado é o que roda.
prerequisites: [ci-cd]
related: [ci-cd, environment-management, supply-chain-security]
canonical_for: [promoção de artefato, construção única, artefato imutável, registro de artefatos]
content_version: 1
last_reviewed: 2026-08-28
---

# Contêineres na Entrega

## Visão Geral

Os fundamentos de contêineres estão em
[contêineres](../09-cloud-architecture/containers.md). Aqui interessa o papel deles na
entrega: **o artefato imutável que atravessa os ambientes**.

A regra que organiza tudo: **construa uma vez, promova o mesmo artefato**.

Se o binário que vai para produção é reconstruído a partir do código, ele não é o que foi
testado — ele é outro binário, construído em outro momento, com dependências que podem
ter mudado.

## Problema

O padrão comum: a esteira constrói para teste, testa, aprova; e depois constrói de novo
para produção.

Entre as duas construções, coisas mudam:

```text
uma dependência transitiva com faixa aberta publicou versão nova
a imagem base recebeu atualização
uma ferramenta de construção foi atualizada
uma variável de ambiente da esteira mudou
```

O artefato que vai a produção é diferente do testado, de formas que ninguém consegue
enumerar. E quando ele quebra, a hipótese "mas passou em teste" está tecnicamente
errada — o que passou foi outro.

## Conceitos Centrais

### Construir uma vez, promover

```text
1. constrói uma imagem, com identificador único
2. testa essa imagem
3. promove a mesma imagem para o ambiente seguinte
4. o que vai a produção tem o mesmo digest do que foi testado
```

A promoção é uma mudança de referência, não uma reconstrução. Ver
[gestão de ambientes](environment-management.md).

Isso exige que a imagem não contenha nada específico de ambiente — o que leva ao ponto
seguinte.

### Configuração vem de fora

Se a imagem carrega a configuração de produção, ela não pode ser testada em outro
ambiente.

```text
na imagem     código, dependências, tempo de execução
de fora       endereços, credenciais, limites, flags, nível de log
```

Ver [PaaS](../09-cloud-architecture/paas.md) — as doze regras, cujo item de configuração
existe exatamente por isso.

O erro característico: imagens separadas por ambiente. Além de quebrar a promoção, ele
multiplica as construções e cria divergência que ninguém rastreia.

### Referência por digest, não por etiqueta

```text
etiqueta   servico:v2.3 — pode ser reapontada para outra imagem
digest     servico@sha256:abc... — imutável, é aquele conteúdo
```

Uma etiqueta é um ponteiro. Duas implantações da mesma etiqueta podem rodar códigos
diferentes.

Em produção, a referência precisa ser por digest — é o que torna a implantação
reproduzível e o que permite afirmar que o que roda é o que foi aprovado.

Ver [contêineres](../09-cloud-architecture/containers.md).

### O registro de artefatos é infraestrutura crítica

Todas as implantações dependem dele. Isso impõe:

```text
disponibilidade      ele fora significa nenhuma implantação
retenção             imagens antigas precisam existir para reverter
imutabilidade        uma etiqueta publicada não deve ser sobrescrita
limpeza              imagens acumulam e custam
acesso               quem publica, quem consome
```

A segunda linha é operacionalmente importante: uma política de limpeza que remove imagens
com mais de 30 dias impede reverter para uma versão mais antiga que isso.

E a terceira previne uma classe de ataque: sobrescrever uma etiqueta já verificada com
outro conteúdo. Ver
[segurança da esteira](supply-chain-security.md).

### Construção reprodutível é o ideal, e o mínimo é fixar

Construção reprodutível — mesma entrada, mesmo artefato byte a byte — permite verificar
independentemente que o binário corresponde ao código.

Ela é difícil de alcançar completamente. O mínimo praticável:

```text
versões fixas de dependências, com arquivo de bloqueio versionado
imagem base por digest, não por etiqueta
ferramentas de construção com versão declarada
sem acesso à rede na etapa de construção final
```

A última é a mais eficaz e a menos comum: uma construção que baixa coisas da internet não
é reproduzível por definição.

### Múltiplos estágios reduzem o que vai a produção

```text
estágio de construção   compilador, ferramentas, dependências de desenvolvimento
estágio final           apenas o binário e o que ele precisa para rodar
```

O ganho é de tamanho, de superfície de ataque e de tempo de implantação. Ver
[contêineres](../09-cloud-architecture/containers.md).

E há um ganho de entrega frequentemente esquecido: imagens menores são baixadas mais
rápido, o que reduz o tempo de implantação e de escalonamento — o que importa em
[implantação em ondas](rolling-deployments.md).

### Camadas e cache decidem o tempo de construção

A ordem das instruções decide se a reconstrução aproveita cache:

```text
ruim   copiar o código, depois instalar dependências
       → toda alteração de código reinstala tudo
bom    copiar o manifesto, instalar dependências, depois copiar o código
       → alteração de código reaproveita a camada de dependências
```

Essa inversão costuma reduzir o tempo de construção em uma ordem de grandeza — e o tempo
da esteira é o que decide se as pessoas integram com frequência. Ver
[integração contínua](ci-cd.md).

### O tempo de download entra na conta de disponibilidade

Uma dimensão frequentemente ignorada: o tamanho da imagem afeta o tempo de recuperação,
não só o de implantação.

```text
imagem de 900 MB   ~90 s para baixar num nó novo
imagem de 60 MB    ~8 s
```

Isso importa em três momentos:

**Escalonamento sob pico.** A instância nova demora a entrar na rotação. Ver
[escala horizontal](../11-scalability/horizontal-scaling.md).

**Substituição de nó.** Uma falha de instância leva mais tempo para ser reposta.

**Implantação em ondas.** O tempo total é multiplicado pelo número de ondas. Ver
[implantação em ondas](rolling-deployments.md).

E há um agravante: nós novos frequentemente não têm a imagem em cache local, então o
pior caso — download completo — acontece exatamente quando há pressão.

Reduzir a imagem é, portanto, uma decisão de confiabilidade tanto quanto de custo.

## Modelo Mental

**Construa uma vez, promova o mesmo artefato.** Se o que vai a produção foi
reconstruído, ele não é o que foi testado.

## Quando Usar

- Sempre que houver mais de um ambiente.
- Onde a rastreabilidade entre código e produção importa.
- Onde a reversão precisa ser confiável.
- Com implantação frequente.

## Quando Não Usar

**Reconstruindo por ambiente.**

**Com configuração embutida na imagem.**

**Referenciando por etiqueta móvel em produção.**

**Com retenção que impede reverter.**

**Permitindo sobrescrita de etiquetas publicadas.**

**Sem fixar versões de dependências.**

## Alternativas

- **Pacotes versionados** — para linguagens e contextos em que contêiner não se aplica.
- **Imagens de máquina** — o mesmo princípio, no nível da máquina virtual.
- **Artefato de aplicação promovido** — o binário, sem contêiner, com o ambiente
  provisionado à parte.

O princípio — construir uma vez, promover — vale para todos; contêiner é a forma mais
comum de aplicá-lo.

## Trade-offs

| Construir uma vez | Reconstruir por ambiente |
|---|---|
| O testado é o que roda | Artefatos diferentes |
| Configuração externa obrigatória | Pode ser embutida |
| Registro necessário | Não |
| Reversão confiável | Reconstrução da versão antiga |

| Digest | Etiqueta |
|---|---|
| Reproduzível | Pode mudar |
| Menos legível | Legível |

## Modos de Falha

**Artefato diferente em produção.** Reconstruído.

**Etiqueta reapontada.** Duas implantações, códigos diferentes.

**Imagem não disponível para reverter.** Limpeza removeu.

**Registro indisponível.** Nenhuma implantação possível.

**Configuração embutida.** A imagem não pode ser promovida.

**Construção lenta.** Ordem de camadas ruim, e a esteira desencoraja integração.

**Imagem inchada.** Implantação e escalonamento lentos.

## Erros Comuns

**Reconstruir para produção.**

**Etiqueta móvel em produção.**

**Configuração na imagem.**

**Não fixar imagem base por digest.**

**Política de retenção que impede reversão.**

**Ordem de camadas ignorando o cache.**

## Exemplo Real

Uma empresa de tecnologia tinha uma esteira que construía a imagem três vezes: uma para
testes, uma para homologação, uma para produção.

Um incidente expôs o problema. Uma implantação em produção falhou ao iniciar, com um
erro que não aparecia em nenhum ambiente anterior.

A causa: uma dependência transitiva com faixa de versão aberta tinha publicado uma
versão nova entre a construção de homologação e a de produção — cerca de 40 minutos de
diferença.

A versão nova tinha uma mudança incompatível. O código era o mesmo; o artefato, não.

As correções:

**Construção única**, com o digest promovido entre ambientes. A esteira passou a construir
uma vez e a promover a referência.

**Configuração externalizada.** Três imagens diferentes existiam porque cada uma
embutia a configuração do ambiente. Isso foi movido para variáveis e para um gerenciador
de segredos.

**Versões fixas** com arquivo de bloqueio versionado, e imagem base por digest.

**Sem rede na construção final.** Todas as dependências resolvidas numa etapa anterior,
com cache interno.

**Retenção de 180 dias** no registro, substituindo os 30 anteriores — que impediam
reverter para versões mais antigas.

**Imutabilidade de etiquetas** habilitada no registro.

E uma otimização que veio junto: a ordem das camadas foi corrigida, e o tempo de
construção caiu de 11 minutos para 90 segundos. Isso reduziu o tempo total da esteira e
teve efeito direto na frequência de integração. Ver
[integração contínua](ci-cd.md).

O que a equipe registra: a construção múltipla existia porque as imagens continham
configuração — a causa raiz era essa, e ela tinha sido tratada como conveniência por
anos.

## Conceitos Relacionados

- [Contêineres](../09-cloud-architecture/containers.md) — os fundamentos.
- [Integração Contínua](ci-cd.md).
- [Gestão de Ambientes](environment-management.md) — a promoção.
- [Segurança da Esteira](supply-chain-security.md).

## Exercício Prático

Verifique se o artefato que roda em produção tem o mesmo digest do que foi testado em
homologação.

Se ele foi reconstruído, você não pode afirmar que o que passou nos testes é o que está
rodando.

## Perguntas de Entrevista

- Por que reconstruir por ambiente invalida os testes?
- Por que referenciar por digest em produção?
- Por que a ordem das camadas afeta a frequência de integração?

## Para Aprofundar

- Humble, Jez; Farley, David. *Continuous Delivery*. Addison-Wesley, 2010.
- Rice, Liz. *Container Security*. O'Reilly, 2020.
- Reproducible Builds — reproducible-builds.org.
