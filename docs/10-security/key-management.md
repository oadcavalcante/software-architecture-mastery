---
id: key-management
title: Gestão de Chaves
sidebar_position: 7
description: Onde a criptografia costuma falhar — não no algoritmo, mas em quem tem a chave e o que acontece se ela sumir.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor projeta hierarquia de chaves com rotação viável e plano para
  perda e comprometimento.
prerequisites: [encryption]
related: [encryption, secrets, data-protection]
canonical_for: [gestão de chaves, chave mestra, cifragem envelopada, rotação de chave]
content_version: 2
last_reviewed: 2026-08-28
---

# Gestão de Chaves

## Visão Geral

Criptografia moderna raramente falha no algoritmo. Ela falha na **chave**: quem tem
acesso, onde ela está guardada, o que acontece quando precisa mudar, e o que acontece
quando some.

Gestão de chaves é a parte difícil, e é a que costuma ser tratada como detalhe de
implementação depois que a decisão de cifrar foi tomada.

## Problema

Cifrar é a parte fácil — uma chamada de biblioteca. As perguntas que vêm depois é que
determinam se a proteção existe:

Onde a chave fica? Quem pode usá-la? Como ela é rotacionada sem tornar ilegíveis os
dados antigos? O que acontece se ela vazar? E se ela for perdida?

A última é a que causa mais dano acumulado: **chave perdida é dado perdido**, sem
recurso. Nenhuma cópia de segurança dos dados ajuda se a chave não existe mais.

## Conceitos Centrais

### Cifragem envelopada resolve a maior parte

O padrão que estrutura quase toda gestão de chaves:

```text
chave de dados   cifra o dado — uma por objeto, arquivo ou registro
chave mestra     cifra as chaves de dados — poucas, protegidas
```

O dado é cifrado com uma chave própria; essa chave é cifrada com a mestra e guardada
junto do dado.

Três vantagens:

**A chave mestra nunca toca o dado.** Ela pode viver num módulo de segurança que não
a exporta.

**Rotacionar a mestra é barato.** Basta recifrar as chaves de dados — pequenas — sem
tocar nos dados.

**O escopo do comprometimento é limitado.** Uma chave de dados vazada compromete
apenas o que ela cifrou.

### Rotação sem recifrar tudo

Rotacionar a chave que cifra terabytes é inviável se exigir recifrar tudo.

Com envelopamento, os dados antigos permanecem cifrados com suas chaves de dados, e
apenas o envelope muda. Os dados novos usam a chave mestra nova.

Isso exige que **a versão da chave seja guardada junto do dado** — para saber com o
quê decifrar. É um detalhe pequeno cuja ausência torna a rotação impossível depois.

### As chaves antigas não podem ser descartadas

Consequência direta do ponto anterior: enquanto existir dado cifrado com uma chave, a
chave precisa existir.

Descartar uma chave antiga "porque rotacionamos" torna os dados dela ilegíveis
permanentemente. Isso já aconteceu em sistemas reais, e a recuperação não existe.

O descarte só é seguro depois de recifrar tudo que dependia dela — ou quando o
descarte é **intencional**, como em cifragem por titular para apagamento.

### Módulo de segurança e serviço gerenciado

**Módulo de segurança de hardware.** A chave nunca sai em texto legível; operações
acontecem dentro do dispositivo. Custo alto, exigência regulatória em alguns setores.

**Serviço gerenciado de chaves.** O provedor opera o módulo; você chama a API. Cobre
a maioria dos casos com uma fração do custo e da operação.

**Chave em arquivo ou variável.** Aceitável apenas quando o modelo de ameaça
justifica, e raramente justifica.

A recomendação prática: serviço gerenciado, salvo exigência específica. Ver
[serviços gerenciados](/09-cloud-architecture/managed-services.md).

### Separação de deveres

Quem administra o armazenamento não deveria poder usar a chave. Quem pode usar a
chave não deveria poder alterar a política dela.

