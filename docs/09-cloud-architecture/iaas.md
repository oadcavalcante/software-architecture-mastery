---
id: iaas
title: IaaS
sidebar_position: 1
description: Alugar infraestrutura crua — o modelo com mais controle e mais trabalho, e onde ele ainda é a resposta.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor reconhece o que IaaS transfere e o que continua sendo
  responsabilidade sua, e evita usá-lo como padrão por hábito.
prerequisites: [cloud-architecture]
related: [paas, managed-services, cloud-compute]
canonical_for: [IaaS, infraestrutura como serviço, modelo de responsabilidade compartilhada]
content_version: 1
last_reviewed: 2026-08-27
---

# IaaS

## Visão Geral

IaaS — infraestrutura como serviço — é alugar os blocos crus: máquinas virtuais,
discos, redes, endereços.

O provedor cuida do datacenter, do hardware e da camada de virtualização. Do
sistema operacional para cima, é tudo seu.

É o modelo com mais controle e mais trabalho. Ele continua sendo a resposta certa
para casos específicos, e é frequentemente escolhido por hábito quando um modelo
mais alto resolveria melhor.

## Problema

Antes da nuvem, capacidade exigia comprar hardware: cotação, compra, entrega,
instalação. Semanas ou meses, com capital imobilizado e dimensionamento feito para
o pico de três anos à frente.

IaaS transforma isso em uma chamada de API. Capacidade em minutos, paga por uso,
devolvida quando não é mais necessária.

Essa é a mudança fundamental da nuvem, e todos os outros modelos são construídos
sobre ela.

## Conceitos Centrais

### O modelo de responsabilidade compartilhada

A pergunta que organiza tudo: **quem cuida de quê?**

```text
                      IaaS        PaaS        SaaS
aplicação             você        você        fornecedor
dados                 você        você        você*
tempo de execução     você        fornecedor  fornecedor
sistema operacional   você        fornecedor  fornecedor
virtualização         fornecedor  fornecedor  fornecedor
hardware e rede       fornecedor  fornecedor  fornecedor
datacenter            fornecedor  fornecedor  fornecedor
```

O asterisco é importante: **os dados nunca deixam de ser sua responsabilidade**, em
nenhum modelo. Configurar acesso, definir retenção, garantir conformidade — isso não
se terceiriza, e é a origem da maior parte dos incidentes de exposição em nuvem.

### O que continua sendo seu em IaaS

Vale enumerar, porque a lista é longa e costuma ser subestimada:

**Correções de segurança do sistema operacional.** Contínuas e obrigatórias.

**Configuração e endurecimento.** Portas, serviços desnecessários, permissões.

**Monitoramento e coleta de registros.** Instalar, configurar, manter.

**Cópia de segurança e restauração testada.**

**Alta disponibilidade.** Distribuir entre zonas, balancear, verificar saúde.

**Escalonamento.** Configurar, ajustar limites, testar.

**Recuperação de falha.** Substituir a instância que morreu.

Cada item é trabalho recorrente. Ver
[serviços gerenciados](managed-services.md) para a comparação econômica.

### Efêmero por natureza

A diferença mental em relação a um servidor próprio: a instância pode desaparecer.
O provedor pode encerrá-la para manutenção, o hardware pode falhar, uma instância
interrompível pode ser retomada.

Isso exige tratar instâncias como descartáveis: nada de estado local importante,
nada de configuração manual, tudo reproduzível a partir de código.

Uma instância que ninguém consegue recriar do zero é um passivo.

### Infraestrutura como código não é opcional

Criar recursos pelo console é conveniente e produz um ambiente que ninguém sabe
reconstruir.

Declarar a infraestrutura em código dá versionamento, revisão, reprodutibilidade
entre ambientes e recuperação. É o que transforma IaaS de "servidores alugados" em
infraestrutura programável.

Sem isso, o ganho principal do modelo se perde.

### Onde IaaS ainda é a resposta

**Software que exige controle do sistema.** Requisitos de núcleo, drivers,
configuração específica.

**Licenciamento que exige máquina dedicada.**

**Migração de sistema legado.** Mover como está é o caminho mais rápido para sair de
um datacenter, e é uma decisão legítima — desde que a modernização venha depois, e
não seja adiada indefinidamente.

**Escala muito grande com carga previsível.** Onde a diferença de preço paga um
time.

**Requisitos de conformidade** que exigem controle demonstrável da camada.

### Instância dedicada não é a mesma coisa que servidor próprio

Uma diferença que muda o modelo de operação e passa despercebida: mesmo em IaaS,
você não controla o hardware.

O provedor pode migrar sua instância entre hospedeiros, agendar manutenção que
exige reinício, ou aposentar uma geração de máquina com prazo. Você é avisado, e
não decide.

Isso significa que "temos controle total" é verdade da camada do sistema
operacional para cima, e apenas dali para cima. A camada abaixo continua sendo
operada por terceiros, com janelas que você acomoda em vez de escolher.

A consequência prática: mesmo em IaaS, a aplicação precisa tolerar reinício
programado. Sistemas migrados de datacenter que assumiam disponibilidade contínua
da máquina descobrem isso na primeira notificação de manutenção — tipicamente com
poucos dias de antecedência.

