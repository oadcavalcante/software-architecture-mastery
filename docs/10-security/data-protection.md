---
id: data-protection
title: Proteção de Dados
sidebar_position: 14
description: O controle mais eficaz é não ter o dado — e o que fazer com o que precisa existir.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor reduz a superfície de dados antes de protegê-la, e classifica
  o que resta para aplicar controle proporcional.
prerequisites: [security]
related: [encryption, auditability, data-lifecycle]
canonical_for: [minimização de dados, classificação de dados, pseudonimização, tokenização]
content_version: 1
last_reviewed: 2026-08-28
---

# Proteção de Dados

## Visão Geral

A conversa sobre proteger dados costuma começar em criptografia e controle de acesso.
Ela deveria começar antes:

**Este dado precisa existir?**

Dado que não é coletado não vaza, não precisa ser cifrado, não entra em cópia de
segurança, não aparece em registro, não precisa ser apagado quando alguém pede.
Nenhum outro controle tem esse retorno.

O que resta depois dessa pergunta é o que merece proteção — proporcional ao que ele
é.

## Problema

O reflexo padrão é coletar e guardar tudo: pode ser útil depois, armazenamento é
barato, e remover parece perda.

O custo aparece disperso e não é atribuído à decisão de coletar:

Cada campo sensível multiplica o esforço de conformidade. Cada cópia é uma superfície
a proteger. Cada dado pessoal guardado além do necessário é exposição regulatória. E,
num vazamento, a extensão do dano é exatamente o que estava lá.

## Conceitos Centrais

### Minimização é o controle de melhor retorno

Quatro perguntas, na ordem:

**Precisamos coletar?** Muitos campos são coletados "porque o formulário tinha".

**Precisamos guardar depois de usar?** Um documento verificado no cadastro pode não
precisar ser retido.

**Precisamos do valor completo?** Frequentemente basta os últimos dígitos, a faixa
etária, o município — em vez do valor exato.

**Precisamos por quanto tempo?** Ver
[ciclo de vida do dado](../07-data-architecture/data-lifecycle.md).

Cada "não" remove um problema inteiro em vez de mitigá-lo.

### Classificação torna a proteção proporcional

Proteger tudo igualmente é caro e produz o pior resultado: excesso onde não importa,
insuficiência onde importa.

Uma classificação simples resolve — três ou quatro níveis bastam:

```text
público      pode ser divulgado
interno      não deveria vazar, dano limitado
sensível     dado pessoal, financeiro, contratual
crítico      saúde, biometria, credenciais, dado regulado
```

E, para cada nível, controles definidos: onde pode estar, quem pode acessar, se
precisa ser cifrado no campo, se aparece em ambiente de teste, se é registrado.

Sem classificação, a decisão é tomada campo a campo, por quem estiver implementando.

### Pseudonimização e anonimização não são a mesma coisa

**Pseudonimizar** substitui identificadores diretos por referências, mantendo a
possibilidade de reverter com informação adicional. O dado continua sendo pessoal, do
ponto de vista regulatório — o risco é reduzido, não eliminado.

**Anonimizar** remove a possibilidade de reidentificação. O dado deixa de ser pessoal.

A anonimização real é mais difícil do que parece:

**Combinação reidentifica.** CEP, data de nascimento e sexo identificam
individualmente uma fração alta da população.

**Cruzamento de conjuntos.** Dois conjuntos anonimizados separadamente podem
reidentificar quando combinados.

**Dados raros identificam.** Um valor incomum aponta para uma pessoa.

"Removemos o nome" não é anonimização. Chamar de anonimizado o que é pseudonimizado
produz decisões erradas sobre o que pode ser compartilhado.

### Tokenização tira o dado do sistema

Substituir o valor sensível por uma referência sem significado, guardando o original
num cofre separado com acesso restrito.

O ganho: a maior parte do sistema deixa de ter o dado. Os sistemas que só precisam
referenciar — para relacionar, para exibir os últimos dígitos — trabalham com o
token, e o escopo de conformidade encolhe drasticamente.

É a técnica padrão para dados de cartão, e subutilizada para documentos e outros
identificadores.

### Dados de produção em outros ambientes

Uma das exposições mais comuns e mais evitáveis.

Ambientes de teste, desenvolvimento e análise costumam receber cópia de produção — com
controles mais fracos, acesso mais amplo, e frequentemente sem cifragem.

As alternativas:

**Dados sintéticos.** Gerados, com as propriedades estatísticas necessárias.

**Subconjunto mascarado.** Cópia com os campos sensíveis substituídos de forma
consistente — o mascaramento precisa preservar relacionamentos, ou os testes quebram.

**Nenhum dado.** Para muitos casos, um conjunto pequeno criado à mão basta.

Ver [segredos](secrets.md) — a mesma lógica vale para credenciais.

### Vazamento por caminhos laterais

O dado protegido no banco frequentemente aparece em lugares que ninguém classificou:

```text
registros de aplicação   corpo de requisição, mensagens de erro
mensagens de erro         devolvidas ao usuário
exportações              relatórios, planilhas, extrações ad hoc
cópias de segurança      com controles mais fracos
métricas                 rótulos com identificadores
sistemas de terceiros    monitoramento, análise, suporte
notificações             e-mail, mensagem de texto, notificação móvel
```

A última é frequentemente esquecida: uma notificação com conteúdo clínico ou
financeiro aparece na tela de bloqueio do telefone.

Cada um desses precisa ser tratado como destino do dado, e a classificação precisa
alcançá-los.

## Modelo Mental

**O dado mais seguro é o que não existe.** Proteja o que resta, proporcionalmente ao
que ele é.

