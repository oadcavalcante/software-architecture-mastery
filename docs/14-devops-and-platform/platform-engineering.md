---
id: platform-engineering
title: Engenharia de Plataforma
sidebar_position: 10
description: Tratar infraestrutura interna como produto — e por que a plataforma que ninguém usa é pior que nenhuma.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia se uma plataforma interna se justifica e o que ela
  precisa para ser adotada.
prerequisites: [devops-and-platform]
related: [internal-developer-platforms, sre-concepts, ci-cd]
canonical_for: [engenharia de plataforma, plataforma como produto, caminho pavimentado, carga cognitiva]
content_version: 1
last_reviewed: 2026-08-28
---

# Engenharia de Plataforma

## Visão Geral

Engenharia de plataforma é a disciplina de construir capacidades internas — esteiras,
infraestrutura, observabilidade, padrões — como **produto**, com usuários internos que
escolhem usá-lo.

A palavra que faz a diferença é *escolhem*. Uma plataforma obrigatória que não resolve
o problema das pessoas vira obstáculo com boas intenções.

E a razão de ela existir: sem plataforma, cada time resolve os mesmos problemas
separadamente, e a carga cognitiva de operar consome a capacidade de construir produto.

## Problema

O movimento de dar autonomia operacional aos times — cada time constrói e opera o que
constrói — resolve um problema e cria outro.

Cada time precisa saber: contêineres, orquestração, rede, identidade, telemetria,
esteiras, custo, segurança. Ver
[Kubernetes](../09-cloud-architecture/kubernetes.md) e
[identidade em nuvem](../09-cloud-architecture/cloud-identity.md).

Multiplicado por doze times, isso é doze vezes o mesmo aprendizado, doze configurações
divergentes, e uma carga que compete diretamente com a construção do produto.

A resposta errada é centralizar a operação de volta — recriando a divisão que a autonomia
queria eliminar. Ver
[conceitos de SRE](../13-observability/sre-concepts.md).

## Conceitos Centrais

### Caminho pavimentado, não trilho

A metáfora que define a abordagem:

```text
trilho             o único caminho permitido, obrigatório
caminho pavimentado o caminho fácil, com suporte, que a maioria escolhe
                    sair dele é possível, e custa
```

O caminho pavimentado entrega: implantação pronta, telemetria configurada, esteira
funcionando, padrões de segurança aplicados — sem que o time precise montar nada.

Times com necessidade genuína de sair podem sair, assumindo o trabalho que a plataforma
fazia por eles. Isso é o que evita que a plataforma vire gargalo para os casos que ela
não previu.

E é o que dá o sinal de qualidade: se todos saem do caminho pavimentado, ele não está
resolvendo o problema.

### A plataforma é produto, com usuários que podem recusar

As consequências de levar isso a sério:

```text
pesquisa de necessidade     antes de construir
adoção como métrica         não "quantos são obrigados", "quantos escolhem"
documentação e exemplos     como qualquer produto
suporte                     alguém responde quando quebra
roteiro público             os usuários sabem o que vem
depreciação com prazo       não se remove o que os times dependem
```

A segunda linha é o teste. Uma plataforma com adoção obrigatória e satisfação baixa está
falhando, e a obrigatoriedade esconde o sinal.

### Reduzir carga cognitiva é o objetivo

O critério para decidir o que a plataforma faz:

```text
faz sentido    o que todo time precisa e nenhum quer construir
               esteira, observabilidade, implantação, segredos, ambientes
não faz        o que é específico do domínio de cada time
               modelo de dados, regras de negócio, decisões de produto
```

E há uma armadilha: uma plataforma que abstrai demais impede os times de entender o que
acontece — e, quando algo quebra, ninguém sabe diagnosticar.

A abstração precisa ser **transparente**: esconder a complexidade no caminho normal, e
permitir descer quando necessário.

### O tamanho decide se ela se justifica

```text
até 3 ou 4 times     convenções e um repositório de exemplos bastam
5 a 15 times         uma ou duas pessoas dedicadas, tempo parcial
15+ times            time de plataforma dedicado
```

Criar um time de plataforma cedo demais produz uma plataforma para um problema que ainda
não existe — e ela precisa ser mantida, evoluída e migrada quando o problema real
aparecer.

E a plataforma precisa ser **menor** que o problema que resolve. Uma equipe de seis
pessoas construindo plataforma para oito times de produto costuma indicar que o alvo
está errado.

### O time de plataforma não opera os serviços dos outros

A distinção que evita recriar a divisão:

```text
plataforma constrói    ferramentas, padrões, automação
times de produto usam  e operam os próprios serviços
```

Se o time de plataforma vira o operador de todos os serviços, a autonomia acaba e o
gargalo volta.

Ver [conceitos de SRE](../13-observability/sre-concepts.md) — é o mesmo erro estrutural.

### Medir o que importa

```text
adoção voluntária         quantos times escolhem o caminho pavimentado
tempo até o primeiro deploy  um serviço novo, do zero à produção
tempo de esteira          o atrito diário
satisfação                pesquisa periódica, com ação
carga operacional dos times  quanto tempo eles gastam em infraestrutura
```

A segunda é o indicador mais direto: se criar um serviço novo com tudo configurado leva
duas semanas, a plataforma não está entregando.

## Modelo Mental

**Plataforma é produto com usuários internos.** Se eles pudessem escolher, escolheriam?
Se a resposta for não, a obrigatoriedade está escondendo o problema.

