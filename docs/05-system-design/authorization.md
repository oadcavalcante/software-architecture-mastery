---
id: authorization
title: Autorização
sidebar_position: 18
description: Decidir o que cada um pode fazer — e onde essa decisão é tomada e verificada.
doc_type: concept
level: 3
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor escolhe o modelo de autorização e o ponto de verificação
  adequados, e sabe por que verificar só na interface é insuficiente.
prerequisites: [authentication]
related: [authentication, service-boundaries, authz-models]
canonical_for: [autorização, controle de acesso, permissão]
content_version: 1
last_reviewed: 2026-08-27
---

# Autorização

## Visão Geral

Autorização responde **o que esta identidade pode fazer**. Ela pressupõe
[autenticação](/05-system-design/authentication.md) resolvida.

A decisão de sistema é onde a regra de permissão mora e onde ela é verificada — e
a resposta errada mais comum é "na interface".

## Problema

Autorização começa simples — administrador pode tudo, usuário pode o seu — e
cresce de forma previsível.

Depois vem "gerente pode ver os pedidos da sua região". Depois "o próprio dono pode
editar, mas só antes de aprovado". Depois "o financeiro pode aprovar até um valor,
acima disso precisa de diretor".

Cada regra é adicionada onde é mais conveniente: um `if` no controlador, uma
condição na consulta, uma verificação na tela. Ao final, a regra de quem pode o
quê não existe em lugar nenhum — está espalhada, e ninguém consegue responder
"quem pode aprovar uma despesa de 50 mil?" sem ler o sistema.

## Conceitos Centrais

### Os modelos, em ordem de expressividade

**Por papel.** O usuário tem papéis; papéis têm permissões. Simples e explode
quando as regras dependem de contexto — surge `gerente_regiao_sul`,
`gerente_regiao_sul_leitura`, e a combinatória cresce.

**Por atributo.** A decisão considera atributos do usuário, do recurso e do
ambiente: *pode editar se é o dono, o pedido não foi aprovado, e está no horário
comercial*. Expressivo e mais difícil de auditar.

**Por relacionamento.** A permissão deriva de relações entre entidades: *pode ver
o documento porque pertence à pasta que pertence à equipe da qual é membro*.
Adequado a hierarquias e a compartilhamento.

A maior parte dos sistemas começa por papel e precisa de atributo antes do que
imagina. O sinal é o aparecimento de papéis com sufixo de contexto.

### Onde a decisão é tomada

Separar dois papéis ajuda:

**Ponto de decisão** — onde a regra é avaliada. Pode ser uma biblioteca embutida,
um serviço dedicado, ou o próprio domínio.

**Ponto de imposição** — onde a decisão é aplicada. Gateway, serviço, ou consulta
ao banco.

Centralizar a decisão dá auditabilidade e uniformidade. Distribuí-la dá latência
menor e independência. Sistemas maduros costumam centralizar a **política** e
distribuir a **avaliação**.

### A interface não é ponto de imposição

Esconder um botão não é autorização — é conveniência de interface.

Toda verificação precisa acontecer no servidor, em cada operação. A interface
oculta o que o usuário não pode fazer para não frustrá-lo; o servidor impede.

Isso parece óbvio e é a falha de autorização mais comum em auditorias: um endpoint
que só era chamado por uma tela restrita, e que ninguém protegeu porque "só o
administrador vê o botão".

### Autorização em listagem é diferente

Verificar uma operação sobre um recurso é direto. Listar **apenas o que o usuário
pode ver** é outro problema.

Filtrar depois de buscar é errado: a paginação quebra — a página de 20 vira 7 — e
o banco trabalha à toa.

A regra precisa entrar na consulta. Isso significa que a autorização não é
puramente uma camada externa: ela participa do acesso a dados, e é a razão pela
qual centralizá-la completamente é difícil.

### Autorização é do domínio

"Pedido enviado não pode ser cancelado" parece autorização e é regra de negócio.
Ela pertence ao [agregado](/04-domain-driven-design/aggregate.md), não a um
serviço de permissão.

A separação útil: **permissão** é sobre quem — papéis, atributos, relações.
**Regra de negócio** é sobre o estado do recurso. Misturar as duas espalha o
domínio para dentro do mecanismo de autorização.

## Modelo Mental

**Duas perguntas: esta identidade tem permissão, e este recurso admite a
operação?** A primeira é autorização; a segunda é domínio.

## Quando Usar

- Qualquer sistema com mais de um tipo de usuário.
- Dados que pertencem a alguém.
- Operações com consequência diferente por perfil.
- Requisito de auditoria sobre quem podia o quê.

## Quando Não Usar

**Modelo por atributo quando papéis bastam.** Expressividade sem necessidade
dificulta auditar.

