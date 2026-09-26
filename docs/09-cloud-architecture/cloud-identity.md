---
id: cloud-identity
title: Identidade em Nuvem
sidebar_position: 11
description: "Quem pode fazer o quê na sua infraestrutura: a camada onde os incidentes mais graves acontecem."
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor concede permissões pelo menor privilégio necessário e
  elimina credenciais de longa duração.
prerequisites: [cloud-architecture]
related: [cloud-networking, vendor-lock-in, managed-services, identity, least-privilege, auditability]
canonical_for: [identidade em nuvem, credencial de curta duração, papel de serviço]
content_version: 3
last_reviewed: 2026-08-27
---

# Identidade em Nuvem

## Visão Geral

Identidade e permissões definem quem (pessoa ou serviço) pode fazer o quê na sua
infraestrutura.

Na nuvem, essa camada tem alcance total: uma permissão excessiva não expõe um
recurso, expõe a capacidade de criar, ler, alterar e apagar tudo.

É a camada onde os incidentes mais graves acontecem, e a que menos recebe projeto,
tipicamente configurada por tentativa e erro, ampliando permissões até parar de dar
erro.

## Problema

O caminho de menor resistência é conceder permissão ampla: a aplicação não consegue
acessar o armazenamento, alguém dá acesso total ao serviço de armazenamento, o erro
some, e ninguém volta para restringir.

Isso se acumula. Depois de dois anos, o ambiente tem dezenas de identidades com
permissões muito além do necessário, e ninguém sabe quais são usadas de fato.

O custo aparece de uma vez: uma credencial vazada, um serviço comprometido, um
script com defeito. E o alcance do dano é o alcance da permissão.

## Conceitos Centrais

### Menor privilégio é o princípio, e ele é operacionalizável

Conceder apenas o necessário para a função, e nada além. Ver
[menor privilégio](/10-security/least-privilege.md) para o tratamento completo;
aqui interessa como aplicá-lo na nuvem.

Isso parece abstrato até virar procedimento:

**Comece negando tudo.** Adicione permissões conforme a necessidade real aparece,
não conforme a suposição.

**Use os registros de acesso.** A maior parte dos provedores registra quais
permissões foram de fato exercidas. Isso permite reduzir com base em dados, não em
palpite.

**Restrinja por recurso, não só por ação.** Permitir leitura em um armazenamento
específico é muito diferente de permitir leitura em todos.

**Revise periodicamente.** Permissões concedidas para uma tarefa temporária tendem a
permanecer.

### Identidade de serviço, não credencial de usuário

O erro estrutural mais comum: criar um usuário, gerar uma chave de acesso, e colocar
essa chave na aplicação.

Chaves de longa duração vazam (em repositórios, em imagens de contêiner, em
registros de aplicação, em variáveis de ambiente expostas) e não expiram.

A alternativa moderna: a aplicação assume um **papel** e recebe credenciais
temporárias, rotacionadas automaticamente. Nada a guardar, nada a vazar
permanentemente.

Isso vale para computação dentro da nuvem, e cada vez mais para sistemas externos,
por federação de identidade. A federação elimina chaves estáticas até em esteiras de
integração contínua.

**Eliminar credenciais de longa duração é a mudança de maior impacto desta seção.**

### Federação em vez de contas separadas

Pessoas devem entrar com a identidade corporativa, não com usuários criados dentro
do provedor. O mecanismo e o ganho de desprovisionamento estão em
[identidade](/10-security/identity.md); o que é próprio da nuvem é onde a conta local
nasce.

Todo provedor oferece usuário local com senha e chave de acesso, e é o caminho mais
curto no primeiro dia. Esse usuário fica fora do diretório corporativo: desativar a
pessoa lá não o alcança, e a chave emitida para ele continua válida.

### Fronteiras de conta são o isolamento real

Permissões dentro de uma conta são configuração; contas separadas são fronteira.

Separar produção de desenvolvimento em contas distintas faz com que o padrão seja
nenhum acesso entre elas: um erro em desenvolvimento só alcança produção por um
caminho concedido explicitamente (papel de confiança entre contas, rede
interconectada, esteira com permissão nas duas). Cada um desses caminhos é uma
política, e precisa do mesmo rigor; a diferença é que eles são poucos, nomeados e
auditáveis.

É também o que permite isolar cópias de segurança de forma significativa. Ver
[recuperação de desastre](/09-cloud-architecture/disaster-recovery.md).