## Modelo Mental

**IaaS troca trabalho por controle.** Se você não está usando o controle para algo
concreto, está pagando o trabalho à toa.

## Quando Usar

- A aplicação exige controle do sistema operacional.
- Licenciamento ou conformidade exigem.
- Migração inicial de ambiente próprio.
- Escala grande com carga previsível e time para operar.
- Nenhum modelo mais alto atende ao requisito.

## Quando Não Usar

**Por hábito.** Verifique se um modelo mais alto resolve.

**Sem infraestrutura como código.**

**Sem processo de correção de segurança.**

**Para componentes que existem como serviço gerenciado** — banco, fila, cache — sem
razão específica.

**Com time pequeno** e sem experiência operacional.

**Tratando instâncias como servidores permanentes.**

## Alternativas

- **[PaaS](paas.md)** — o provedor cuida do sistema e do tempo de execução.
- **[Serviços gerenciados](managed-services.md)** — para os componentes de
  infraestrutura.
- **[Contêineres](containers.md)** — empacotamento consistente sobre IaaS.
- **[Serverless](serverless.md)** — sem capacidade a gerenciar.

## Trade-offs

| IaaS | Modelos mais altos |
|---|---|
| Controle total | Limitado |
| Todo o trabalho operacional | Menos |
| Preço unitário menor | Maior |
| Qualquer software | O que a plataforma suporta |
| Portabilidade maior | Menor |
| Entrega mais lenta | Mais rápida |

## Modos de Falha

**Instância não reproduzível.** Configurada à mão, ninguém sabe recriar.

**Correções atrasadas.** Vulnerabilidades conhecidas em produção.

**Estado em disco local perdido.**

**Zona única por omissão.** Ver
[zonas de disponibilidade](availability-zones.md).

**Instâncias órfãs.** Criadas para um teste e esquecidas, cobradas para sempre.

**Grupos de segurança permissivos.** Portas abertas para a internet por
conveniência e nunca fechadas.

**Cópia de segurança nunca restaurada.**

## Erros Comuns

**Criar recursos pelo console.**

**Não automatizar correções.**

**Guardar estado em disco local.**

**Não distribuir entre zonas.**

**Escolher IaaS por reflexo** quando existe gerenciado equivalente.

**Migrar o legado como está e parar por aí.**

## Exemplo Real

Uma empresa de varejo migrou seu datacenter para IaaS em quatro meses — 60 máquinas
virtuais, replicando o ambiente anterior.

A migração foi bem-sucedida no objetivo imediato: sair do datacenter antes do
vencimento do contrato.

Dois anos depois, o ambiente tinha problemas que a equipe classificou como
"trouxemos junto":

**Instâncias não reproduzíveis.** 41 das 60 tinham sido configuradas manualmente. Um
inventário revelou que ninguém sabia recriar 12 delas do zero.

**Correções.** 23 instâncias com versões desatualizadas de sistema operacional,
algumas fora de suporte.

**Zona única.** Todas numa zona, porque foi o padrão na criação. A migração
replicara a topologia do datacenter — que tinha um prédio só.

**Custo.** A fatura era 30% maior que o custo do datacenter anterior, porque as
máquinas foram dimensionadas com a mesma folga de capital imobilizado que fazia
sentido quando o hardware era comprado.

**Componentes que poderiam ser gerenciados.** Banco, fila e cache autogeridos, com
o trabalho operacional correspondente.

A segunda fase, ao longo de um ano:

**Infraestrutura como código** para tudo. As 12 instâncias irreproduzíveis foram as
mais difíceis — em dois casos foi preciso reconstruir a partir de engenharia
reversa do que estava rodando.

**Banco, fila e cache migrados** para gerenciado.

**Distribuição entre três zonas.**

**Redimensionamento** com base em utilização real. A fatura caiu 45%.

**Correções automatizadas**, com substituição de instância em vez de atualização no
lugar.

A migração como estava foi a decisão certa para o prazo
que tinham. O erro foi considerá-la concluída — o plano de modernização existia no
papel e ficou dois anos sem prioridade, acumulando risco de segurança e custo.

## Conceitos Relacionados

- [PaaS](paas.md) e [SaaS](saas.md) — os outros modelos.
- [Serviços Gerenciados](managed-services.md).
- [Computação em Nuvem](cloud-compute.md).
- [Zonas de Disponibilidade](availability-zones.md).

## Exercício Prático

Escolha uma instância de produção e pergunte: se ela sumir agora, quanto tempo para
recriar uma idêntica, a partir de código?

Se a resposta envolver alguém lembrar o que foi instalado, você tem uma instância
que não é reproduzível.

## Perguntas de Entrevista

- O que o modelo de responsabilidade compartilhada diz sobre dados?
- Por que instâncias devem ser tratadas como descartáveis?
- Em que casos IaaS ainda é a escolha certa?

## Para Aprofundar

- Morris, Kief. *Infrastructure as Code*. 2ª ed. O'Reilly, 2020.
- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Documentação de modelo de responsabilidade compartilhada dos provedores.
