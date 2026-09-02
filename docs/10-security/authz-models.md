---
id: authz-models
title: Modelos de Autorização
sidebar_position: 16
description: Por papel, por atributo, por relação — e o critério para escolher, que raramente é discutido.
doc_type: tradeoff
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor escolhe o modelo de autorização a partir da forma das regras
  do domínio, não por familiaridade.
prerequisites: [identity]
related: [least-privilege, identity, secure-boundaries]
canonical_for: [RBAC, ABAC, ReBAC, política de autorização]
content_version: 2
last_reviewed: 2026-08-28
---

# Modelos de Autorização

## Visão Geral

Autorização responde: **este requisitante pode fazer esta ação neste recurso?**

Três modelos dominam, e eles não são alternativas equivalentes — cada um expressa
bem uma forma diferente de regra:

```text
por papel     "gerentes podem aprovar"
por atributo  "pode aprovar se o valor for menor que o limite dele"
por relação   "pode editar porque é dono do documento"
```

Escolher o errado produz um sistema que ou não expressa a regra, ou a expressa de
forma que ninguém consegue manter.

## Problema

O modelo por papel é o mais conhecido, e por isso é adotado por padrão.

Ele funciona bem até a primeira regra que depende de contexto: "pode aprovar, mas só
até dez mil reais", "pode ver, mas só os da própria filial", "pode editar, mas só se
for o autor".

A saída comum é criar papéis mais específicos — `gerente_filial_sp_ate_10k` — e o
número de papéis explode. Chega-se a centenas, ninguém sabe o que cada um faz, e
conceder acesso vira adivinhação.

Isso não é falha de implementação. É o modelo sendo usado para expressar algo que ele
não expressa.

## Conceitos Centrais

### Por papel

Permissões são agrupadas em papéis; usuários recebem papéis.

```text
usuário → papel → permissões
```

**Onde funciona bem:** organizações com funções estáveis e bem definidas, regras que
não dependem do recurso específico, e necessidade de revisar acesso por função.

**Onde quebra:** quando a permissão depende de algo além de quem é o usuário —
atributo do recurso, contexto da requisição, relação entre os dois.

O sinal de que quebrou é a explosão de papéis. Se você tem mais papéis que funções
reais na organização, o modelo está sendo forçado.

### Por atributo

A decisão é uma função de atributos do usuário, do recurso, da ação e do ambiente.

```text
permitir se
  usuario.departamento == recurso.departamento
  e usuario.limite >= recurso.valor
  e ambiente.horario dentro do expediente
```

**Onde funciona bem:** regras que dependem de contexto, condições que combinam várias
dimensões, e políticas que precisam mudar sem alterar código.

**Onde custa:** a decisão precisa de todos os atributos disponíveis no momento da
avaliação — o que significa buscá-los, com latência e possibilidade de estarem
desatualizados.

E depurar "por que este acesso foi negado?" é significativamente mais difícil que no
modelo por papel.

### Por relação

A decisão deriva de relações entre entidades, percorridas como um grafo.

```text
usuário é editor do documento
documento está na pasta X
usuário é visualizador da pasta X → herda visualização dos documentos
```

**Onde funciona bem:** compartilhamento, hierarquias de recurso, herança de permissão,
colaboração. É o modelo de sistemas de arquivos compartilhados e ferramentas
colaborativas.

**Onde custa:** exige infraestrutura própria — um armazenamento de relações e um
mecanismo de travessia. E as duas perguntas de listagem não custam a mesma coisa. "Quem tem
acesso a este documento?" corre a favor do índice, que é organizado por objeto, embora exija
resolver recursivamente os conjuntos de usuários que a resposta referencia. Já "que documentos
esta pessoa vê?" corre contra o índice: é a direção que o artigo original não cobre, e que os
sistemas derivados dele acrescentaram depois com um índice invertido próprio. Se o produto
precisa de listagem filtrada por usuário — e produtos de colaboração quase sempre precisam —,
esse é o custo a orçar, não a verificação.

### O critério de escolha

A pergunta não é "qual é o melhor?". É **de que a permissão depende?**

```text
só de quem é o usuário            → papel
de atributos do recurso ou contexto → atributo
de uma relação entre eles          → relação
```

A maioria dos sistemas reais precisa de mais de um. A combinação usual: papéis para
permissões grosseiras — quem pode acessar a área administrativa — e relação ou
atributo para as finas — quais registros especificamente.

Tentar expressar tudo em um único modelo é a origem tanto da explosão de papéis
quanto de políticas por atributo ilegíveis.

