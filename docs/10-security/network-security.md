---
id: network-security
title: Segurança de Rede
sidebar_position: 8
description: Segmentação, filtragem e o que a rede ainda protege quando a identidade virou o perímetro.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor usa controles de rede como camada de contenção, sem
  depender deles como defesa única.
prerequisites: [security]
related: [zero-trust, secure-boundaries, cloud-networking]
canonical_for: [segmentação de rede, microssegmentação, movimento lateral, filtragem de saída]
content_version: 1
last_reviewed: 2026-08-28
---

# Segurança de Rede

## Visão Geral

Controles de rede decidem quem consegue **alcançar** o quê. Eles não substituem
autenticação e autorização, e continuam valendo por uma razão simples: o que não é
alcançável não é atacável.

Com [confiança zero](/10-security/zero-trust.md), a rede deixou de ser a fronteira principal. Ela
permanece como **camada de contenção** — o que limita o movimento lateral depois que
algo dá errado.

## Problema

A rede interna típica é plana: qualquer coisa alcança qualquer coisa. Ela foi
construída assim porque é mais simples, e porque a defesa estava no perímetro.

A consequência aparece no incidente: um serviço comprometido — ou uma máquina de
desenvolvedor infectada — alcança bancos, painéis administrativos e sistemas que nada
têm a ver com ele.

O tamanho do dano é definido pelo que era alcançável, não pelo que foi
comprometido.

## Conceitos Centrais

### Segmentação limita o alcance

Dividir a rede em segmentos com política de comunicação explícita entre eles.

```text
plana          comprometimento alcança tudo
por camada     aplicação não alcança o segmento de gestão
microssegmentada cada serviço alcança apenas os que precisa
```

A microssegmentação é a mais eficaz e a mais trabalhosa, porque exige saber quem fala
com quem — informação que raramente existe documentada.

O caminho viável é sempre o mesmo: registrar o tráfego real, derivar a política,
aplicar em modo de aviso, depois bloquear. Aplicar direto derruba produção.

### Filtragem de saída é a metade esquecida

Quase todo esforço vai para o tráfego de entrada. A saída costuma ser irrestrita.

Isso importa porque a saída é o caminho da **exfiltração** e do **comando e
controle**: um sistema comprometido precisa mandar dados para fora ou receber
instruções.

Restringir saída aos destinos necessários é um dos controles de melhor retorno, e um
dos menos aplicados. Ver
[rede em nuvem](/09-cloud-architecture/cloud-networking.md).

O efeito colateral positivo: ela também detecta dependências não documentadas — o
tráfego bloqueado revela o que ninguém sabia que existia.

### Não exponha o que não precisa ser exposto

O controle mais básico e o mais frequentemente violado:

```text
banco de dados       nunca acessível da internet
painel administrativo  nunca acessível da internet
serviços internos    nunca acessíveis da internet
```

Toda auditoria encontra pelo menos um desses exposto, quase sempre por uma regra
criada "temporariamente".

Acesso administrativo merece nota: em vez de porta aberta com restrição de origem, um
serviço gerenciado de sessão elimina a necessidade de qualquer porta exposta — e
registra tudo.

### Rede não substitui autenticação

O erro estrutural: um serviço que aceita qualquer requisição porque "só quem está na
rede alcança".

Isso confia na rede como se ela fosse identidade. Uma configuração errada, um serviço
comprometido, ou uma rota inesperada quebram a premissa — e não há segunda linha.

Rede é **contenção**, não autenticação. Ver
[fronteiras seguras](/10-security/secure-boundaries.md).

### Proteção contra volume é problema separado

Ataques de negação de serviço não são resolvidos por segmentação. Eles exigem
capacidade de absorção — rede de distribuição, filtragem no provedor, limite de taxa.

Vale separar os dois assuntos: segmentação protege contra alcance; absorção protege
contra volume. Confundi-los leva a esperar de um controle o que ele não faz.

### Registro é o que torna a rede observável

Regras que bloqueiam sem registrar impedem aquela tentativa e não revelam padrão.

Registrar conexões negadas — e, nos segmentos críticos, também as aceitas — é o que
permite detectar varredura interna e movimento lateral. Ver
[auditabilidade](/10-security/auditability.md).

### Conexão privada com terceiros concede mais do que se pretende

Um caso específico que vale isolar, porque aparece em quase toda organização com
integrações: uma conexão de rede privada com um parceiro — para trocar dados de um
sistema — normalmente concede alcance à faixa de rede inteira, não ao sistema.

O parceiro passa a poder alcançar tudo que estiver naquela faixa, hoje e no futuro.
E a recíproca vale: um comprometimento do lado dele atravessa para o seu.

As alternativas que limitam o alcance:

**Exposição de um endpoint específico**, em vez de conectar redes.

**Segmento dedicado** por parceiro, com política explícita do que ele alcança.

**Acesso por corretor**, mediando cada conexão e registrando.

A verificação prática: liste as conexões privadas ativas com terceiros e, para cada
uma, o que aquele parceiro consegue alcançar hoje. A resposta costuma ser muito maior
que o sistema que motivou a conexão — e frequentemente inclui parceiros cujo contrato
já terminou.

