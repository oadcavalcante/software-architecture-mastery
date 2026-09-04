---
id: configuration
title: Configuração
sidebar_position: 19
description: O que varia entre ambientes — e por que tornar configurável é uma decisão, não um default.
doc_type: concept
level: 3
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor separa configuração de segredo e de código, e reconhece
  quando um ponto de configuração não deveria existir.
prerequisites: [components]
related: [secrets, environment-management, feature-flags]
canonical_for: [configuração, variável de ambiente]
content_version: 3
last_reviewed: 2026-08-27
---

# Configuração

## Visão Geral

Configuração é o que muda entre ambientes ou entre execuções sem mudar o código:
endereço do banco, tamanho do pool, timeout, chave de integração.

A pergunta que este documento responde não é como armazenar configuração. É
**o que deveria ser configurável** — porque cada ponto de configuração é um
parâmetro a documentar, testar e errar.

## Problema

Tornar algo configurável parece prudente e tem custo composto.

Cada parâmetro multiplica o espaço de estados possíveis. Dez parâmetros booleanos
são mil combinações, e nenhum time testa mil combinações. As que rodam em
produção são as que alguém configurou; as demais nunca foram exercitadas.

O sintoma tardio: um arquivo de configuração com 80 entradas, das quais 60 têm o
mesmo valor em todos os ambientes desde que foram criadas. Elas não são
configuração — são código com uma camada de indireção.

**Configuração é para o que de fato varia.** O resto é constante.

## Conceitos Centrais

### Três categorias, três tratamentos

| | O que é | Onde vive |
|---|---|---|
| **Constante** | Não varia entre ambientes | No código |
| **Configuração** | Varia entre ambientes | Variável de ambiente ou serviço de configuração |
| **Segredo** | Configuração que não pode vazar | Cofre, injetado em execução |

Segredo é configuração com requisito adicional: nunca em repositório, nunca em
log, rotacionável. Ver [segredos](/10-security/secrets).

O erro frequente é tratar as três igual — constantes viram configuração
desnecessária, e segredos viram variável de ambiente em arquivo versionado.

### Variável de ambiente é o default razoável

Simples, suportada em qualquer plataforma, e separa configuração de artefato — o
mesmo binário roda em qualquer ambiente.

As limitações aparecem quando: a configuração precisa mudar sem reiniciar; há
estrutura aninhada; ou o volume cresce a ponto de a lista virar ingerenciável.

Aí entra um serviço de configuração — que resolve isso e adiciona uma dependência
no caminho de inicialização.

### Falhar rápido na inicialização

Configuração inválida deve derrubar o processo **na subida**, não na primeira
requisição que a usa.

Validar tudo ao iniciar — presença, tipo, faixa — transforma um erro de produção
em um contêiner que não sobe. A diferença é entre um deploy que falha
visivelmente e um sistema que funciona até alguém acessar a funcionalidade
específica.

Um valor padrão perigoso é pior que a ausência: um timeout que assume 30 segundos
porque ninguém configurou esconde o problema até a hora errada.

### Recarga em execução tem custo

Configuração que muda sem reiniciar é atraente e introduz duas coisas: o sistema
passa a ter estado de configuração que pode divergir entre instâncias, e a
mudança deixa de passar pelo processo de implantação — o que significa menos
revisão e menos rastro.

Vale para o que precisa mudar rápido — nível de log, chaves de funcionalidade. Não
vale para o que muda raramente.

Ver [feature flags](/14-devops-and-platform/feature-flags), que é um caso específico
com ferramentas próprias.

### Configuração não é ponto de extensão

Um sistema que tenta absorver toda variação futura por configuração vira um motor
genérico mal documentado. É a degeneração de
[supporting domain](/04-domain-driven-design/supporting-domain.md).

O teste: quantos valores distintos este parâmetro já teve? Se sempre foi um, ele
não estava capturando variação.

## Modelo Mental

**Para cada parâmetro: quantos valores distintos ele tem hoje, somando todos os
ambientes?** Se for um, é constante disfarçada.

## Quando Usar

- O valor genuinamente difere entre ambientes.
- O valor precisa ser ajustado sem novo build — capacidade, timeout.
- É segredo, e não pode estar no código.
- É credencial ou endereço de dependência externa.

## Quando Não Usar

**Para o que não varia.** Constante no código é mais legível e não pode ser mal
configurada.

**Antecipando variação.** Ver [YAGNI](/02-software-design/yagni.md).

**Para regra de negócio.** Uma regra em arquivo de configuração fica fora do
domínio, sem teste e sem revisão.

**Com valor padrão que mascara ausência.** Melhor falhar.

**Para o que muda a cada requisição.** Isso é parâmetro, não configuração.

## Alternativas

- **Constante no código** — para o que não varia.
- **Serviço de configuração** — quando o volume ou a recarga justificam.
- **Cofre de segredos** — para credenciais.
- **Feature flag** — para variação temporária de comportamento.

## Trade-offs

| Mais configurável | Menos configurável |
|---|---|
| Ajuste sem novo build | Exige implantação |
| Mesmo artefato em todo ambiente | Artefato por ambiente |
| Espaço de estados maior | Comportamento previsível |
| Mais a documentar e validar | Menos superfície |
| Risco de configuração errada em produção | Sem esse risco |