### Separar a decisão da aplicação

Independentemente do modelo, uma separação estrutural se paga quando há mais de um serviço
aplicando a mesma política, ou quando a política muda com frequência maior que a implantação.
Em serviço único e política estável, decisão e aplicação no mesmo processo é o desenho certo
— e o [canônico de autorização](/05-system-design/authorization.md) trata o serviço
centralizado em sistema pequeno como caso de não usar.

**Ponto de decisão.** Avalia a política e responde permitido ou negado.

**Ponto de imposição** (ou de aplicação). Pergunta e obedece. O canônico usa a primeira
forma.

Isso permite mudar política sem tocar em cada serviço, e auditar decisões num lugar
só.

O risco é a latência de uma chamada por verificação. As implementações práticas trocam essa
latência por **avaliação local**: a política é distribuída para os serviços e avaliada em
memória, com atualização periódica.

A troca tem preço, e é o mesmo que a seção sobre atributos desatualizados descreve, um nível
acima. Uma revogação só passa a valer na próxima atualização, e a janela de propagação vira um
número que precisa ser conhecido e declarado — de segundos a minutos, conforme o mecanismo. Se
a distribuição trava, os serviços continuam decidindo, e decidem por política velha sem que
nada falhe: é o modo de falha silencioso do desenho, e por isso a idade da política em cada
serviço precisa ser observável.

### A autorização pertence a quem detém o recurso

Vale repetir, porque é o erro estrutural mais comum: um serviço que aceita
`usuario_id` do chamador e confia nele delegou autorização a quem pede.

A decisão precisa ser tomada por quem detém o recurso, com base na identidade
verificada do token — nunca em parâmetro. Ver
[fronteiras seguras](/10-security/secure-boundaries.md).

### Negar por padrão

A política deve ser: nada é permitido a menos que uma regra permita.

O contrário — permitir salvo negação explícita — significa que uma regra esquecida
abre acesso em vez de fechá-lo. Ver
[modos de falha de segurança](/10-security/security-failure-modes.md).

## Modelo Mental

**O modelo de autorização deve ter a forma das regras do domínio.** Forçar a regra no
modelo errado produz complexidade que ninguém consegue manter.

## Quando Usar

- **Papel:** funções organizacionais estáveis, permissões grosseiras, necessidade de
  revisão por função.
- **Atributo:** regras dependentes de contexto, limites, condições combinadas.
- **Relação:** compartilhamento, hierarquia, colaboração, herança.
- **Combinação:** papel para o grosso, relação ou atributo para o fino — o desenho
  mais comum.

## Quando Não Usar

**Papel para regras dependentes de contexto.** A explosão é certa.

**Atributo para tudo.** Políticas ilegíveis e difíceis de depurar.

**Relação sem infraestrutura.** Implementar travessia de grafo à mão sobre um banco
relacional escala mal.

**Relação para autorização que não é sobre compartilhamento.** Se ninguém concede acesso a
ninguém — se a permissão vem de quem a pessoa é ou de onde ela está —, o grafo é uma estrutura
sem arestas interessantes, e a infraestrutura se paga sem entregar nada.

## Alternativas

- **Lista de controle de acesso** — permissões diretas por recurso. Simples, e não
  escala em número de recursos.
- **Autorização no banco** — segurança em nível de linha, imposta pelo armazenamento.
  Forte, e amarra a política ao banco.
- **Capacidades** — o token carrega a permissão para um recurso específico. Elegante
  para casos como links de compartilhamento.
- **Serviço de autorização dedicado** — quando a política é complexa e compartilhada
  entre muitos serviços.

## Trade-offs

| Papel | Atributo | Relação |
|---|---|---|
| Prever o resultado: leia o papel | Prever o resultado: simule a política | Prever o resultado: percorra o grafo |
| O que a decisão precisa saber: quem é | O que a decisão precisa saber: o contexto | O que a decisão precisa saber: as relações |
| Revisão por função fácil | Revisão difícil | Listagem por usuário é cara |
| Sem busca de dados | Precisa dos atributos | Precisa do grafo |
| Estável | Muda sem código | Muda com os dados |

| Decisão centralizada | Verificação no código |
|---|---|
| Política num lugar | Espalhada |
| Auditoria uniforme | Difícil |
| Latência ou distribuição | Nenhuma |
| Mudança sem implantar | Exige implantação |

## Modos de Falha

**Explosão de papéis.** Centenas, sem significado claro.

**Política por atributo ilegível.** Ninguém consegue prever o resultado.

**Verificação esquecida** num endpoint novo.