## Quando Usar

- Muitos times resolvendo os mesmos problemas de infraestrutura.
- Carga operacional consumindo capacidade de produto.
- Divergência entre times causando problemas de segurança ou de operação.
- Onde a padronização tem valor — auditoria, conformidade.

## Quando Não Usar

**Com poucos times.** Convenções bastam.

**Como obrigatoriedade** sem qualidade que sustente a escolha.

**Operando os serviços dos outros times.**

**Abstraindo a ponto de ninguém conseguir diagnosticar.**

**Sem métrica de adoção voluntária.**

**Construindo o que é específico de domínio.**

## Alternativas

- **Convenções e exemplos** — repositórios modelo, documentação. Barato e suficiente
  para organizações pequenas.
- **Bibliotecas compartilhadas** — sem plataforma, com padrões em código.
- **Plataforma comercial** — comprar em vez de construir. Ver
  [SaaS](../09-cloud-architecture/saas.md).
- **Time de habilitação** — ajuda os times a resolverem, em vez de resolver por eles.

A última é frequentemente melhor no início: ela transfere capacidade em vez de criar
dependência.

## Trade-offs

| Com plataforma | Cada time por si |
|---|---|
| Padronização | Divergência |
| Carga cognitiva menor | Cada time aprende tudo |
| Time dedicado a manter | Sem custo fixo |
| Risco de gargalo | Autonomia total |
| Abstração a entender | Ferramentas diretas |

| Caminho pavimentado | Obrigatório |
|---|---|
| Sinal de qualidade | Escondido |
| Casos especiais atendidos | Gargalo |
| Exige qualidade real | Adoção garantida |

## Modos de Falha

**Plataforma que ninguém quer usar.**

**Gargalo.** Toda mudança depende do time de plataforma.

**Abstração opaca.** Quebrou, e ninguém sabe por quê.

**Plataforma maior que o problema.**

**Time de plataforma operando serviços alheios.**

**Sem depreciação planejada.** Coisas antigas mantidas para sempre.

**Construída sem falar com os usuários.**

## Erros Comuns

**Criar time de plataforma cedo demais.**

**Tornar obrigatório em vez de bom.**

**Medir adoção forçada.**

**Abstrair sem permitir descer.**

**Não ter suporte nem documentação.**

**Assumir a operação dos serviços dos outros.**

## Exemplo Real

Uma empresa com 14 times de produto criou um time de plataforma de seis pessoas, com o
mandato de padronizar a infraestrutura.

A primeira versão foi construída em oito meses, sem consultar os times. Ela abstraía
completamente a orquestração por trás de um arquivo de configuração próprio.

A adoção, um ano depois: **3 dos 14 times**.

Os motivos, coletados em entrevistas:

**Não resolvia o problema deles.** A plataforma cuidava de implantação, e a dor principal
dos times era ambiente de teste e observabilidade.

**Abstração opaca.** Quando algo quebrava, o erro vinha da camada de abstração e não
apontava para nada acionável.

**Sem saída.** Um time com necessidade específica não conseguia sair parcialmente — era
tudo ou nada.

**Sem suporte.** Perguntas ficavam dias sem resposta.

A reformulação mudou a abordagem antes de mudar a tecnologia:

**Pesquisa com os 14 times**, perguntando onde o tempo era gasto. O resultado
contradisse a hipótese: implantação era o quarto item; ambientes efêmeros e
observabilidade eram o primeiro e o segundo.

**Redirecionamento.** A plataforma passou a entregar ambientes efêmeros e telemetria
padronizada — o que os times pediam.

**Caminho pavimentado, não trilho.** A abstração passou a ser um modelo que gera a
configuração real, visível e editável. Times podem sair do modelo mantendo o que ele
gerou.

**Suporte com compromisso** de resposta, e um canal dedicado.

**Adoção voluntária como métrica**, revisada trimestralmente com os times.

Dezoito meses depois: 13 dos 14 times no caminho pavimentado, por escolha. O time que
ficou fora tem um requisito de latência que a plataforma não atende — e isso é
considerado aceitável.

E o time de plataforma reduziu de seis para quatro pessoas, porque parte do trabalho
inicial era manter a abstração própria que foi abandonada.

O que a equipe registra: oito meses foram gastos construindo a solução para o problema
errado. A pesquisa que redirecionou tudo levou duas semanas e poderia ter sido feita
antes.

## Conceitos Relacionados

- [Plataformas Internas](internal-developer-platforms.md) — a implementação.
- [Conceitos de SRE](../13-observability/sre-concepts.md).
- [Gestão de Ambientes](environment-management.md).
- [Integração Contínua](ci-cd.md).

## Exercício Prático

Pergunte aos times de produto onde o tempo deles é gasto fora da construção de
funcionalidades.

Compare com o que a sua plataforma — ou o seu plano de plataforma — resolve. A diferença
é o desalinhamento.

## Perguntas de Entrevista

- Qual a diferença entre caminho pavimentado e trilho?
- Por que adoção voluntária é a métrica que importa?
- Por que o time de plataforma não deve operar os serviços dos outros?

## Para Aprofundar

- Skelton, Matthew; Pais, Manuel. *Team Topologies*. IT Revolution, 2019.
- Bottcher, Evan. *What I Talk About When I Talk About Platforms*, 2018.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