Por isso a separação por conta é menos sujeita a erro humano que política dentro de
uma conta única: lá, isolar exige acertar todas as negações; aqui, romper o isolamento
exige errar uma concessão explícita.

### Escalonamento de privilégio é sutil

A lista de permissões que equivalem a permissão para tudo está em
[menor privilégio](/10-security/least-privilege.md). Duas delas têm forma própria na
nuvem.

**Anexar papel a instância.** Quem pode lançar uma máquina com um papel mais amplo que
o seu, e entrar nela, passa a agir com esse papel.

**Assumir papel em outra conta.** Uma relação de confiança escrita como "qualquer
identidade da conta X" transfere para a conta de destino tudo o que a conta X tiver de
mais frouxo.

### Auditoria precisa ser inviolável

As propriedades do registro inviolável estão em
[auditabilidade](/10-security/auditability.md). A decisão de nuvem é onde ele mora:
numa conta dedicada, para a qual as demais só escrevem. Assim, comprometer a conta
auditada não dá acesso ao registro dela.

## Modelo Mental

**Na nuvem, permissão é alcance.** O dano de qualquer comprometimento é
exatamente o que aquela identidade podia fazer.

## Quando Usar

Credencial temporária e menor privilégio valem assim que existe uma identidade com
acesso ao ambiente. Federação passa a compensar quando há diretório corporativo e mais
de uma pessoa; conta separada por ambiente, quando há alguém para operar a conta
adicional. Prioridade especial quando:

- Há dados sensíveis ou regulados.
- Várias equipes compartilham o ambiente.
- Há integrações externas com acesso.
- O ambiente cresceu organicamente sem revisão.

## Quando Não Usar

**Federação num ambiente de uma pessoa e uma conta.** Sem diretório corporativo, montar
um provedor de identidade só para federar custa mais que desativar um usuário local à
mão. O corte é quando o número de pessoas torna o desprovisionamento manual algo que
alguém pode esquecer.

**Credencial temporária para integração que não a suporta.** Serviço de terceiro que só
aceita chave estática não vira papel por decisão sua. Aí a chave fica, com o alcance
mínimo, em gerenciador de segredos e com rotação. Tentar forçar um intermediário de
troca de credencial acrescenta uma peça que falha sem reduzir o risco da chave.

**Granularidade por recurso além do limite do provedor.** Políticas têm tamanho máximo.
Listar milhares de recursos individualmente estoura esse limite e produz política que
ninguém consegue ler; nesse ponto, restringir por etiqueta ou por prefixo de nome é o
menor privilégio praticável.

**Conta separada por ambiente sem quem a opere.** Uma conta a mais exige rede, linha de
base de segurança, faturamento e acesso próprios. Uma equipe de duas pessoas num
protótipo sem dado real paga esse custo antes de ter o que isolar.

## Alternativas

Para reduzir risco sem reescrever a política:

- **Papéis assumidos temporariamente**: em vez de permissão permanente.
- **Aprovação para acesso elevado**: permissão concedida por tempo limitado,
  mediante justificativa.
- **Contas separadas por ambiente e por domínio.**
- **Análise automatizada de permissões**: ferramentas dos provedores que comparam
  o concedido com o usado.
- **Gerenciador de segredos**: quando a credencial de longa duração é inevitável,
  ao menos com rotação e auditoria.

## Trade-offs

| Menor privilégio | Permissão ampla |
|---|---|
| Dano contido | Alcance total |
| Configuração trabalhosa | Rápida |
| Erros de permissão em desenvolvimento | Nenhum |
| Permissão faltante que quebra caminho raro em produção | Nenhuma |
| Revisão periódica necessária | Nenhuma |

| Credencial temporária | Chave de longa duração |
|---|---|
| Nada a vazar permanentemente | Vaza e não expira |
| Rotação automática | Manual, ou nunca |
| Configuração inicial maior | Trivial |

| Contas separadas | Conta única |
|---|---|
| Isolamento por padrão | Isolamento depende de cada política |
| Rede, linha de base e faturamento por conta | Uma de cada |
| Acesso entre contas a projetar | Acesso implícito |

## Modos de Falha

**Chave vazada em repositório.** Um dos vetores mais explorados.

**Permissão acumulada.** Ampliada e nunca reduzida.

**Conta de ex-funcionário ativa.**

**Escalonamento de privilégio.** Uma permissão de política dá tudo.

**Auditoria apagada** pelo próprio comprometimento.

**Papel de instância excessivamente permissivo.** Comprometer a aplicação
compromete a conta.

**Confiança entre contas ampla demais.** Uma conta de terceiro com acesso maior que
o necessário.