**Autorização por parâmetro do chamador.**

**Permissão concedida e não revisada.** Ver
[menor privilégio](/10-security/least-privilege.md).

**Atributos desatualizados.** A decisão usa um valor antigo.

**Negação sem registro.** Não se detecta tentativa sistemática.

## Erros Comuns

**Escolher por familiaridade.** Papel é o modelo que todo mundo conhece, então a regra
dependente de contexto vira um papel novo — e é assim que se chega a 214 papéis, como no
Exemplo Real.

**Criar papéis para expressar contexto.**

**Espalhar verificações pelo código.** Um endpoint novo esquece a verificação, e nada
falha: a rota funciona, e ninguém percebe até alguém acessar o que não devia.

**Permitir por padrão.** O erro de configuração passa a ser silencioso, e a ausência de
regra vira permissão. Negar por padrão faz o mesmo erro aparecer como chamado de suporte.

**Não registrar negações.**

**Não conseguir responder "quem tem acesso a isto?"** — pergunta que toda auditoria
faz.

## Exemplo Real

Uma plataforma de gestão de documentos começou com autorização por papel: três papéis
— administrador, editor, leitor.

Conforme os clientes cresceram, as regras ficaram específicas:

"O editor pode editar apenas documentos da sua área." "O leitor pode ver documentos
compartilhados com ele." "Documentos em pastas de recursos humanos exigem papel
específico." "O autor sempre pode editar, independentemente da área."

A resposta foi criar papéis: em três anos eram **214 papéis**, com nomes como
`editor_juridico_contratos_leitura_rh`.

Os problemas resultantes:

**Concessão por adivinhação.** Ninguém sabia qual papel dar. A prática virou copiar
os papéis de um colega parecido — o que espalhava permissões indevidas.

**Auditoria impossível.** A pergunta "quem pode ver este contrato?" não tinha resposta
sem inspecionar os 214 papéis.

**Regras contraditórias.** Dois papéis do mesmo usuário davam respostas opostas, e o
comportamento dependia da ordem de avaliação.

**Verificações espalhadas.** A lógica estava em 60 lugares no código, com
implementações ligeiramente diferentes. Um endpoint novo esqueceu a verificação e
expôs documentos por dois meses.

A reformulação usou dois modelos:

**Papel para permissões grosseiras.** Quatro papéis, correspondendo a funções reais:
administrador da organização, membro, convidado, auditor. Eles decidem o que a pessoa
pode fazer no produto.

**Relação para permissões finas.** Quem pode ver qual documento passou a derivar de
relações — é autor, foi compartilhado, é membro da pasta, é membro da área que
contém a pasta.

**Ponto de decisão único**, com política distribuída e avaliada localmente nos
serviços. As 60 verificações viraram uma chamada padronizada.

**Registro de todas as decisões**, permitindo responder "quem tem acesso a isto?" e
"por que este acesso foi negado?".

Resultado: 214 papéis viraram 4, e as regras que os papéis tentavam expressar
passaram a ser relações — que é o que elas sempre foram.

O ponto que a equipe sublinha: nenhum dos 214 papéis foi criado por engano. Cada um
resolvia uma necessidade legítima, com o único mecanismo disponível. O erro estava um
nível acima — no modelo escolhido no primeiro mês, para um produto cujas regras ainda
não existiam.

## Conceitos Relacionados

- [Menor Privilégio](/10-security/least-privilege.md) — o princípio.
- [Identidade](/10-security/identity.md) — a pergunta anterior.
- [Fronteiras Seguras](/10-security/secure-boundaries.md) — onde a decisão é aplicada.
- [Autorização](/05-system-design/authorization.md) — o nível de design de
  sistemas.

## Exercício Prático

Liste as cinco regras de autorização mais complexas do seu sistema e classifique cada
uma: depende de quem é o usuário, de atributos, ou de uma relação?

Se a maioria for relação e você usa papéis, você tem uma explosão de papéis em
formação.

## Perguntas de Entrevista

- Qual o critério para escolher entre os três modelos?
- Qual o sinal de que o modelo por papel está sendo forçado?
- Por que autorização pertence a quem detém o recurso?

## Para Aprofundar

- Hu, Vincent C. et al. *Guide to Attribute Based Access Control (ABAC) Definition and
  Considerations*. NIST SP 800-162, 2014.
- Pang, Ruoming et al. *Zanzibar: Google's Consistent, Global Authorization System*. USENIX
  ATC, 2019.
- Sandhu, Ravi et al. *Role-Based Access Control Models*. IEEE Computer, 1996.
