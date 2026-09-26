---
id: zero-trust
title: Confiança Zero
sidebar_position: 9
description: "Eliminar o perímetro implícito: verificar sempre, em vez de confiar por localização de rede."
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor aplica os princípios de confiança zero por etapas, sem
  tratá-lo como produto a comprar.
prerequisites: [secure-boundaries]
related: [secure-boundaries, network-security, least-privilege]
canonical_for: [confiança zero, perímetro implícito, verificação contínua]
content_version: 3
last_reviewed: 2026-08-28
---

# Confiança Zero

## Visão Geral

Confiança zero é o princípio de que **estar dentro da rede não confere confiança**.
Toda requisição é verificada (identidade, autorização, contexto) independentemente
da origem.

Ele substitui o modelo do castelo: muro forte no perímetro, confiança implícita
dentro.

E é frequentemente vendido como produto. Não é: é um conjunto de princípios que se
aplica gradualmente, e a maior parte do trabalho está em coisas que a maioria das
organizações já deveria fazer.

## Problema

O modelo de perímetro pressupõe que a fronteira de rede separa confiável de não
confiável.

Essa premissa quebrou por três razões independentes:

**Trabalho remoto e nuvem.** Não existe mais um "dentro" geográfico.

**Atacantes entram.** Por credencial vazada, por dependência comprometida, por
phishing. Uma vez dentro, o movimento lateral é livre.

**Funcionários já estão dentro.** A ameaça interna não atravessa nenhum perímetro.

O resultado: um comprometimento pequeno vira total, porque nada além do muro verifica
nada.

## Conceitos Centrais

### Os princípios

```text
verificar explicitamente   toda requisição, sempre — identidade e contexto
menor privilégio           acesso mínimo, preferencialmente temporário
presumir comprometimento   projetar para conter, não só para impedir
```

O terceiro é o que mais muda arquitetura. Ele desloca o esforço de "impedir a
entrada" para "limitar o alcance e detectar rápido". É aí que a arquitetura de
fato contribui. Ver [fronteiras seguras](/10-security/secure-boundaries.md).

### A identidade vira o perímetro

Se a localização de rede não confere confiança, o que confere é a identidade
verificada, de pessoas e de serviços.

Consequências práticas:

**Serviços autenticam-se mutuamente.** TLS mútuo ou tokens, não "está na mesma
rede". Ver [malha de serviço](/08-integration-architecture/service-mesh.md).

**Toda requisição carrega identidade verificável**, e cada serviço a verifica em vez
de confiar no chamador.

**Autenticação forte para pessoas**, com segundo fator resistente a phishing.

### O contexto entra na decisão

Além de quem, a decisão considera:

```text
dispositivo   é gerenciado, está atualizado, tem proteção ativa
localização   coerente com o padrão daquele usuário
comportamento volume, horário, tipo de operação
sensibilidade do recurso pedido
```

Isso permite respostas graduadas: acesso normal do dispositivo corporativo, segundo
fator adicional de um dispositivo desconhecido, negação para uma operação sensível
num contexto anômalo.

O risco é atrito excessivo. Uma política que pede verificação constante faz as
pessoas procurarem contornos, e o contorno é pior que a política frouxa.

### Microssegmentação limita o movimento lateral

O mecanismo (e o caminho de registrar o tráfego antes de bloquear) está em
[segurança de rede](/10-security/network-security.md). O que confiança zero muda é o
critério da política: a regra entre segmentos passa a nomear identidades de serviço,
não faixas de endereço. Por isso ela entra depois da identidade na ordem de adoção:
política escrita sobre endereço, num ambiente em que os serviços ainda se autenticam
com chave estática, precisa ser reescrita quando a autenticação entre serviços chega.

### Não é produto, e é gradual

Nenhuma ferramenta entrega confiança zero. O que existem são componentes:
autenticação forte, gestão de identidade, políticas de rede, verificação de
dispositivo, avaliação de política.

A adoção realista é por etapas, em ordem de retorno:

