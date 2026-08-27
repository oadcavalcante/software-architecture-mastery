---
id: debuggability
title: Depurabilidade
sidebar_position: 11
description: Responder perguntas que ninguém antecipou — a propriedade que se projeta no sistema, não na ferramenta.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta sistemas que emitem contexto suficiente para
  investigar o não previsto.
prerequisites: [observability]
related: [logs, traces, correlation-ids]
canonical_for: [depurabilidade, pergunta não antecipada, alta cardinalidade, contexto de execução]
content_version: 1
last_reviewed: 2026-08-28
---

# Depurabilidade

## Visão Geral

Depurabilidade é a capacidade de responder perguntas sobre o comportamento do sistema
que **ninguém antecipou**.

É a diferença prática entre monitoramento e observabilidade, e ela é uma propriedade do
**sistema**, não da ferramenta: um sistema que não emite contexto não fica investigável
porque alguém comprou uma plataforma.

O teste: durante um incidente, você consegue formular uma pergunta nova e obter a
resposta em minutos? Ou só consegue consultar o que já estava previsto?

## Problema

A instrumentação típica antecipa perguntas: taxa de erro por serviço, latência por rota,
uso de recursos.

Essas perguntas cobrem os incidentes previstos — que, por serem previstos, já foram
mitigados. Ver [resiliência](../12-reliability/resilience.md).

Os incidentes que causam dano vêm de combinações não antecipadas, e as perguntas que
eles exigem são específicas:

```text
"os pedidos de clientes do plano empresarial, na região sul, com mais de 5 itens,
 estão falhando desde a implantação de ontem?"
```

Nenhum painel responde isso. Ou o sistema emite os dados que permitem construir essa
consulta, ou a investigação para.

## Conceitos Centrais

### Alta cardinalidade é o requisito

A propriedade que permite perguntas específicas: poder filtrar e agrupar por campos com
muitos valores distintos.

```text
baixa cardinalidade   rota, status, região, versão — poucos valores
alta cardinalidade    usuário, pedido, sessão, dispositivo, valor — muitos
```

[Métricas](metrics.md) não suportam alta cardinalidade — é o que as torna baratas. Ver
o custo de cardinalidade lá.

Isso significa que a depurabilidade vem de [logs](logs.md) e [traces](traces.md), não de
métricas. Um sistema com métricas excelentes e logs pobres detecta problemas e não os
investiga.

E não basta que os campos existam: eles precisam ser **consultáveis** — indexados, ou
num sistema que permita filtrar por eles sem varrer tudo.

### Contexto amplo por evento

O contrário da instrumentação mínima: cada unidade de trabalho emite um evento com
**muitos** campos.

```text
identificadores    correlação, trace, requisição
quem               usuário, organização, plano, papel
o quê              rota, operação, recurso afetado
resultado          sucesso ou erro, motivo específico
quanto             duração total e por dependência, tamanhos, contagens
onde               instância, região, zona, versão do código
como chegou        cliente, versão do aplicativo, origem
decisões           qual caminho de código, quais regras aplicaram
```

Ver [logs](logs.md) — o evento canônico. Trinta ou quarenta campos por evento parece
excessivo até a primeira investigação em que a pergunta certa depende do campo que
ninguém coletou.

O critério não é "isto será útil?" — é "isto poderia distinguir esta execução de
outra?".

### Explorar sem saber o que procurar

A investigação de um problema não previsto segue um padrão:

```text
1. observar o sintoma
2. formular uma hipótese
3. testar com uma consulta
4. refinar ou descartar
5. repetir
```

Isso exige poder consultar de forma arbitrária — agrupar por qualquer campo, comparar
grupos, encontrar o que distingue as execuções problemáticas das normais.

Ferramentas que só exibem gráficos pré-configurados não suportam esse ciclo. E o ciclo
precisa ser **rápido**: se cada consulta leva cinco minutos, a investigação morre por
atrito.

### Emitir versão e configuração

Dois campos que resolvem uma fração alta das investigações e frequentemente faltam:

**Versão do código.** Permite comparar comportamento entre versões, e correlacionar com
implantações.

**Configuração efetiva.** Qual valor de tempo limite, qual funcionalidade ativa, qual
variante de experimento.

Com eles, a pergunta "isso começou depois da implantação de ontem?" vira uma consulta.
Sem eles, vira arqueologia.

Ver [painéis](dashboards.md) — anotar implantações resolve a versão visualmente; ter o
campo resolve analiticamente.

### Depurabilidade se projeta, não se compra

O que o sistema precisa fazer, e nenhuma ferramenta faz por ele:

```text
propagar contexto            ver identificadores de correlação
emitir eventos ricos         com os campos que distinguem execuções
registrar decisões           qual caminho, por quê
expor estado interno         endpoints de diagnóstico, quando seguro
marcar erros com precisão    motivo específico, não "falhou"
```

O terceiro item é o mais negligenciado: um sistema que toma decisões — escolher uma
rota, aplicar uma regra, selecionar uma variante — e não registra qual foi tomada é
opaco por construção.

### Depurar em produção não é opcional

Ambientes de teste não reproduzem carga, dados, concorrência nem as dependências reais.

Uma fração dos problemas só existe em produção, e alguns só existem para um subconjunto
de usuários, em condições que ninguém consegue recriar.

Isso significa que as ferramentas de investigação precisam funcionar **em produção**,
com segurança:

