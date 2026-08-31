---
id: supply-chain-security
title: Segurança da Esteira
sidebar_position: 12
description: A esteira é ambiente de produção — e é tratada como se não fosse.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor protege a esteira com o mesmo rigor de produção e verifica a
  proveniência do que é implantado.
prerequisites: [ci-cd]
related: [ci-cd, containers-in-delivery, supply-chain-trust]
canonical_for: [segurança da esteira, isolamento de execução, verificação na implantação, credencial efêmera de esteira]
content_version: 1
last_reviewed: 2026-08-28
---

# Segurança da Esteira

## Visão Geral

A esteira de integração e entrega tem acesso ao código, aos segredos e ao ambiente de
produção. Ela **é** ambiente de produção.

E é tratada como ferramenta de desenvolvimento: configuração alterável por qualquer
pessoa com acesso ao repositório, credenciais amplas, execuções sem isolamento.

Os fundamentos de confiança na cadeia estão em
[confiança na cadeia de suprimentos](/10-security/supply-chain-trust.md). Aqui
interessa o ângulo da entrega: **proteger o caminho entre o código e produção**.

## Problema

Quem controla o que a esteira executa controla o que roda em produção — sem tocar no
código da aplicação.

Os caminhos:

```text
alterar a configuração da esteira num ramo
adicionar uma ação ou passo malicioso
comprometer uma dependência da construção
publicar um artefato direto no registro, sem passar pela esteira
usar uma credencial da esteira que vazou
```

Nenhum desses aparece numa revisão de código da aplicação. E vários deles não deixam
rastro no repositório principal.

## Conceitos Centrais

### A configuração da esteira é código de produção

Se alterar o arquivo da esteira num ramo faz esse arquivo ser executado com as
credenciais de produção, então **o controle de acesso ao repositório é o controle de
acesso à produção**.

O que corrige:

```text
execuções de contribuições externas usam a configuração do ramo principal
alterações no arquivo da esteira exigem aprovação de mantenedor
segredos de produção indisponíveis em execuções de ramo
ambientes protegidos, com aprovação para implantar
```

A primeira linha é a defesa mais importante contra o vetor mais explorado.

### Isolar execuções

Cada execução deve rodar isolada, sem herdar estado da anterior:

```text
ambiente efêmero        criado e destruído por execução
sem estado compartilhado  cache de dependências verificado, não confiável
sem acesso lateral        uma execução não alcança outra
rede restrita             saída apenas para os destinos necessários
```

A última merece nota: uma execução com saída irrestrita pode exfiltrar segredos sem que
nada bloqueie. Ver
[segurança de rede](/10-security/network-security.md).

E o cache de dependências, se compartilhado entre execuções, é um caminho de
contaminação: uma execução maliciosa envenena o cache que a próxima usa.

### Credenciais efêmeras e escopo mínimo

```text
ruim   chave estática de longa duração, com permissão ampla
bom    credencial temporária, obtida por federação, com escopo por serviço
```

A federação de identidade permite que a esteira autentique sem chave armazenada. Ver
[segredos](/10-security/secrets.md) e
[identidade em nuvem](/09-cloud-architecture/cloud-identity.md).

E o escopo precisa ser mínimo: uma esteira que implanta um serviço não deveria poder
alterar políticas de acesso, criar identidades, nem tocar em outros serviços.

Ver [menor privilégio](/10-security/least-privilege.md) — a permissão de alterar
permissões é escalonamento de privilégio.

### Verificar na implantação, não só assinar

Assinar artefatos sem verificar a assinatura é cerimônia.

O controle que fecha o caminho:

```text
o artefato é assinado pela esteira
a proveniência registra: de qual código, por qual esteira, com quais entradas
a implantação recusa o que não tem assinatura e proveniência válidas
```

Isso impede o vetor de publicar direto no registro: um artefato que não passou pela
esteira não tem proveniência, e a implantação o recusa.

Ver [contêineres na entrega](/14-devops-and-platform/containers-in-delivery.md).

### Dependências da construção também são código

