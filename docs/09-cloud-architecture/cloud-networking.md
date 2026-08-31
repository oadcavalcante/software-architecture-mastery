---
id: cloud-networking
title: Rede em Nuvem
sidebar_position: 10
description: Rede como configuração — o que muda quando a topologia é código e o tráfego é cobrado.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta topologia de rede com fronteiras explícitas e
  entende onde o tráfego gera custo.
prerequisites: [cloud-architecture]
related: [cloud-identity, availability-zones, cost-architecture]
canonical_for: [rede virtual, sub-rede, grupo de segurança, ponto de extremidade privado]
content_version: 1
last_reviewed: 2026-08-27
---

# Rede em Nuvem

## Visão Geral

Na nuvem, a rede é definida por configuração: você declara faixas de endereços,
sub-redes, rotas e regras de filtragem, e elas passam a existir.

Isso muda duas coisas em relação à rede física. Primeiro, a topologia é versionável
e reproduzível. Segundo, ela é fácil de errar em escala — uma regra permissiva
aplicada por engano vale para tudo que ela alcança.

E há uma terceira, que não tem equivalente em rede própria: **o tráfego é cobrado**,
e por onde ele passa vira decisão de arquitetura.

## Problema

Rede costuma ser tratada como detalhe de infraestrutura: cria-se o que o assistente
sugere, abre-se o que é preciso para funcionar, e não se volta.

O resultado típico: sub-redes públicas onde deveriam ser privadas, regras que
permitem acesso de qualquer origem, tráfego atravessando a internet quando poderia
ser interno, e custo de transferência que ninguém consegue explicar.

Cada um desses é uma decisão que não foi tomada.

## Conceitos Centrais

### Público e privado é a fronteira principal

```text
sub-rede pública    tem rota para a internet
                    balanceadores, gateways — o que precisa ser alcançado
sub-rede privada    sem rota de entrada da internet
                    aplicação, banco, cache — tudo o mais
```

A regra prática: **por padrão, privada**. Recursos em sub-rede pública são a
exceção, justificada caso a caso.

Isso não é paranoia — é que a alternativa, expor por conveniência e proteger por
regra de firewall, transfere toda a segurança para uma configuração que uma pessoa
distraída pode afrouxar.

Recursos privados que precisam alcançar a internet — para atualizações, para APIs
externas — saem por um gateway de tradução, que permite saída sem permitir entrada.

### Grupos de segurança são o filtro que importa

Regras aplicadas ao recurso, não à rede: qual origem pode alcançar qual porta.

Dois princípios que resolvem a maior parte:

**Negar por padrão, permitir o específico.**

**Referenciar grupos, não faixas de endereço.** Permitir que o grupo da aplicação
alcance o grupo do banco é mais legível e mais robusto que permitir uma faixa —
porque continua correto quando os endereços mudam.

A regra que aparece em toda auditoria: acesso administrativo aberto para qualquer
origem na internet. Ela costuma ter sido criada "temporariamente".

### Ponto de extremidade privado evita a internet

Serviços gerenciados do provedor — armazenamento, banco, fila — têm endereços
públicos por padrão. O tráfego da sua aplicação para eles sai da sua rede.

Um ponto de extremidade privado traz esse serviço para dentro da sua rede virtual:
o tráfego não passa pela internet, e o serviço pode ser configurado para recusar
acesso de fora.

Três ganhos de uma vez: superfície menor, latência ligeiramente menor, e custo de
transferência menor.

É uma das configurações de melhor retorno e uma das menos aplicadas.

### O custo depende de por onde o tráfego passa

```text
dentro da mesma zona          geralmente gratuito
entre zonas                   cobrado, nos dois sentidos
entre regiões                 mais caro
saída para a internet         o mais caro
por gateway de tradução       cobrado por hora e por gigabyte processado
```

A última linha surpreende: um gateway de tradução processando volume alto pode se
tornar um item relevante da fatura, e o tráfego que passa por ele frequentemente
poderia ir por ponto de extremidade privado.

Ver [arquitetura de custo](/09-cloud-architecture/cost-architecture.md) e
[zonas de disponibilidade](/09-cloud-architecture/availability-zones.md).

### Faixas de endereço precisam ser planejadas

Escolher a faixa da rede virtual parece irrelevante até você precisar conectá-la a
outra — uma rede corporativa, uma rede de parceiro, uma conta de uma empresa
adquirida.

Faixas sobrepostas impedem conexão direta, e a solução envolve tradução de
endereços, que complica tudo.

Um plano de endereçamento, definido antes da primeira rede, custa uma tarde e evita
migrações.

### Resolução de nomes é onde os problemas se escondem

Boa parte dos incidentes de rede em nuvem são de resolução de nomes: zona privada
não associada, encaminhamento mal configurado, resolução funcionando de uma rede e
não de outra.

Eles são difíceis porque o sintoma é genérico — "não conecta" — e a causa está numa
camada que ninguém olha primeiro.

## Modelo Mental

**Rede em nuvem é configuração com alcance.** Uma regra errada não afeta um cabo,
afeta tudo que ela descreve.

## Quando Usar

Estas decisões aparecem sempre. Atenção especial quando:

- Há dados sensíveis.
- Existe conexão com rede corporativa.
- O volume de tráfego é alto.
- Vários ambientes ou contas precisam se comunicar.
- Há requisito de não trafegar pela internet.

## Quando Não Usar

**Recursos em sub-rede pública sem necessidade.**

**Acesso administrativo aberto para a internet.**

**Regras por faixa de endereço** quando referência a grupo resolve.