Sem essa separação, a cifragem não protege contra o administrador — que é
frequentemente a ameaça que se queria endereçar.

Na prática: políticas de chave e políticas de dados sob controle de papéis distintos,
com o uso auditado.

### Comprometimento e perda exigem planos diferentes

**Comprometimento.** A chave vazou. Resposta: rotacionar, recifrar o que for viável,
e avaliar o que foi exposto. Exige saber **o que aquela chave cifrava**, que é
informação que precisa existir antes.

**Perda.** A chave sumiu. Não há resposta técnica. A prevenção é cópia de segurança
da chave — que é ela mesma um problema, porque a cópia precisa da mesma proteção.

Serviços gerenciados resolvem a perda com durabilidade e versionamento. Chaves
autogeridas exigem procedimento explícito, tipicamente com custódia dividida entre
pessoas.

### Chave de assinatura merece tratamento à parte

Uma chave que assina [tokens](/10-security/jwt.md), artefatos ou atualizações tem uma propriedade
diferente: comprometê-la permite **forjar**, não apenas ler.

Um atacante com a chave de assinatura de tokens emite tokens válidos para qualquer
usuário, com qualquer permissão, e nenhuma verificação detecta.

Por isso essas chaves justificam proteção maior, rotação mais frequente e suporte a
múltiplas chaves válidas — para que a rotação não invalide tudo de uma vez. Ver
[confiança na cadeia de suprimentos](/10-security/supply-chain-trust.md).

## Modelo Mental

**A segurança da criptografia é a segurança da chave.** Todo o resto é detalhe de
implementação.

## Quando Usar

Gestão explícita é necessária sempre que houver cifragem. Prioridade quando:

- Há cifragem no nível do campo.
- Existe requisito regulatório sobre custódia.
- Chaves são usadas para assinatura.
- Há necessidade de apagamento por descarte de chave.
- Múltiplos sistemas compartilham dados cifrados.

## Quando Não Usar

**Chave junto do dado cifrado.**

**Chave em código ou em repositório.**

**Rotação sem guardar a versão da chave** junto do dado.

**Descartar chave antiga** antes de recifrar.

**Sem separação entre administrar e usar.**

**Sem plano para perda.** Otimismo não é estratégia.

**Módulo de hardware sem exigência que o justifique.** Custo e operação altos.

## Alternativas

- **Serviço gerenciado de chaves** — o padrão razoável.
- **Cifragem transparente da plataforma** — quando o modelo de ameaça é acesso ao
  meio. Ver [criptografia](/10-security/encryption.md).
- **Tokenização** — o dado sai do sistema; a chave deixa de ser problema local.
- **Não cifrar e não guardar** — a única forma de não ter chave para gerenciar.

## Trade-offs

| Serviço gerenciado | Autogerido |
|---|---|
| Durabilidade e disponibilidade do provedor | Sua responsabilidade |
| Auditoria pronta | A construir |
| Custo por operação | Custo de operação |
| Dependência do provedor | Controle |

| Envelopamento | Chave única |
|---|---|
| Rotação barata | Recifrar tudo |
| Comprometimento limitado | Total |
| Complexidade adicional | Simples |

## Modos de Falha

**Chave perdida.** Dado irrecuperável.

**Chave antiga descartada.** Dados antigos ilegíveis.

**Versão não registrada.** Impossível saber com o que decifrar.

**Chave junto do dado.**

**Chave de assinatura comprometida.** Permite forjar.

**Serviço de chaves indisponível.** Nada decifra — o sistema para.

**Sem inventário.** Não se sabe o que cada chave cifra, e o comprometimento não pode
ser avaliado.

## Erros Comuns

**Não guardar a versão da chave com o dado.** Depois da primeira rotação, não há como saber qual chave decifra qual registro, e a rotação passa a exigir recifrar tudo de uma vez.

**Não planejar rotação antes de cifrar.** Rotacionar é fácil quando previsto e quase impossível quando não: sem versionamento e sem convivência de chaves, a troca vira uma janela de indisponibilidade sobre a base inteira.