**Serviço centralizado de autorização em sistema pequeno.** Uma chamada de rede por
verificação, para regras que caberiam numa biblioteca.

**Verificação apenas na borda.** O gateway não conhece o recurso; ele pode checar
papel, não propriedade.

**Verificação apenas na interface.** Não é verificação.

**Autorização carregando regra de negócio.** Ela pertence ao domínio.

## Alternativas

- **Verificação no domínio** — quando a regra depende do estado do recurso.
- **Filtro na consulta** — para listagem.
- **Biblioteca embutida** — política declarada, avaliada localmente. Evita a
  chamada de rede.
- **Serviço dedicado** — quando há muitos serviços e a política precisa ser única.

## Trade-offs

| Centralizado | Distribuído |
|---|---|
| Política única e auditável | Cada serviço decide |
| Uma chamada por verificação | Avaliação local |
| Ponto único de falha | Independente |
| Difícil para listagem | Natural na consulta |
| Mudança de política num lugar | Coordenação entre serviços |

| Por papel | Por atributo |
|---|---|
| Simples de entender e auditar | Expressivo |
| Explode com contexto | Absorve contexto |
| Fácil de responder "quem pode X" | Exige avaliar a política |

## Modos de Falha

**Endpoint desprotegido.** Só a tela restringia.

**Referência direta insegura.** Trocar o identificador na URL acessa recurso
alheio — o servidor verificou o papel e não a propriedade.

**Filtro após a busca.** Paginação inconsistente e trabalho desperdiçado.

**Explosão de papéis.** Dezenas de papéis com sufixo de contexto.

**Permissão que nunca é removida.** Usuários acumulam acesso ao mudar de função.

**Negação silenciosa.** O sistema esconde em vez de negar, e o usuário não entende
por que não vê algo.

## Erros Comuns

**Confiar na interface.**

**Verificar papel e não propriedade.** É a origem da referência insegura.

**Filtrar em memória.**

**Misturar regra de negócio com permissão.**

**Não auditar acesso concedido.** Sem registro, "quem podia o quê em tal data" não
tem resposta.

## Exemplo Real

Um sistema de prontuário eletrônico usava papéis: `medico`, `enfermeiro`,
`administrativo`, `paciente`.

Uma auditoria encontrou dois problemas.

**Referência insegura.** O endpoint `GET /prontuarios/{id}` verificava se o
usuário tinha papel `medico`. Qualquer médico do hospital podia ler o prontuário
de qualquer paciente, inclusive de outras especialidades e unidades — o que
violava a regra de acesso mínimo exigida pela regulação.

O papel estava certo; faltava a relação. O médico só deveria ver prontuários de
pacientes sob seu cuidado.

**Listagem filtrada em memória.** A busca trazia todos os prontuários e filtrava
depois. Além do desperdício, a paginação era inconsistente: uma página de 20
podia mostrar 3.

As correções.

O modelo passou de papel para relacionamento: a permissão deriva de existir um
vínculo de atendimento ativo entre profissional e paciente. Papéis continuam
existindo para o que é genuinamente por perfil — quem pode prescrever, quem pode
dar alta.

A verificação de propriedade entrou em cada operação sobre recurso identificado,
e a listagem passou a filtrar na consulta, pelo vínculo.

E foi adicionado registro de auditoria de todo acesso a prontuário, com quem,
quando e por qual vínculo — exigência regulatória que não estava sendo atendida.

O que tornou o caso instrutivo: o sistema tinha autorização, e ela verificava a
pergunta errada. Papel responde "que tipo de coisa você pode fazer"; relação
responde "sobre qual recurso".

## Conceitos Relacionados

- [Autenticação](/05-system-design/authentication.md) — o pré-requisito.
- [Fronteiras de Serviço](/05-system-design/service-boundaries.md) — onde impor.
- [Segurança](/10-security/index.md) — modelos, menor privilégio e
  auditabilidade.
- [Aggregate](/04-domain-driven-design/aggregate.md) — onde a regra de negócio
  mora.

## Exercício Prático

Escolha um endpoint que recebe o identificador de um recurso. Autentique-se como
um usuário e tente acessar o recurso de outro trocando o identificador.

Se funcionar, você encontrou uma referência direta insegura — a falha de
autorização mais comum e a mais fácil de explorar.

## Perguntas de Entrevista

- Qual a diferença entre verificar papel e verificar propriedade?
- Por que filtrar resultados em memória é problema?
- O que distingue autorização de regra de negócio?

## Para Aprofundar

- OWASP — *Authorization Cheat Sheet* e a categoria de controle de acesso
  quebrado.
- NIST SP 800-162 — controle de acesso baseado em atributos.