## Erros Comuns

**Ampliar permissão até o erro sumir.** É como quase toda permissão excessiva nasce: sob pressão de incidente, ninguém volta para estreitar depois. O registro de acessos negados diz exatamente qual permissão faltava.

**Chave de acesso na aplicação.** Credencial estática vaza em repositório, em log e em imagem de contêiner. Identidade atribuída à carga de trabalho entrega credencial temporária e elimina a chave.

**Não federar identidade.** Usuários locais no provedor não somem quando a pessoa sai da empresa, porque a desativação acontece no diretório corporativo e não chega até lá.

**Não separar ambientes em contas.** Sem fronteira de conta, um erro de permissão em desenvolvimento alcança produção. A separação é o limite mais forte que o provedor oferece e não tem custo de licença;
o custo é operacional (rede, linha de base e acesso por conta) e é menor que o de
descobrir o problema em produção.

**Não revisar permissões não utilizadas.** Permissões só crescem por acúmulo. Os provedores relatam o que não é exercido há meses, e essa lista é a de remoção mais segura que existe.

**Deixar auditoria na mesma conta.** Quem compromete a conta apaga o registro do que fez. O log precisa estar em conta separada, com permissão de escrita e não de exclusão.

## Exemplo Real

Uma empresa de tecnologia sofreu um comprometimento que começou pequeno e escalou.

**O ponto de entrada:** uma chave de acesso de longa duração, presente num
repositório interno, exposta quando o repositório foi tornado público por engano
durante uma migração.

**O escalonamento:** a chave pertencia a uma identidade criada anos antes para um
script de relatório. Ela tinha permissão de administrador, concedida na criação
porque "era mais rápido", e nunca revista.

**O alcance:** com essa permissão, o atacante criou novas identidades, desativou
alertas, acessou os armazenamentos de dados e apagou registros de auditoria.

**A investigação ficou comprometida** porque os registros estavam na mesma conta e
foram apagados. A reconstrução dependeu de registros de rede parciais.

O que a auditoria posterior encontrou no ambiente:

**34 chaves de longa duração**, das quais 19 não eram usadas havia mais de seis
meses.

**11 identidades com permissão de administrador**, das quais 2 eram de aplicações.

**6 contas de ex-funcionários** ativas.

**Produção e desenvolvimento na mesma conta.**

A reconstrução do modelo de acesso levou cinco meses:

**32 das 34 chaves de longa duração eliminadas.** Aplicações passaram a usar papéis;
a esteira passou a usar federação. Restaram duas chaves, para integrações externas
que não suportavam outra coisa, ambas com rotação automática e alcance mínimo.

**Federação de identidade** para pessoas. O desprovisionamento passou a ser
automático.

**Contas separadas** por ambiente, com produção isolada.

**Auditoria em conta dedicada**, com exclusão negada para todos.

**Revisão trimestral** com base em uso real. A primeira reduziu as permissões
concedidas em cerca de 80% sem quebrar nada.

A conclusão registrada: o tamanho do dano foi definido por uma única identidade (um
script de relatório, que precisava ler, com permissão de administrador concedida por
conveniência). E a primeira revisão mostrou que o padrão sobrevive até a um modelo
reconstruído com cuidado: quatro quintos do que ele concedia ainda não era exercido.

## Conceitos Relacionados

- [Rede em Nuvem](/09-cloud-architecture/cloud-networking.md): a outra camada de fronteira.
- [Recuperação de Desastre](/09-cloud-architecture/disaster-recovery.md): cópias isoladas.
- [Segurança](/10-security/index.md): o tratamento completo.
- [Serviços Gerenciados](/09-cloud-architecture/managed-services.md).

## Exercício Prático

Liste as chaves de acesso de longa duração do seu ambiente e, para cada uma,
descubra quando foi usada pela última vez.

Depois pegue a identidade da sua aplicação principal e compare o que ela pode fazer
com o que ela de fato fez nos últimos 90 dias.

## Perguntas de Entrevista

- Por que credenciais de longa duração são o problema central?
- Por que separação por conta é mais robusta que política?
- Que permissões constituem escalonamento de privilégio?

## Para Aprofundar

- Rose, S. et al. *Zero Trust Architecture*. NIST SP 800-207, 2020.
- Grassi, P. et al. *Digital Identity Guidelines*. NIST SP 800-63-3, 2017.
- Jones, M. et al. *OAuth 2.0 Token Exchange*. RFC 8693, 2020. A base da troca de
  token que permite federar esteiras sem chave estática.