**Não manter inventário de chave para dado.** Sem saber o que cada chave protege, não há como avaliar o impacto de um comprometimento nem decidir a ordem de resposta.

**Guardar a chave no mesmo lugar que o dado.** Anula a proteção — quem obtém acesso ao armazenamento obtém os dois.

**Não separar administração de uso.** Quem usa a chave para decifrar não precisa poder exportá-la nem apagá-la. Sem essa separação, o comprometimento da aplicação vira comprometimento do material criptográfico.

**Tratar chave de assinatura como chave comum.** O comprometimento de uma chave de cifra expõe dados; o de uma chave de assinatura permite forjar identidade e autorização — dano de natureza diferente e maior.

## Exemplo Real

Uma instituição financeira cifrava documentos de clientes num armazenamento de
objetos, com uma chave simétrica guardada em configuração da aplicação.

Três problemas apareceram ao longo de quatro anos:

**Rotação impossível.** A chave nunca foi rotacionada, porque rotacionar exigiria
recifrar 14 milhões de documentos — estimado em três semanas de processamento e um
custo alto de leitura e escrita. A chave tinha quatro anos.

**Chave perdida, e sem versão para saber quais.** Uma tentativa anterior de rotação parcial
deixou cerca de 200 mil documentos cifrados com uma chave intermediária. Duas coisas deram
errado, e vale separá-las: a chave tinha sumido — foi isso que tornou os documentos
ilegíveis, até que alguém a encontrasse meses depois num repositório de configuração
desativado. A falta de versão no metadado custou outra coisa: sem ela, mesmo com todas as
chaves em mãos, classificar o acervo exigiu tentar decifrar cada objeto com cada chave
conhecida.

**Chave acessível a quem administrava o armazenamento.** A mesma equipe podia ler os
objetos e obter a chave. A cifragem não protegia contra o administrador, que era
justamente a ameaça citada na justificativa do projeto.

A reformulação:

**Envelopamento.** Cada documento passou a ter chave própria, cifrada por uma chave
mestra em serviço gerenciado. Rotacionar a mestra passou a ser uma operação de
minutos.

**Versão da chave** gravada nos metadados de cada objeto. A migração exigiu tentar
decifrar com cada chave conhecida para classificar o acervo — e foi assim que os 200
mil documentos foram identificados.

**Separação de deveres.** A política da chave mestra passou a ser controlada por um
papel distinto do que administra o armazenamento, com uso auditado.

**Inventário** de chave para conjunto de dados, mantido automaticamente.

E uma descoberta durante a migração: **a chave estava numa cópia de segurança da
configuração**, armazenada no mesmo armazenamento de objetos que ela protegia.

A lição registrada: a decisão de cifrar tinha sido bem tomada e bem justificada.
Nada além dela foi decidido — e quatro anos depois o sistema tinha cifragem sem
nenhuma das propriedades que a cifragem deveria entregar.

## Conceitos Relacionados

- [Criptografia](/10-security/encryption.md) — o que a chave protege.
- [Segredos](/10-security/secrets.md) — a categoria mais ampla.
- [Proteção de Dados](/10-security/data-protection.md).
- [JWT](/10-security/jwt.md) — chaves de assinatura.

## Exercício Prático

Para cada chave criptográfica do seu sistema, responda: onde ela está, quem pode
usá-la, quando foi rotacionada, e o que acontece se ela sumir agora.

A última pergunta costuma não ter resposta, e ela é a que produz perda permanente.

## Perguntas de Entrevista

- Como o envelopamento torna a rotação viável?
- Por que a versão da chave precisa ser guardada com o dado?
- Por que chave de assinatura merece tratamento diferente?

## Para Aprofundar

- NIST SP 800-57 — recomendações para gestão de chaves.
- Ferguson, Niels; Schneier, Bruce; Kohno, Tadayoshi. *Cryptography Engineering*.
  Wiley, 2010.
- Documentação de serviços gerenciados de chaves dos principais provedores.
