---
id: secrets
title: Segredos
sidebar_position: 5
description: Senhas, chaves e tokens que o sistema precisa guardar — e os lugares onde eles sempre vazam.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor elimina segredos estáticos onde possível e gerencia os
  restantes com rotação e auditoria.
prerequisites: [security]
related: [key-management, supply-chain-trust, least-privilege]
canonical_for: [segredo, gerenciador de segredos, rotação de credencial, vazamento de segredo]
content_version: 1
last_reviewed: 2026-08-28
---

# Segredos

## Visão Geral

Segredos são as credenciais que o sistema precisa para funcionar: senha de banco,
chave de API, token de serviço, chave de assinatura, certificado privado.

Eles têm uma propriedade inconveniente: precisam estar acessíveis ao código em tempo
de execução, e essa acessibilidade é exatamente o que os expõe.

A estratégia moderna não é guardá-los melhor. É **não tê-los** — substituindo
credenciais estáticas por identidade de plataforma e credenciais efêmeras. O que
sobra recebe gestão adequada.

## Problema

Os lugares onde segredos vazam são conhecidos e se repetem:

```text
repositório de código      inclusive no histórico, após "remoção"
imagem de contêiner        em camadas anteriores. Ver contêineres
registros de aplicação     cabeçalhos, corpo de requisição, mensagens de erro
variáveis de ambiente      visíveis em listagem de processos e em despejos
arquivo de configuração    copiado, versionado, compartilhado
mensagem de chat           "manda a senha do banco aí"
ticket de suporte          colado numa descrição de problema
```

O denominador comum: cada um é um lugar onde a informação foi para resolver algo, e
ficou.

E há um agravante estrutural: segredos estáticos **não expiram**. Um vazado em 2021
continua válido em 2026, a menos que alguém o rotacione.

## Conceitos Centrais

### A melhor gestão é a ausência

A mudança de maior impacto: substituir credenciais estáticas por mecanismos que não
exigem segredo armazenado.

**Identidade de plataforma.** A aplicação assume um papel e recebe credenciais
temporárias, rotacionadas automaticamente. Nada a guardar. Ver
[identidade em nuvem](../09-cloud-architecture/cloud-identity.md).

**Federação de identidade** para sistemas externos — esteiras de integração contínua
podem autenticar sem chave estática.

**Certificados de curta duração** em vez de senha.

**Credenciais dinâmicas de banco** — geradas sob demanda, com validade de horas.

Cada segredo eliminado é um que não precisa ser rotacionado, auditado nem procurado
em vazamentos.

### Gerenciador de segredos para o que sobra

O que ele entrega além de "guardar cifrado":

**Auditoria.** Quem leu qual segredo, quando.

**Controle de acesso por segredo.**

**Rotação** automática ou assistida.

**Versionamento**, permitindo voltar.

**Injeção em tempo de execução**, sem passar por disco.

A auditoria é o item subestimado: sem ela, um acesso indevido não deixa rastro, e
uma investigação não tem como saber o que foi comprometido.

### Rotação é o que limita o dano

Um segredo que nunca muda é um segredo que, uma vez vazado, vale para sempre.

```text
programada   troca periódica, independentemente de suspeita
sob demanda  troca imediata em resposta a incidente
```

A rotação sob demanda é a que importa num incidente, e ela só funciona se tiver sido
exercitada. A resposta a "quanto tempo levamos para trocar a senha do banco?" precisa
ser conhecida antes.

O padrão que permite rotação sem interrupção é manter **duas credenciais válidas**
simultaneamente durante a transição: cria-se a nova, atualizam-se os consumidores,
revoga-se a antiga. Sem isso, rotacionar exige parada — e por isso não é feita.

### Detecção precisa ser automática

Confiar em disciplina para não cometer o erro não funciona em escala.

**Verificação antes do envio**, no ambiente de desenvolvimento.

**Varredura no repositório**, incluindo o histórico completo.

**Monitoramento de repositórios públicos** — os provedores oferecem serviços que
detectam chaves suas expostas.

**Revogação automática** ao detectar. Uma chave exposta deve ser considerada
comprometida imediatamente, não avaliada.

### Segredo em repositório: remover não basta

O histórico do sistema de versão preserva tudo. Apagar o arquivo num commit posterior
mantém o segredo recuperável por qualquer pessoa com acesso ao repositório.

A única resposta correta é **rotacionar o segredo**. Reescrever o histórico é
desejável e secundário — clones e bifurcações já existentes continuam com a cópia.

Times que tratam o problema como "remova o arquivo" deixam a credencial válida.

### Ambiente de desenvolvimento merece segredos próprios

Usar credenciais de produção em desenvolvimento é comum e transforma cada máquina de
desenvolvedor num alvo com acesso produtivo.

Credenciais separadas por ambiente, com escopo restrito, contêm o problema. E dados
de desenvolvimento não deveriam ser cópia de produção — ver
[proteção de dados](data-protection.md).

## Modelo Mental

**O melhor segredo é o que não existe.** Para os que existem: rotação exercitada,
acesso auditado, e detecção automática.

## Quando Usar

Gestão explícita se aplica sempre que houver credencial. Prioridade quando:

- Existem credenciais estáticas de longa duração.
- Vários serviços compartilham a mesma credencial.
- Há acesso de terceiros.
- Nunca houve rotação.
- Não há auditoria de acesso a segredos.

