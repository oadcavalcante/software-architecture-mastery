---
id: supply-chain-security
title: Segurança da Esteira
sidebar_position: 12
description: A esteira é ambiente de produção, e é tratada como se não fosse.
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
content_version: 3
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

Quem controla o que a esteira executa controla o que roda em produção, sem tocar no
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

A primeira linha é a que fecha o caminho descrito na Visão Geral: o arquivo enviado por
quem está fora do projeto deixa de ser o que executa com as credenciais.

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

Ver [menor privilégio](/10-security/least-privilege.md): a permissão de alterar
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

O custo aparece no dia em que a verificação falha por motivo alheio a ataque (serviço de
assinatura fora, chave rotacionada sem propagar) durante um incidente que exige
implantar. Sem saída de emergência, a correção espera. A saída precisa existir antes:
um caminho de exceção com aprovação de duas pessoas, registro próprio e alerta a cada
uso, porque um desvio silencioso é exatamente o caminho que a verificação fecha.

Ver [contêineres na entrega](/14-devops-and-platform/containers-in-delivery.md).

### Dependências da construção também são código

Ações, plugins e imagens de construção executam com o privilégio da esteira.

```text
fixar por versão exata ou por digest, nunca por etiqueta móvel
revisar ações de terceiros antes de adotar
espelhar internamente as críticas
```

Uma ação de terceiro referenciada por etiqueta pode ser reapontada pelo mantenedor (ou
por quem comprometer a conta dele) e passa a executar código novo em todas as esteiras
que a usam.

Fixar por digest transfere o trabalho: a atualização deixa de chegar sozinha e alguém
precisa propor, revisar e aplicar cada nova versão. Sem automação que abra essas
propostas, os digests congelam e a esteira acumula vulnerabilidades conhecidas: o
oposto do objetivo. O espelho interno tem o mesmo custo multiplicado: é mais um serviço
para manter disponível, sincronizar e varrer.

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

Um comprometimento de esteira sem registro é indistinguível de operação normal, o
que torna a investigação impossível.

### O registro de artefatos é fronteira de confiança

Os requisitos operacionais do registro (retenção, imutabilidade, limpeza) estão em
[contêineres na entrega](/14-devops-and-platform/containers-in-delivery.md). Aqui
interessa o registro como alvo.

Um componente que costuma ficar fora da análise: o registro onde as imagens e os pacotes
ficam.

Ele é a última parada antes de produção, e comprometê-lo é equivalente a comprometer a
esteira, com a vantagem, para o atacante, de não deixar rastro no repositório de
código.

```text
quem publica          apenas a esteira, com credencial própria
quem consome          apenas os ambientes de destino
varredura             vulnerabilidades detectadas no que já está publicado
registro de acesso    quem baixou o quê, quando
```

Sem a primeira linha, as outras protegem pouco: credenciais de publicação distribuídas a
pessoas, ou compartilhadas entre esteiras, tornam o registro um caminho aberto.

E a terceira merece nota: uma imagem publicada há seis meses pode ter adquirido
vulnerabilidades conhecidas desde então. Varrer apenas na construção deixa de ver isso.
O que importa é a varredura contínua do que está publicado e em uso.

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

O núcleo (configuração protegida, credencial efêmera, verificação na implantação) vale
para qualquer esteira que alcance produção. O limite está nos controles mais caros:

**Esteira separada para contribuições externas, num repositório que não as aceita.** Sem
contribuidor de fora, o vetor que ela fecha não existe; aprovação de mantenedor no
arquivo da esteira cobre o caso interno.

**Aprovação humana em esteira que só publica para ambiente de teste**, sem dados reais e
sem credencial compartilhada com produção. A aprovação cobra latência em cada execução
para proteger um ambiente cujo comprometimento não alcança nada.

**Espelho interno e varredura contínua numa equipe sem quem os opere.** Um espelho que
ninguém sincroniza congela dependências vulneráveis e fica pior que a fonte pública que
substituiu. Fixar por digest, com atualização automatizada, cobre boa parte do risco sem
esse serviço a mais.

## Alternativas

- **Aprovação manual para implantar**: reduz o risco sem resolver o de construção.
- **Ambiente de implantação separado**: a esteira produz o artefato, outro processo
  implanta.
- **Esteira gerenciada**: o fornecedor cuida do isolamento, ao custo de menos controle.
- **Verificação de política na admissão**: o ambiente de destino recusa o que não
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
| Auditoria completa, com custo de retenção | Auditoria parcial, menos overhead |

| Construir e implantar separados | Juntos |
|---|---|
| Privilégio restrito por etapa | Privilégios somados num lugar |
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

**Credenciais estáticas amplas.** Uma chave de longa duração com permissão de administrador na esteira dá, sozinha, tudo que a esteira alcança em produção, e ela vaza em log de construção com facilidade.

**Não verificar assinatura na implantação.** Assinar sem verificar no momento de implantar é cerimônia: o controle só existe onde alguém recusa o que não confere.

**Não fixar dependências de construção.** Ações, imagens base e ferramentas referenciadas por etiqueta móvel entram na sua esteira em versões que ninguém revisou.

**Não separar construção de implantação.** Quando o mesmo processo compila e implanta, comprometer a construção é comprometer produção diretamente. Separá-los cria um ponto onde é possível verificar antes de aplicar.

## Exemplo Real

Uma empresa de tecnologia sofreu o comprometimento descrito em
[confiança na cadeia de suprimentos](/10-security/supply-chain-trust.md): uma
contribuição externa alterou a configuração da esteira e extraiu credenciais de
produção.

A proteção da configuração, a separação de esteiras e as credenciais efêmeras estão
descritas lá. As correções específicas da entrega, aplicadas às esteiras dos onze
serviços:

**Construção separada de implantação.** A construção produz o artefato assinado; um
processo distinto, com credenciais próprias e aprovação para produção, implanta.

**Verificação na admissão.** O ambiente de destino recusa artefatos sem assinatura e
proveniência válidas: proteção independente da esteira.

**Dependências fixadas por digest**, com as críticas espelhadas internamente. A troca de
etiquetas por digest foi a parte lenta: cada serviço referenciava de oito a quinze ações e
imagens, e a atualização passou a chegar como proposta automatizada, revisada como
qualquer outra alteração.

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

- [Confiança na Cadeia de Suprimentos](/10-security/supply-chain-trust.md): os
  fundamentos.
- [Contêineres na Entrega](/14-devops-and-platform/containers-in-delivery.md): proveniência do artefato.
- [Segredos](/10-security/secrets.md).
- [Menor Privilégio](/10-security/least-privilege.md).

## Exercício Prático

Verifique se uma contribuição externa ao seu repositório consegue alterar a configuração
da esteira e executá-la com acesso a segredos.

Depois liste o que a credencial da sua esteira pode fazer em produção: não o que ela
faz, o que ela **pode**.

## Perguntas de Entrevista

- Por que a esteira deve ser tratada como ambiente de produção?
- Por que verificar na admissão é proteção independente da esteira?
- Por que separar construção de implantação limita o dano?

## Para Aprofundar

- SLSA — Supply-chain Levels for Software Artifacts.
- NIST SP 800-218 — Secure Software Development Framework.
- OpenSSF — melhores práticas de segurança em esteiras.