## Modelo Mental

**Rede define o alcance, não a permissão.** Ela é a camada que limita o dano depois
que a identidade falha.

## Quando Usar

- Sempre, como camada de contenção.
- Prioridade em ambientes com muitos serviços internos.
- Onde há dados sensíveis concentrados.
- Com acesso de terceiros à rede.
- Onde exfiltração é a ameaça principal.

## Quando Não Usar

**Como autenticação.**

**Segmentação sem conhecer o tráfego real.**

**Regras temporárias sem expiração.**

**Porta administrativa exposta**, mesmo com restrição de origem, quando há
alternativa gerenciada.

**Microssegmentação em ambiente pequeno.** O custo supera o risco.

**Esperando que resolva negação de serviço.**

## Alternativas

- **Autenticação entre serviços** — TLS mútuo, tokens. Complementa, não substitui.
- **Acesso por corretor** em vez de rede privada — evita conceder acesso amplo à
  rede.
- **Pontos de extremidade privados** para serviços gerenciados. Ver
  [rede em nuvem](/09-cloud-architecture/cloud-networking.md).
- **Malha de serviço** — política entre serviços na camada de aplicação. Ver
  [malha de serviço](/08-integration-architecture/service-mesh.md).

## Trade-offs

| Segmentada | Plana |
|---|---|
| Movimento lateral limitado | Livre |
| Política a manter | Nenhuma |
| Mudanças exigem ajuste | Fluidez |
| Diagnóstico mais complexo | Direto |

| Saída restrita | Irrestrita |
|---|---|
| Exfiltração dificultada | Livre |
| Dependências reveladas | Ocultas |
| Quebra ao adicionar destino | Nunca quebra |

## Modos de Falha

**Rede plana.** Comprometimento alcança tudo.

**Saída irrestrita.** Exfiltração sem obstáculo.

**Serviço interno exposto.** Regra temporária permanente.

**Rede como única defesa.**

**Política bloqueando produção.** Aplicada sem conhecer o tráfego.

**Sem registro de negações.**

**Conexão privada concedendo acesso amplo.** Um parceiro com acesso à rede inteira.

## Erros Comuns

**Manter a rede plana.**

**Não restringir saída.**

**Confiar na rede em vez de autenticar.**

**Segmentar sem observar antes.**

**Regras sem data de expiração.**

**Não registrar o que foi bloqueado.**

## Exemplo Real

Uma empresa de varejo teve uma máquina de desenvolvedor comprometida por um anexo
malicioso.

A partir dela, o atacante alcançou, na mesma rede plana: o banco de produção, o
sistema de folha de pagamento, o painel de administração da infraestrutura e três
servidores de arquivos.

Nada disso tinha relação com desenvolvimento. Todos eram alcançáveis porque a rede
corporativa era única.

A exfiltração — cerca de 40 GB ao longo de nove dias — saiu sem qualquer restrição,
porque o tráfego de saída não era filtrado nem monitorado.

A detecção veio de um alerta de custo de transferência de dados, não de segurança.

As mudanças:

**Segmentação por função.** Estações de trabalho, produção, gestão e sistemas
administrativos em segmentos distintos, com política explícita entre eles. A
derivação da política levou três meses de observação de tráfego.

**Filtragem de saída** em todos os segmentos, com destinos permitidos por lista. O
modo de aviso, nas primeiras seis semanas, revelou 90 destinos externos não
documentados — dos quais 12 eram serviços legítimos que ninguém tinha registrado, e
2 eram software não autorizado instalado por usuários.

**Acesso administrativo** por serviço de sessão gerenciado, com registro completo. As
portas administrativas expostas foram fechadas.

**Registro de conexões negadas**, com alerta para padrões de varredura interna.

**Autenticação entre serviços**, para que a segmentação não fosse a única linha.

O que a equipe aprendeu: o comprometimento inicial foi comum e provavelmente
inevitável. O que transformou um incidente de uma máquina num incidente da empresa
inteira foi a topologia — e ela tinha sido decidida por conveniência, quinze anos
antes, quando a empresa tinha vinte pessoas.

## Conceitos Relacionados

- [Confiança Zero](/10-security/zero-trust.md) — o princípio.
- [Fronteiras Seguras](/10-security/secure-boundaries.md).
- [Rede em Nuvem](/09-cloud-architecture/cloud-networking.md).
- [Auditabilidade](/10-security/auditability.md).

## Exercício Prático

A partir de uma máquina de desenvolvimento, tente alcançar o banco de produção — só
a conexão de rede, sem credencial.

Se a conexão abrir, você mediu o seu movimento lateral. Depois faça a mesma pergunta
para a saída: para quais destinos externos essa máquina consegue enviar dados?

## Perguntas de Entrevista

- Por que filtragem de saída é o controle mais esquecido?
- Por que rede não substitui autenticação?
- Por que segmentar exige observar o tráfego antes?

## Para Aprofundar

- NIST SP 800-207 — Zero Trust Architecture.
- Gilman, Evan; Barth, Doug. *Zero Trust Networks*. 2ª ed. O'Reilly, 2024.
- MITRE ATT&CK — técnicas de movimento lateral e exfiltração.