## Quando Não Usar

**Segredo estático quando há identidade de plataforma disponível.**

**Segredo em variável de ambiente** quando o gerenciador permite injeção direta —
variáveis vazam em despejos e listagens.

**Compartilhar credencial entre serviços.** Impede saber quem usou e obriga a
rotacionar tudo junto.

**Credencial de produção em desenvolvimento.**

**Rotação sem suporte a duas credenciais válidas.** Não vai acontecer.

**Confiar em disciplina** sem detecção automática.

## Alternativas

- **Identidade de plataforma** — elimina o segredo.
- **Credenciais dinâmicas** — geradas sob demanda, curta duração.
- **Certificados** com autoridade própria, em vez de senha.
- **Cifragem envelopada** para segredos versionados junto ao código, quando não há
  gerenciador. Ver [gestão de chaves](key-management.md).

## Trade-offs

| Gerenciador | Variável de ambiente |
|---|---|
| Auditoria de acesso | Nenhuma |
| Rotação sem reimplantar | Exige reimplantação |
| Acesso por segredo | Tudo ou nada |
| Dependência em tempo de execução | Nenhuma |
| Complexidade adicional | Trivial |

| Credencial estática | Efêmera |
|---|---|
| Simples | Infraestrutura de emissão |
| Vaza permanentemente | Janela curta |
| Rotação manual | Automática |
| Funciona em qualquer lugar | Exige plataforma compatível |

## Modos de Falha

**Segredo no repositório.**

**Segredo em registro de aplicação.**

**Nunca rotacionado.**

**Compartilhado entre serviços.** Um comprometimento obriga a trocar tudo.

**Rotação que causa parada.** Por isso nunca é feita.

**Gerenciador indisponível.** A aplicação não sobe.

**Segredo em imagem de contêiner.** Ver
[contêineres](../09-cloud-architecture/containers.md).

## Erros Comuns

**Não eliminar segredos quando há alternativa.**

**Remover do repositório sem rotacionar.**

**Não auditar acesso.**

**Não exercitar rotação.**

**Usar credencial de produção em desenvolvimento.**

**Não filtrar segredos dos registros.**

## Exemplo Real

Uma empresa de tecnologia descobriu, por notificação automática do provedor de
hospedagem de código, uma chave de acesso à nuvem exposta num repositório público.

O repositório era um projeto de exemplo, publicado por um engenheiro dois anos
antes, com uma chave real usada em testes.

O que a investigação encontrou:

**A chave estava ativa.** Nunca rotacionada em dois anos.

**Permissão ampla.** Criada com acesso de administrador porque "era só para testes".

**Uso confirmado.** Os registros mostravam acessos de endereços desconhecidos nos
últimos quatro meses.

A auditoria seguinte, no ambiente inteiro:

**Segredos em repositórios internos.** A varredura do histórico completo encontrou
47 credenciais, das quais 31 ainda válidas — incluindo senhas de banco de produção.

**Registros com segredos.** Um serviço registrava o corpo completo de requisições com
erro, incluindo tokens de parceiros.

**Credencial compartilhada.** Onze serviços usavam a mesma credencial de banco.
Rotacioná-la exigiria coordenar onze implantações, o que era o motivo de nunca ter
sido feita.

**Sem auditoria.** Não havia como saber quem tinha lido qual segredo.

A reformulação, ao longo de dez meses:

**Eliminação.** Aplicações na nuvem passaram a usar identidade de plataforma. A
esteira passou a usar federação. Isso removeu cerca de 60% dos segredos.

**Gerenciador de segredos** para o resto, com acesso auditado por segredo.

**Credencial por serviço.** Os onze passaram a ter credenciais próprias, com escopo
distinto. Rotacionar uma deixou de afetar as demais.

**Rotação com duas credenciais válidas**, exercitada trimestralmente.

**Varredura antes do envio e no histórico**, com revogação automática ao detectar.

**Filtro de segredos nos registros.**

O que a equipe registra: a chave exposta no repositório público foi o gatilho, e era
o menor dos problemas. O que a auditoria revelou — 31 credenciais válidas em
repositórios internos, sem nenhuma auditoria de uso — era muito maior e não tinha
gerado nenhum alerta em dois anos.

## Conceitos Relacionados

- [Gestão de Chaves](key-management.md) — o caso especial das chaves criptográficas.
- [Menor Privilégio](least-privilege.md) — o escopo do que vaza.
- [Confiança na Cadeia de Suprimentos](supply-chain-trust.md).
- [Identidade em Nuvem](../09-cloud-architecture/cloud-identity.md).

## Exercício Prático

Rode uma varredura de segredos no **histórico completo** dos seus repositórios, não
só no estado atual.

Para cada achado, a pergunta não é "ainda está lá?" — é "essa credencial ainda é
válida?".

## Perguntas de Entrevista

- Por que remover um segredo do repositório não resolve?
- O que um gerenciador entrega além de guardar cifrado?
- Por que credencial compartilhada entre serviços impede rotação?

## Para Aprofundar

- OWASP. *Secrets Management Cheat Sheet*.
- NIST SP 800-57 — gestão de material criptográfico.
- Documentação de gerenciadores de segredos dos principais provedores.
