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
content_version: 4
last_reviewed: 2026-08-28
---

# Proteção de Dados

## Visão Geral

A conversa sobre proteger dados costuma começar em criptografia e controle de acesso.
Ela deveria começar antes:

**Este dado precisa existir?**

Dado que não é coletado não vaza, não precisa ser cifrado, não entra em cópia de
segurança, não aparece em registro, não precisa ser apagado quando alguém pede.
Para dado que nenhum processo usa, é o controle com a melhor relação entre risco
eliminado e esforço.

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
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

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

O custo é operacional. O cofre entra no caminho de todo fluxo que precisa do valor
original — emissão de nota, envio a órgão regulador, conferência com o titular: se ele
cai, esses fluxos caem junto, e cada detokenização soma uma chamada de rede à
latência. O risco que estava espalhado se concentra num alvo só, que passa a exigir o
controle de acesso e a auditoria mais rígidos do sistema. E o acervo já persistido
precisa ser migrado — varrer bancos, réplicas e extrações, trocar valor por token sem
quebrar relacionamentos —, um projeto em si.

### Dados de produção em outros ambientes

Ambientes de teste, desenvolvimento e análise que recebem cópia de produção multiplicam
os lugares onde há dado pessoal, e raramente carregam os controles de produção: acesso
mais amplo, cifragem ausente, retenção sem dono. Para a proteção de dados, a pergunta
é qual dado real cada ambiente precisa ter — e a resposta usual é nenhum.

As formas de chegar lá — dados sintéticos, subconjunto mascarado que preserva os
relacionamentos, conjunto pequeno feito à mão — estão em
[gestão de ambientes](/14-devops-and-platform/environment-management.md#dados-de-teste-não-cópia-integral-de-produção).
Ver [segredos](/10-security/secrets.md) — a mesma lógica vale para credenciais.

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

**Cofre de tokenização para dado pouco sensível ou de pouco volume.** O cofre é uma
dependência de disponibilidade e um alvo a proteger. Para um identificador interno sem
valor fora do sistema, ou para poucas centenas de registros em que a minimização
resolve, operar o cofre custa mais que o escopo que ele reduz — cifrar o campo ou não
guardá-lo sai mais barato.

**Classificação formal num sistema de sensibilidade única.** Se todo dado do sistema
está num só nível — um serviço interno sem dado pessoal, ou um que só guarda dado de
saúde —, quatro níveis com controles por nível é burocracia sem decisão a tomar. Um
controle uniforme adequado àquele nível basta; a classificação passa a valer quando
surge o segundo nível.

**Anonimizar quando a análise precisa do indivíduo.** Anonimização que resiste a
cruzamento generaliza e suprime até destruir a granularidade — acompanhar a jornada de
um cliente, detectar fraude por padrão individual. Quando é esse o uso que justifica
guardar o dado, pseudonimize com acesso restrito ao mapeamento, e assuma que o dado
continua pessoal.

**Dados sintéticos quando o teste depende das anomalias do real.** Migração de dados
legados, depuração de defeito que só ocorre com o acervo real: o gerador não reproduz as
distorções que o teste existe para pegar. Aí o caminho é o subconjunto mascarado em
ambiente com controles de produção, não a cópia crua.

## Alternativas

- **Não coletar** — o controle definitivo.
- **Tokenização** — reduz drasticamente o escopo; o cofre continua dentro dele.
- **Agregação** — guardar o resumo, descartar o detalhe.
- **Processar sem armazenar** — usar o dado na requisição e não persistir.
- **[Cifragem por titular](/10-security/encryption.md)** — permite apagamento por descarte de
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
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

## Erros Comuns

**Começar por criptografia em vez de minimização.** O dado que não foi coletado não vaza, não precisa de chave e não entra em pedido de exclusão. Cifrar é a segunda melhor resposta; não ter é a primeira. E muitas vezes o controle que faltava era autorização — ver [criptografia](/10-security/encryption.md).

**Não classificar.** Sem saber quais campos são pessoais ou sensíveis, aplica-se o mesmo controle a tudo — caro demais para o que não precisa e frouxo demais para o que precisa.

**Copiar produção.** A base de homologação com dados reais multiplica os lugares onde há dado pessoal, com controles que, na prática, raramente igualam os de produção.

**Classificar sem definir controles por nível.** O rótulo sem consequência não muda onde o dado pode estar nem quem o acessa — é inventário, não proteção.

**Registrar corpo de requisição.** É a via mais comum de vazamento interno: dado pessoal e credencial acabam no sistema de logs, que tem retenção longa e acesso mais amplo.

**Confundir pseudonimização com anonimização.** Trocar o nome por um identificador não anonimiza — com data de nascimento e CEP, poucos atributos bastam para reidentificar. Só o dado verdadeiramente anônimo sai do escopo regulatório.

**Não inventariar os destinos do dado.** Sem saber para onde o dado pessoal flui — análise, suporte, terceiros — não há como atender pedido de exclusão nem responder a incidente.

## Exemplo Real

Uma fintech recebeu uma solicitação de exclusão de dados e descobriu que não sabia
onde eles estavam.

O inventário, feito às pressas, encontrou dados pessoais de clientes em dez lugares —
dos quais sete ninguém tinha listado:

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

Os três últimos estavam fora do controle direto.

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
sistema trabalha com token. Isso removeu o campo do banco de produção, das réplicas e
do warehouse.

**Classificação** em quatro níveis, com controles definidos por nível — inclusive
"não pode aparecer em registro" e "não pode sair para ambiente não produtivo".

**Dados sintéticos** em homologação. A cópia de produção foi eliminada.

**Filtro de registros e de métricas** na origem, com verificação automatizada.

**Contratos revistos** com os terceiros, restringindo o que é enviado.

O que a equipe aprendeu: a solicitação de exclusão que iniciou tudo passou a ser
atendível em dois dias. E a maior parte do ganho veio da primeira etapa — os onze
campos que nenhum processo usava deixaram de existir, e com eles todo o controle que
teriam exigido em cada um dos dez lugares.

## Conceitos Relacionados

- [Criptografia](/10-security/encryption.md) — o controle para o que resta.
- [Auditabilidade](/10-security/auditability.md).
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md) — retenção e
  apagamento.
- [Modelagem de Ameaças](/10-security/threat-modeling.md) — onde "eliminar" aparece como resposta.

## Exercício Prático

Escolha um campo de dado pessoal do seu sistema e liste **todos** os lugares onde ele
aparece — incluindo registros, métricas, ambientes de teste, exportações e terceiros.

Depois pergunte, para cada um: ele precisa estar aqui?

## Perguntas de Entrevista

- Para dado que nenhum processo usa, por que minimizar rende mais que proteger?
- Qual a diferença entre pseudonimizar e anonimizar?
- Por que copiar produção para teste é uma das exposições mais comuns?

## Para Aprofundar

- Lei Geral de Proteção de Dados (Lei 13.709/2018) — princípios de necessidade e
  finalidade.
- Sweeney, Latanya. *Simple Demographics Often Identify People Uniquely*, 2000.
- ENISA. *Data Pseudonymisation: Advanced Techniques and Use Cases*, 2021.