```text
consulta a eventos          sem impacto na aplicação
depuração por requisição    ativável por cabeçalho. Ver logs
perfilamento contínuo       amostragem de baixo impacto
endpoints de diagnóstico    protegidos, com dados sanitizados
```

## Modelo Mental

**Depurabilidade é a capacidade de perguntar coisas novas.** Ela depende de o sistema
emitir contexto suficiente — a ferramenta só consulta o que existe.

## Quando Usar

- Sistemas distribuídos com muitas interações.
- Onde incidentes não antecipados são esperados — ou seja, sempre.
- Onde o tempo de investigação tem custo.
- Sistemas com muitos clientes e comportamentos heterogêneos.

## Quando Não Usar

**Confiando em métricas** para investigar o individual.

**Com eventos pobres.** Poucos campos limitam as perguntas possíveis.

**Sem consulta ad hoc.** Só painéis pré-configurados.

**Sem propagação de contexto.**

**Sem poder investigar em produção.**

**Emitindo dado sensível** para ganhar contexto. Ver
[proteção de dados](../10-security/data-protection.md).

## Alternativas

Não há alternativa — há graus:

- **Correlação mínima** — o mínimo viável, muito melhor que nada.
- **Evento canônico** — o maior salto de capacidade por esforço.
- **Rastreamento distribuído** — para estrutura e tempo.
- **Perfilamento contínuo** — para o tempo dentro do processo.

## Trade-offs

| Alta depurabilidade | Instrumentação mínima |
|---|---|
| Perguntas novas respondidas | Só as previstas |
| Custo de telemetria maior | Menor |
| Investigação em minutos | Horas ou impossível |
| Exige disciplina de emissão | Nenhuma |

| Alta cardinalidade | Baixa |
|---|---|
| Filtra por qualquer campo | Só os previstos |
| Logs e traces | Métricas |
| Custo por evento | Constante |

## Modos de Falha

**Campo que faltava.** A pergunta certa não pode ser respondida.

**Consulta lenta.** A investigação morre por atrito.

**Contexto perdido em salto assíncrono.**

**Decisão não registrada.** Não se sabe por que o sistema fez o que fez.

**Só investigável em ambiente de teste**, onde o problema não acontece.

**Dado sensível coletado** para ganhar contexto.

**Retenção curta.** O problema foi descoberto depois que os dados expiraram.

## Erros Comuns

**Depender de métricas** para investigar casos individuais.

**Eventos com poucos campos.**

**Não registrar versão e configuração.**

**Não registrar decisões tomadas.**

**Não ter forma de ativar detalhe por requisição.**

**Comprar ferramenta esperando que ela resolva** o que o sistema não emite.

## Exemplo Real

Uma plataforma de assinaturas tinha um problema que resistiu três meses: cerca de 0,3%
das renovações falhavam, sem padrão aparente.

As métricas mostravam a taxa de falha e nada mais. Os logs registravam "falha ao
renovar assinatura" com o identificador da assinatura, e nada mais.

Cada tentativa de investigação seguia o mesmo caminho: pegar alguns casos, olhar os
dados manualmente, não encontrar padrão, desistir.

A mudança que resolveu não foi de ferramenta:

**Evento canônico** para a renovação, com 31 campos: plano, valor, método de pagamento,
país, moeda, dias desde a última renovação, tentativa número, provedor de pagamento
usado, variante de experimento ativa, versão do código, região.

Duas semanas depois de instrumentar, a primeira consulta exploratória encontrou:

```text
agrupar falhas por provedor de pagamento e moeda
  → 94% das falhas: provedor B, moeda diferente da conta
```

O problema: assinaturas com moeda diferente da configuração padrão da conta, processadas
pelo provedor B, falhavam por um erro de arredondamento na conversão.

Isso era 0,3% do total e 100% de um subconjunto específico — invisível em qualquer
agregação que não separasse por provedor e moeda simultaneamente.

Nenhuma métrica com essa combinação existia, e criar todas as combinações possíveis
teria explodido a cardinalidade. Ver [métricas](metrics.md).

Dois outros achados vieram da mesma instrumentação, nas semanas seguintes:

**Variante de experimento.** Uma variante ativa em 5% dos usuários causava latência
elevada — o campo de experimento tornou isso uma consulta.

**Versão de aplicativo.** Uma versão antiga do aplicativo móvel enviava um campo em
formato diferente, causando falhas silenciosas. O campo de versão do cliente revelou a
correlação imediatamente.

O que a equipe registra: três meses de investigação sem resultado, resolvidos em duas
semanas — não por uma ferramenta nova, mas por o sistema passar a emitir os campos que
distinguem uma execução de outra.

## Conceitos Relacionados

- [Logs](logs.md) — o evento canônico.
- [Traces](traces.md) — a estrutura.
- [Identificadores de Correlação](correlation-ids.md).
- [Métricas](metrics.md) — o que ela não faz.

## Exercício Prático

Pegue o último incidente do seu sistema e liste as perguntas que foram feitas durante a
investigação.

Para cada uma, verifique: os dados para respondê-la existiam? As que não existiam
apontam os campos que faltam na sua instrumentação.

## Perguntas de Entrevista

- Por que depurabilidade é propriedade do sistema, não da ferramenta?
- Por que alta cardinalidade é o requisito central?
- Por que registrar decisões tomadas importa?

## Para Aprofundar

- Majors, Charity et al. *Observability Engineering*. O'Reilly, 2022.
- Sridharan, Cindy. *Distributed Systems Observability*. O'Reilly, 2018.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