```text
1. autenticação forte para pessoas, com segundo fator resistente a phishing
2. eliminar credenciais estáticas de serviço
3. autenticação entre serviços
4. remover acesso permanente elevado — elevação temporária
5. segmentação, começando pelos sistemas críticos
6. contexto de dispositivo na decisão
```

A ordem é por retorno por esforço, não por redução de alcance: a segmentação é o
controle que mais limita o alcance de um serviço comprometido, mas é também o mais
caro em ambiente existente. Os quatro primeiros entregam a maior redução de risco por
unidade de esforço e não exigem produto novo.

### O que ele não elimina

Vale a franqueza: confiança zero não impede comprometimento. Ele reduz o alcance e o
tempo de detecção.

E ele não substitui: correção de vulnerabilidades, revisão de código, validação de
entrada, proteção de dados. Uma organização com confiança zero e uma injeção de SQL
continua vulnerável a ela.

Tratá-lo como resposta completa é o equívoco de posicionamento mais comum.

## Modelo Mental

**Confiança zero é presumir que o atacante já está dentro.** O trabalho passa a ser
limitar o que ele alcança.

## Quando Usar

- Trabalho remoto ou híbrido.
- Recursos em nuvem e no ambiente próprio.
- Acesso de terceiros.
- Dados sensíveis com ameaça interna relevante.
- Ambiente com muitos serviços internos.
- Requisito regulatório.

## Quando Não Usar

**Quando não há "dentro" a proteger além do provedor de identidade.** Uma equipe
que usa só serviços gerenciados de terceiros, sem serviços internos que se chamem
entre si, já tem todo acesso passando por login; o que resta é autenticação forte,
que não precisa do programa.

**Quando não há quem opere o serviço de política.** Avaliação de política em toda
requisição cria uma dependência que precisa de sobreaviso, cache e comportamento de
falha definido. Sem uma equipe que assuma isso, o serviço de política vira o ponto
único que para tudo, e o ganho de contenção não compensa.

**Quando a segmentação e o contexto de dispositivo custam mais que o alcance que
cortam.** Com poucos serviços internos, sem acesso de terceiros e sem dado sensível,
o movimento lateral disponível já é pequeno. Pare nas etapas de identidade e menor
privilégio, que servem a qualquer tamanho.

**Quando o atrito medido passa a gerar contorno.** Se a verificação adicional produz
conta compartilhada ou pedido de exceção permanente, a etapa está custando mais
segurança do que dá; recue a política antes de avançar para a próxima.

## Alternativas

- **Segmentação de rede tradicional**: parte do benefício, menos esforço. Ver
  [segurança de rede](/10-security/network-security.md).
- **[Menor privilégio](/10-security/least-privilege.md) rigoroso**: limita o que uma identidade
  comprometida alcança sem mudar a rede.
- **Autenticação forte**: o item isolado de melhor retorno por esforço.
- **Acesso por corretor** em vez de rede privada: remove o acesso amplo à rede que a
  conexão privada concede.

## Trade-offs

| Confiança zero | Perímetro |
|---|---|
| Movimento lateral limitado | Livre |
| Verificação em toda requisição | Uma vez |
| Latência e complexidade | Menos |
| Funciona sem "dentro" | Depende de rede |
| Implantação gradual longa | Já existe |

| Contexto na decisão | Só identidade |
|---|---|
| Resposta graduada | Binária |
| Atrito variável | Previsível |
| Sinais a coletar | Nenhum |

## Modos de Falha

**Adotado como produto.** Ferramenta comprada, princípios ausentes.

**Atrito gerando contorno.**

**Segmentação bloqueando produção.**

**Programa sem entrega.** Dois anos, nada em produção.

**Falsa sensação.** "Temos confiança zero" enquanto credenciais estáticas circulam.

**Dependência do serviço de política.** Se ele cai, nada é autorizado.

## Erros Comuns

**Comprar em vez de aplicar.** A plataforma é instalada, mas as credenciais estáticas
e o acesso administrativo permanente continuam, e o orçamento do programa se esgota
antes de chegar a eles.