Ações, plugins e imagens de construção executam com o privilégio da esteira.

```text
fixar por versão exata ou por digest, nunca por etiqueta móvel
revisar ações de terceiros antes de adotar
espelhar internamente as críticas
```

Uma ação de terceiro referenciada por etiqueta pode ser reapontada pelo mantenedor — ou
por quem comprometer a conta dele — e passa a executar código novo em todas as esteiras
que a usam.

### Separar construir de implantar

Duas responsabilidades com privilégios diferentes:

```text
construção   acesso ao código, sem acesso a produção
implantação  acesso a produção, sem acesso ao código-fonte
```

A separação limita o dano: comprometer a construção não dá produção; comprometer a
implantação não dá o código.

E ela permite exigir aprovação humana apenas na segunda, que é onde o risco está.

### A esteira precisa ser observável

```text
registro de execuções     o que rodou, com qual configuração, disparado por quem
auditoria de alterações   quem mudou a esteira, quando
alerta de anomalia        execução fora do padrão, uso de credencial incomum
inventário de artefatos   o que foi publicado, por qual execução
```

Um comprometimento de esteira sem registro é indistinguível de operação normal — e é o
que torna a investigação impossível.

### O registro de artefatos é fronteira de confiança

Um componente que costuma ficar fora da análise: o registro onde as imagens e os pacotes
ficam.

Ele é a última parada antes de produção, e comprometê-lo é equivalente a comprometer a
esteira — com a vantagem, para o atacante, de não deixar rastro no repositório de
código.

```text
quem publica          apenas a esteira, com credencial própria
quem consome          apenas os ambientes de destino
imutabilidade         etiqueta publicada não é sobrescrita
retenção              versões antigas disponíveis para reverter
varredura             vulnerabilidades detectadas no que já está publicado
registro de acesso    quem baixou o quê, quando
```

A primeira linha é a mais importante e a mais frequentemente violada: credenciais de
publicação distribuídas a pessoas, ou compartilhadas entre esteiras, tornam o registro
um caminho aberto.

E a quinta merece nota: uma imagem publicada há seis meses pode ter adquirido
vulnerabilidades conhecidas desde então. Varrer apenas na construção deixa de ver isso —
o que importa é a varredura contínua do que está publicado e em uso.

## Modelo Mental

**A esteira tem os privilégios de produção.** Trate-a com o mesmo rigor, ou ela é o
caminho mais fácil para lá.

## Quando Usar

Sempre. Prioridade alta quando:

- O repositório aceita contribuições externas.
- A esteira implanta em produção.
- Há segredos acessíveis à esteira.
- Ações e imagens de terceiros são usadas.

## Quando Não Usar

**Com configuração de esteira alterável sem aprovação.**

**Com segredos de produção em execuções de ramo.**

**Com credenciais estáticas de longa duração.**

**Assinando sem verificar.**

**Com dependências de construção por etiqueta móvel.**

**Sem registro de execuções.**

## Alternativas

- **Aprovação manual para implantar** — reduz o risco sem resolver o de construção.
- **Ambiente de implantação separado** — a esteira produz o artefato, outro processo
  implanta.
- **Esteira gerenciada** — o fornecedor cuida do isolamento, ao custo de menos controle.
- **Verificação de política na admissão** — o ambiente de destino recusa o que não
  atende, independentemente da esteira. Ver
  [Kubernetes](/09-cloud-architecture/kubernetes.md).

A última é valiosa por ser independente: mesmo que a esteira seja comprometida, o
ambiente recusa.

## Trade-offs

| Esteira restrita | Permissiva |
|---|---|
| Dano contido | Acesso amplo |
| Atrito para casos novos | Fluidez |
| Aprovações necessárias | Automático |
| Auditoria completa | Menos overhead |

| Construir e implantar separados | Juntos |
|---|---|
| Privilégios menores em cada | Um lugar |
| Mais peças | Simples |

## Modos de Falha

**Configuração alterada por contribuição externa.**

**Segredo exfiltrado** por execução de ramo.

**Cache de dependências envenenado.**