**Tráfego para serviços gerenciados pela internet** quando há ponto de extremidade
privado.

**Faixas escolhidas sem plano.**

**Rede como configuração manual**, sem infraestrutura como código.

## Alternativas

- **Conectividade privada com a rede corporativa** — em vez de expor serviços.
- **Acesso administrativo por serviço gerenciado de sessão** — elimina a
  necessidade de porta aberta.
- **Malha de serviço** — para políticas entre serviços. Ver
  [malha de serviço](/08-integration-architecture/service-mesh.md).
- **Ponto de extremidade privado** — em vez de gateway de tradução para serviços do
  provedor.

## Trade-offs

| Tudo privado | Exposição direta |
|---|---|
| Superfície mínima | Maior |
| Configuração adicional | Simples |
| Acesso administrativo indireto | Direto |
| Custo de pontos de extremidade | Nenhum |

| Gateway de tradução | Ponto de extremidade privado |
|---|---|
| Alcança qualquer destino | Só serviços suportados |
| Custo por hora e por gigabyte | Custo por hora, menos por tráfego |
| Tráfego pela internet | Interno |

## Modos de Falha

**Recurso exposto sem intenção.** Sub-rede pública por padrão.

**Regra permissiva temporária permanente.**

**Faixas sobrepostas** impedindo conexão futura.

**Custo de gateway de tradução.** Volume alto por um caminho caro.

**Resolução de nomes falhando** de forma específica a uma rede.

**Esgotamento de endereços.** Sub-rede pequena demais, e redimensionar exige
recriar.

**Regra de saída ampla.** Foco costuma estar na entrada; a saída irrestrita facilita
exfiltração.

## Erros Comuns

**Não planejar o endereçamento.** Faixas sobrepostas entre ambientes ou com a rede corporativa impedem interconexão depois, e renumerar uma rede em produção é das operações mais caras que existem.

**Deixar recursos em sub-rede pública.** Banco e serviço interno com endereço público dependem só do grupo de segurança estar certo. A sub-rede privada remove a exposição em vez de filtrá-la.

**Regras temporárias que ficam.** A liberação ampla aberta para depurar um incidente sobrevive anos, porque nada expira sozinho e ninguém revisa o que não causa problema.

**Não usar pontos de extremidade privados.** Sem eles, o tráfego para serviços do próprio provedor sai pela internet — o que adiciona exposição, latência e, frequentemente, custo de saída.

**Ignorar o custo do caminho do tráfego.** Transferência entre zonas, entre regiões e para a internet têm preços muito diferentes. Uma arquitetura que atravessa zonas sem necessidade paga isso em toda requisição.

**Não restringir tráfego de saída.** Quase todo mundo filtra entrada e libera saída — e a saída é o caminho da exfiltração e do contato com servidor de controle.

## Exemplo Real

Uma empresa de comércio eletrônico teve três problemas de rede que apareceram em
momentos diferentes e tinham a mesma origem: a rede fora criada pelo assistente
padrão, três anos antes.

**Banco exposto.** O banco estava numa sub-rede pública, com uma regra que permitia
acesso da faixa de escritório. A faixa tinha mudado no ano anterior, e a regra fora
ampliada para "qualquer origem" para destravar um acesso — temporariamente. A
descoberta veio de uma varredura externa contratada.

**Custo de tradução.** A aplicação lia e escrevia grandes volumes num armazenamento
de objetos, e todo esse tráfego passava pelo gateway de tradução. O item era o
quarto maior da fatura, e ninguém sabia o que era. Um ponto de extremidade privado
reduziu isso em cerca de 90%.

**Aquisição bloqueada.** A empresa adquiriu outra, e as duas redes usavam a mesma
faixa de endereços. Conectá-las diretamente era impossível. A integração levou
quatro meses a mais que o previsto, com tradução de endereços em ambos os lados.

As correções, além das específicas:

**Plano de endereçamento** para toda a organização, com faixas reservadas por
ambiente e espaço para aquisições.

**Sub-redes privadas por padrão**, com exposição exigindo aprovação.

**Acesso administrativo** por serviço de sessão gerenciado, sem portas abertas.

**Regras de saída restritas** aos destinos necessários.

**Rede como código**, com revisão. Regras temporárias passaram a ter data de
expiração obrigatória.

O que a equipe registra: nenhum dos três problemas era difícil de evitar. Todos
vieram de a rede ter sido tratada como pré-requisito a resolver rápido, e não como
parte do desenho.

## Conceitos Relacionados

- [Identidade em Nuvem](/09-cloud-architecture/cloud-identity.md) — a outra camada de fronteira.
- [Zonas de Disponibilidade](/09-cloud-architecture/availability-zones.md) — tráfego entre zonas.
- [Arquitetura de Custo](/09-cloud-architecture/cost-architecture.md).
- [Segurança](/10-security/index.md).

## Exercício Prático

Liste os recursos que estão em sub-rede pública hoje e pergunte, para cada um: ele
precisa ser alcançável da internet?

Depois procure regras que permitem acesso de qualquer origem. Cada uma tem uma
história, e quase todas começam com "temporariamente".

## Perguntas de Entrevista

- Por que sub-rede privada deveria ser o padrão?
- O que um ponto de extremidade privado resolve, e o que ele economiza?
- Por que o plano de endereçamento importa antes da primeira rede?

## Para Aprofundar

- Documentação de rede virtual dos principais provedores.
- NIST SP 800-207 — arquitetura de confiança zero.
- Rice, Liz. *Container Security*. O'Reilly, 2020.