**Começar pela segmentação** em vez da identidade. A política é derivada de tráfego
que ainda circula com credencial estática e escrita sobre endereços; quando a
autenticação entre serviços chega, precisa ser refeita.

**Não medir o atrito.** Sem tempo de aprovação e taxa de exceção medidos, o contorno
aparece antes do alarme: no exemplo abaixo, uma conta compartilhada de emergência.

**Segmentar sem conhecer o tráfego.** A primeira regra de bloqueio derruba uma
dependência que ninguém tinha documentado.

**Tratar como substituto de higiene básica.** O relatório diz "confiança zero" e a
injeção de SQL no serviço exposto continua lá.

**Não ter caminho de emergência** quando o serviço de política falha.

## Exemplo Real

Uma empresa de serviços financeiros iniciou um programa de confiança zero após um
incidente em que a credencial de um fornecedor, obtida por phishing que capturou o
código enviado por mensagem, foi usada para acessar sistemas internos.

A abordagem inicial foi comprar uma plataforma e planejar dois anos de implantação.
Depois de oito meses, nada estava em produção, e o programa perdeu apoio.

O reinício foi por etapas, com entrega a cada trimestre:

**Trimestre 1 — autenticação forte.** Segundo fator resistente a phishing para todos,
fornecedores incluídos, substituindo códigos por mensagem. Isso sozinho eliminou a classe de ataque que
tinha causado o incidente original.

**Trimestre 2 — credenciais de serviço.** Eliminação de chaves estáticas, com
identidade de plataforma e credenciais temporárias. Ver
[segredos](/10-security/secrets.md).

**Trimestre 3 — acesso elevado temporário.** O acesso administrativo permanente foi
removido; elevação de quatro horas com justificativa.

**Trimestre 4 — autenticação entre serviços.** TLS mútuo, via malha de serviço, para
os serviços críticos.

**Ano 2 — segmentação.** Começou com três meses registrando o tráfego real. A política
derivada foi aplicada em modo de aviso por seis semanas, revelando 40 comunicações
não documentadas, incluindo duas que ninguém sabia que existiam, de sistemas
supostamente desativados.

Dois problemas durante o programa:

**Atrito.** A política inicial de elevação exigia aprovação de gestor, com tempo médio
de resposta de 40 minutos. Durante incidentes, isso era inviável, e o time criou uma
conta compartilhada de emergência, exatamente o que se queria eliminar. A política
foi ajustada: aprovação automática com registro e revisão posterior, para papéis de
sobreaviso.

**Serviço de política como ponto único.** Numa indisponibilidade dele, nada foi
autorizado por 20 minutos. Passou a haver avaliação local com política em cache e
comportamento definido para falha.

O ponto que a equipe sublinha: a primeira tentativa falhou por tratar confiança zero como
projeto de plataforma. A segunda funcionou porque cada trimestre entregou uma redução
de risco verificável, e porque a primeira etapa, sozinha, já teria evitado o
incidente que motivou tudo.

## Conceitos Relacionados

- [Fronteiras Seguras](/10-security/secure-boundaries.md): o fundamento.
- [Menor Privilégio](/10-security/least-privilege.md).
- [Segurança de Rede](/10-security/network-security.md): a segmentação.
- [Identidade](/10-security/identity.md): o novo perímetro.

## Exercício Prático

Escolha um serviço interno do seu sistema e pergunte: se um atacante estivesse na
mesma rede, com credencial válida de outro serviço, o que ele conseguiria fazer aqui?

A resposta é o seu movimento lateral disponível hoje.

## Perguntas de Entrevista

- Por que o modelo de perímetro quebrou?
- Qual princípio mais muda arquitetura, e por quê?
- Por que começar pela identidade e não pela segmentação?

## Para Aprofundar

- NIST SP 800-207 — Zero Trust Architecture.
- Google. *BeyondCorp: A New Approach to Enterprise Security*, 2014.
- Rais, Razi et al. *Zero Trust Networks*. 2ª ed. O'Reilly, 2024.