**Ação de terceiro reapontada.**

**Artefato publicado sem passar pela esteira.**

**Credencial da esteira vazada em registro de execução.**

**Escalonamento de privilégio.** A esteira pode alterar as próprias permissões.

## Erros Comuns

**Tratar a esteira como ferramenta de desenvolvimento.** Ela tem credenciais de produção e produz o artefato que roda lá. É infraestrutura crítica, e merece o mesmo controle que produção.

**Executar configuração de ramo com segredos de produção.** Se o arquivo da esteira pode ser alterado no mesmo commit que ela executa, qualquer contribuidor consegue exfiltrar os segredos.

**Credenciais estáticas amplas.** Uma chave de longa duração com permissão de administrador na esteira é o alvo de maior valor da organização, e ela vaza em log de construção com facilidade.

**Não verificar assinatura na implantação.** Assinar sem verificar no momento de implantar é cerimônia — o controle só existe onde alguém recusa o que não confere.

**Não fixar dependências de construção.** Ações, imagens base e ferramentas referenciadas por etiqueta móvel entram na sua esteira em versões que ninguém revisou.

**Não separar construção de implantação.** Quando o mesmo processo compila e implanta, comprometer a construção é comprometer produção diretamente. Separá-los cria um ponto onde é possível verificar antes de aplicar.

## Exemplo Real

Uma empresa de tecnologia sofreu o comprometimento descrito em
[confiança na cadeia de suprimentos](/10-security/supply-chain-trust.md): uma
contribuição externa alterou a configuração da esteira e extraiu credenciais de
produção.

As correções específicas da esteira:

**Configuração do ramo principal** para execuções de contribuições externas. O arquivo
enviado pelo contribuidor deixou de ser o que roda.

**Esteiras separadas.** Contribuições externas rodam numa esteira sem segredos, sem
acesso a nada produtivo, com rede restrita.

**Credenciais efêmeras por federação**, com escopo por serviço. A esteira perdeu a
permissão de alterar políticas de acesso — que era o que permitiria escalar o
comprometimento.

**Construção separada de implantação.** A construção produz o artefato assinado; um
processo distinto, com credenciais próprias e aprovação para produção, implanta.

**Verificação na admissão.** O ambiente de destino recusa artefatos sem assinatura e
proveniência válidas — proteção independente da esteira.

**Dependências fixadas por digest**, com as críticas espelhadas internamente.

**Rede de saída restrita** nas execuções, com registro do que foi bloqueado. Nos
primeiros meses, isso revelou três ações de terceiros que enviavam telemetria para
destinos não documentados.

**Auditoria de alterações** no arquivo da esteira, com aprovação obrigatória.

E uma verificação que passou a rodar continuamente: comparar o que está publicado no
registro com o que a esteira produziu. Um artefato sem correspondência dispara alerta.

A esteira tinha sido configurada anos antes, por conveniência, e
nunca revisada sob a ótica de segurança. Ela era o componente com mais privilégios da
organização e o menos governado.

## Conceitos Relacionados

- [Confiança na Cadeia de Suprimentos](/10-security/supply-chain-trust.md) — os
  fundamentos.
- [Contêineres na Entrega](/14-devops-and-platform/containers-in-delivery.md) — proveniência do artefato.
- [Segredos](/10-security/secrets.md).
- [Menor Privilégio](/10-security/least-privilege.md).

## Exercício Prático

Verifique se uma contribuição externa ao seu repositório consegue alterar a configuração
da esteira e executá-la com acesso a segredos.

Depois liste o que a credencial da sua esteira pode fazer em produção — não o que ela
faz, o que ela **pode**.

## Perguntas de Entrevista

- Por que a esteira deve ser tratada como ambiente de produção?
- Por que verificar na admissão é proteção independente da esteira?
- Por que separar construção de implantação limita o dano?

## Para Aprofundar

- SLSA — Supply-chain Levels for Software Artifacts.
- NIST SP 800-218 — Secure Software Development Framework.
- OpenSSF — melhores práticas de segurança em esteiras.