## Modos de Falha

**Configuração ausente com padrão perigoso.** Funciona até não funcionar.

**Divergência entre ambientes.** Homologação e produção com valores diferentes que
ninguém comparou.

**Segredo em repositório.** Uma vez comitado, está no histórico para sempre.

**Segredo em log.** Um despejo de configuração na inicialização vaza tudo.

**Configuração divergente entre instâncias.** Com recarga, uma instância atualizou
e outra não.

**Parâmetro órfão.** Ninguém sabe o que faz nem quem o usa.

## Erros Comuns

**Não validar na inicialização.** A configuração errada só se manifesta quando o caminho que a usa é exercido — às vezes semanas depois, em produção, num fluxo raro. Validar tudo ao subir converte isso em falha imediata e visível.

**Padrão para o que deveria ser obrigatório.** Um valor padrão para endereço de banco ou chave de integração faz o serviço subir apontando para o lugar errado em vez de recusar-se a subir.

**Registrar configuração em log sem mascarar.** O despejo de configuração na inicialização é prática comum e útil — e leva senha e chave para o sistema de logs, que costuma ter retenção longa e acesso mais amplo que o do segredo.

**Colocar regra de negócio em configuração.** Regra em arquivo de configuração escapa de revisão de código, de teste e de histórico. O que parecia flexibilidade vira mudança de comportamento sem rastro.

**Não remover parâmetros que deixaram de ser usados.** Sobram como armadilha: alguém ajusta um valor esperando efeito, não obtém nenhum, e passa horas investigando o lugar errado.

## Exemplo Real

Um sistema tinha 94 parâmetros de configuração acumulados em quatro anos.

Uma auditoria comparou os valores nos três ambientes e cruzou com o uso no código.

**61 tinham o mesmo valor em todos os ambientes** desde a criação. Eram
constantes com indireção.

**Sete não eram lidos por nenhum código.** Restos de funcionalidades removidas.

**Quatro tinham valor padrão que mascarava ausência.** Um deles era o timeout de
uma integração: se a variável faltasse, assumia 60 segundos. Numa migração de
ambiente, ela faltou, e o timeout de 60 segundos — contra o de 5 esperado —
segurou conexões até esgotar o pool. O incidente durou 25 minutos.

**Três eram segredos em arquivo versionado.** Rotação obrigatória, e o histórico
do repositório precisou ser tratado.

A limpeza deixou 23 parâmetros. Os 61 viraram constantes, os 7 foram removidos, os
4 padrões perigosos viraram obrigatórios com validação na inicialização, e os
segredos foram para o cofre.

A mudança mais valiosa foi a validação: o processo agora falha ao subir se
qualquer configuração obrigatória estiver ausente ou fora da faixa. O erro que
custou 25 minutos passaria a ser um contêiner que não sobe — visível na primeira
tentativa de implantação.

## Configuração em contêiner

Contêineres mudam duas premissas sobre configuração, e ignorar isso produz
problemas específicos.

**O mesmo artefato roda em todo ambiente.** A imagem é construída uma vez e
promovida. Isso significa que **nenhuma configuração de ambiente pode estar na
imagem** — nem arquivo, nem valor embutido no build. Se a imagem de homologação é
diferente da de produção, o que se testou não é o que se implantou.

**O sistema de arquivos é efêmero.** Configuração escrita em disco no primeiro uso
some no próximo contêiner.

As formas que funcionam: variável de ambiente injetada na execução, arquivo montado
pela plataforma, ou consulta a um serviço de configuração na inicialização.

Segredos merecem tratamento à parte. Variável de ambiente é conveniente e vaza com
facilidade: aparece em despejo de processo, em ferramentas de inspeção, e em log de
inicialização que registra o ambiente. Onde a plataforma oferece montagem de
segredo como arquivo com permissão restrita, isso é preferível.

E há um detalhe que causa incidente: **a plataforma pode limitar o tamanho** da
configuração injetada. Uma configuração que cresce até estourar o limite produz um
contêiner que não sobe, com mensagem que não menciona configuração.

## Conceitos Relacionados

- [Gestão de Estado](/05-system-design/state-management.md) — configuração é estado de inicialização.
- [Segurança](/10-security/index.md) — gestão de segredos.
- [DevOps e Plataforma](/14-devops-and-platform/index.md) — ambientes e feature
  flags.
- [YAGNI](/02-software-design/yagni.md) — configuração especulativa.

## Exercício Prático

Liste os parâmetros de configuração do seu sistema e, para cada um, compare o
valor nos ambientes.

Os que têm o mesmo valor em todos são candidatos a constante. Os que não aparecem
em nenhum código são lixo. Os que têm padrão silencioso são o próximo incidente.

## Perguntas de Entrevista

- O que distingue constante, configuração e segredo?
- Por que validar configuração na inicialização?
- Por que um valor padrão pode ser pior que a ausência?

## Para Aprofundar

- Wiggins, Adam. *The Twelve-Factor App*, 2011 — o fator de configuração.
- OWASP — *Secrets Management Cheat Sheet*.