## Quando Usar

- Sistemas que tratam dado pessoal.
- Requisito regulatório de proteção ou de apagamento.
- Dados compartilhados com terceiros.
- Ambientes não produtivos que recebem cópias.
- Análise sobre dados de clientes.

## Quando Não Usar

**Proteger sem classificar.** Uniformemente é errado nos dois sentidos.

**Chamar de anônimo o que é pseudonimizado.**

**Copiar produção para teste.**

**Cifrar como resposta a tudo.** Ver [criptografia](encryption.md) — muitas vezes o
controle que faltava era autorização, ou não coletar.

**Coletar por precaução.**

**Classificar sem definir controles por nível.** Rótulo sem consequência.

## Alternativas

- **Não coletar** — o controle definitivo.
- **Tokenização** — remove o dado do escopo.
- **Agregação** — guardar o resumo, descartar o detalhe.
- **Processar sem armazenar** — usar o dado na requisição e não persistir.
- **[Cifragem por titular](encryption.md)** — permite apagamento por descarte de
  chave.

## Trade-offs

| Minimizar | Guardar tudo |
|---|---|
| Superfície pequena | Grande |
| Análise futura limitada | Possível |
| Conformidade simples | Complexa |
| Decisão irreversível | Flexível |

| Dados sintéticos em teste | Cópia de produção |
|---|---|
| Sem exposição | Alta |
| Esforço de geração | Nenhum |
| Pode não refletir casos reais | Fiel |

## Modos de Falha

**Dado sensível em registro de aplicação.**

**Cópia de produção em ambiente de teste.**

**Anonimização reversível por cruzamento.**

**Exportação sem controle.** Planilha com dados de clientes num computador pessoal.

**Terceiro recebendo mais que o necessário.**

**Notificação expondo conteúdo.**

**Apagamento incompleto.** O dado permanece em cópias e derivados. Ver
[ciclo de vida do dado](../07-data-architecture/data-lifecycle.md).

## Erros Comuns

**Começar por criptografia em vez de minimização.**

**Não classificar.**

**Copiar produção.**

**Registrar corpo de requisição.**

**Confundir pseudonimização com anonimização.**

**Não inventariar os destinos do dado.**

## Exemplo Real

Uma fintech recebeu uma solicitação de exclusão de dados e descobriu que não sabia
onde eles estavam.

O inventário, feito às pressas, encontrou dados pessoais de clientes em quinze
lugares — dos quais seis ninguém tinha listado:

```text
banco de produção            esperado
réplicas e cópias            esperado
warehouse analítico          esperado
registros de aplicação       corpo de requisição, 1 ano de retenção
métricas                     CPF como rótulo de série temporal
ambiente de homologação      cópia de produção de 4 meses antes
notebooks de análise         extrações feitas por analistas
sistema de suporte           colado em tickets
plataforma de e-mail         nome e valores em templates
monitoramento de terceiro    rastros com dados de requisição
```

Os quatro últimos estavam fora do controle direto.

E dois achados agravantes:

**CPF como rótulo de métrica.** Gerava uma série temporal por cliente, o que além de
expor dados tinha estourado o custo da plataforma de monitoramento.

**Homologação acessível a fornecedores.** Um ambiente com dados reais de clientes,
com credenciais compartilhadas com dois fornecedores.

A reformulação começou por minimização, não por proteção:

**Revisão de coleta.** Onze campos deixaram de ser coletados — incluindo dados de
familiares que nenhum processo usava. Três campos passaram a ser guardados de forma
reduzida: faixa de renda em vez de valor, município em vez de endereço completo,
últimos dígitos em vez do documento completo onde só a conferência importava.

**Tokenização** do documento. Passou a existir um cofre separado; o restante do
sistema trabalha com token. Isso removeu o campo de doze bancos e do warehouse.

**Classificação** em quatro níveis, com controles definidos por nível — inclusive
"não pode aparecer em registro" e "não pode sair para ambiente não produtivo".

**Dados sintéticos** em homologação. A cópia de produção foi eliminada.

**Filtro de registros e de métricas** na origem, com verificação automatizada.

**Contratos revistos** com os terceiros, restringindo o que é enviado.

O que a equipe registra: a solicitação de exclusão que iniciou tudo passou a ser
atendível em dois dias. E a maior parte do ganho veio da primeira etapa — os onze
campos que deixaram de ser coletados eliminaram mais risco que qualquer controle
técnico teria eliminado.

## Conceitos Relacionados

- [Criptografia](encryption.md) — o controle para o que resta.
- [Auditabilidade](auditability.md).
- [Ciclo de Vida do Dado](../07-data-architecture/data-lifecycle.md) — retenção e
  apagamento.
- [Modelagem de Ameaças](threat-modeling.md) — onde "eliminar" aparece como resposta.

## Exercício Prático

Escolha um campo de dado pessoal do seu sistema e liste **todos** os lugares onde ele
aparece — incluindo registros, métricas, ambientes de teste, exportações e terceiros.

Depois pergunte, para cada um: ele precisa estar aqui?

## Perguntas de Entrevista

- Por que minimização tem retorno maior que qualquer controle técnico?
- Qual a diferença entre pseudonimizar e anonimizar?
- Por que copiar produção para teste é uma das exposições mais comuns?

## Para Aprofundar

- Lei Geral de Proteção de Dados (Lei 13.709/2018) — princípios de necessidade e
  finalidade.
- Sweeney, Latanya. *Simple Demographics Often Identify People Uniquely*, 2000.
- ENISA. *Data Pseudonymisation: Advanced Techniques and Use Cases*, 2021.
