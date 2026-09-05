---
id: complexity
title: Complexidade
sidebar_position: 17
description: A essencial vem do problema; a acidental, das nossas escolhas — e só uma delas é removível.
doc_type: concept
level: 1
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor distingue complexidade essencial de acidental e avalia se
  uma decisão a está reduzindo ou apenas deslocando.
prerequisites: [abstraction]
related: [technical-debt, modularity]
canonical_for: [complexidade, complexidade essencial, complexidade acidental]
content_version: 2
last_reviewed: 2026-08-26
---

# Complexidade

## Visão Geral

Complexidade é o que torna um sistema difícil de entender e de mudar.

A distinção que organiza o assunto, formulada por Fred Brooks em 1986:
**complexidade essencial** vem do problema e não pode ser eliminada;
**complexidade acidental** vem de como escolhemos resolvê-lo, e pode.

Boa parte do trabalho arquitetural é reduzir a segunda sem fingir que a primeira
não existe.

## Problema

Complexidade não é percebida enquanto se acumula. Cada decisão que a adiciona é
localmente defensável: mais uma configuração, mais uma camada, mais um caso
especial, mais um serviço.

O efeito é composto, não somado. Duas configurações independentes produzem quatro
combinações possíveis; dez produzem mil. Ninguém decide criar mil caminhos — eles
aparecem.

O sintoma tardio é característico: mudanças simples levam semanas, ninguém
consegue prever o efeito de uma alteração, e novas pessoas levam meses para
produzir. Nesse ponto a complexidade já é estrutural e reduzi-la é um projeto.

## Conceitos Centrais

### Essencial e acidental

**Essencial** é a complexidade do problema. Um sistema de folha de pagamento é
complexo porque legislação trabalhista é complexa. Nenhuma escolha técnica
remove isso; o máximo que se faz é não adicionar mais.

**Acidental** é a que introduzimos: framework desnecessário, abstração que não se
paga, configuração para variação que não existe, serviço separado sem razão,
generalização especulativa.

O teste prático: *se eu resolvesse este problema do zero, com pleno
conhecimento, esta parte existiria?* Se não, é acidental.

### Complexidade se desloca

O erro mais comum de raciocínio sobre complexidade é achar que ela foi removida
quando apenas mudou de lugar.

Extrair um serviço reduz a complexidade do código de cada lado e adiciona
complexidade de rede, implantação, observabilidade e falha parcial. Introduzir
uma fila remove acoplamento temporal e adiciona ordenação, duplicação e
mensagens mortas.

Nenhuma dessas trocas é errada. O erro é contabilizar só um lado — o que produz
o padrão de decisões que parecem simplificar e complicam.

### Onde a complexidade dói

Complexidade num lugar isolado é tolerável. Complexidade espalhada é o que mata.

Ousterhout formula isso bem: o pior sintoma é a **carga cognitiva distribuída** —
quando entender uma parte exige conhecer muitas outras. Um módulo denso e
autocontido é preferível a dez módulos simples cuja interação é imprevisível.

Isso significa que reduzir complexidade nem sempre é dividir. Às vezes é
concentrar.

### Complexidade acidental tem meia-vida

Uma decisão que adiciona complexidade acidental raramente é revertida. Ela vira
parte do sistema, ganha código que depende dela, e o custo de removê-la cresce.

Por isso o momento de resistir é a introdução, não depois.

## Modelo Mental

**Toda decisão arquitetural adiciona ou remove complexidade. Contabilize os dois
lados.**

Para qualquer proposta: o que ela remove, o que ela adiciona, e o saldo é
positivo dado o contexto? Quem propõe costuma enunciar só o primeiro termo.

## Quando Usar

Adicionar complexidade se justifica quando:

- Ela reduz complexidade essencial exposta — uma abstração que de fato esconde.
- É exigida por um requisito de qualidade real e declarado — replicação para
  disponibilidade contratada.
- Substitui complexidade maior — um framework maduro no lugar de código próprio
  equivalente.
- O custo de não adicionar é maior e já é observável, não hipotético.

## Quando Não Usar

**Quando o benefício é hipotético.** "Vamos precisar disso quando escalarmos" é a
formulação padrão da complexidade acidental. Se não há data nem número, não há
requisito.

**Quando ela apenas se desloca.** Se a proposta remove complexidade de um lugar e
adiciona equivalente em outro, o saldo é o custo da transição.

**Quando o time não consegue operar o resultado.** Uma arquitetura correta que
exige competência que a equipe não tem é complexidade acidental por definição —
ela existe por escolha, não pelo problema.

**Quando a alternativa simples ainda não falhou.** A ordem correta é usar a
opção simples até que ela demonstre insuficiência. Antecipar a falha da opção
simples é adivinhação com custo.

## Alternativas

- **Não fazer** — sempre uma opção, com custo e benefício mensuráveis.
- **Fazer manualmente** — automatizar um processo raro pode custar mais que
  executá-lo à mão.
- **Adiar** — manter a opção aberta sem pagar por ela agora.
- **Remover algo** — reduzir escopo em vez de adicionar mecanismo. É a
  alternativa menos considerada e frequentemente a melhor.

## Trade-offs

O eixo é **capacidade versus custo cognitivo e operacional**.

| Mais mecanismo | Menos mecanismo |
|---|---|
| Cobre mais casos | Cobre o caso comum |
| Absorve mudanças previstas | Mudança exige alterar código |
| Mais partes a entender e operar | Sistema cabe na cabeça |
| Mais modos de falha | Menos coisas que quebram |
| Custo pago agora | Custo pago se necessário |

## Modos de Falha

**Explosão combinatória de configuração.** Cada flag dobra o espaço de estados.
Com dez flags, ninguém testa todas as combinações e algumas nunca foram
executadas.

**Complexidade distribuída.** Nenhuma parte é complexa; o conjunto é
incompreensível porque as interações não estão em lugar nenhum.

**Abstração que não esconde.** Adiciona nível sem reduzir o que é preciso saber.
Ver [abstração](/01-fundamentals/abstraction.md).

**Complexidade operacional invisível.** A arquitetura é elegante no diagrama e
exige três pessoas para operar. O custo não aparece no código.

**Framework maior que o problema.** A ferramenta traz complexidade própria maior
que a do problema que resolve.

## Erros Comuns

**Confundir simples com fácil.** Fácil é familiar; simples é ter poucas partes
entrelaçadas. Uma ferramenta familiar pode ser complexa; uma desconhecida pode
ser simples.

**Justificar complexidade com escala futura.** Sem número e prazo, é adivinhação.
E adivinha-se mal: a escala que chega raramente tem a forma prevista.

**Contabilizar só o que a decisão remove.** Ver acima. É o viés mais comum em
propostas arquiteturais.

**Ignorar complexidade operacional.** Ela não aparece no código nem no diagrama, e
frequentemente é o maior componente do custo total.

**Achar que mais partes pequenas é sempre mais simples.** Dez serviços simples com
interações imprevisíveis são mais complexos que um módulo denso.

## Exemplo Real

Um time propôs extrair o processamento de relatórios para um serviço separado,
com o argumento de isolar carga.

Contabilizando os dois lados:

*Remove* — a carga de relatórios sai do processo principal, e a implantação de
relatórios deixa de exigir implantação do resto.

*Adiciona* — mais um pipeline, mais um conjunto de alertas, autenticação entre
serviços, tratamento de indisponibilidade do serviço de relatórios, uma cópia ou
um acesso remoto aos dados, e mais uma coisa em plantão.

O saldo dependia de uma pergunta que ninguém tinha feito: quanto da carga era
relatório?

A medição respondeu 4%, concentrados em duas consultas sem índice.

Corrigidos os índices, a carga caiu para 0,3% e a proposta perdeu a razão de ser.
O custo do serviço separado — permanente, operacional, distribuído por todo o
time — teria sido pago para resolver um problema que uma migração resolveu.

O que vale reter não é que extrair serviço é ruim. É que a decisão foi tomada com
um lado da conta, e medir custou uma tarde.

## Conceitos Relacionados

- [Abstração](/01-fundamentals/abstraction.md) — a ferramenta que reduz ou adiciona complexidade.
- [Dívida Técnica](/01-fundamentals/technical-debt.md) — complexidade acidental acumulada.
- [Trade-offs](/20-trade-offs/index.md) — a contabilidade dos dois lados.

## Exercício Prático

Liste cinco mecanismos do seu sistema — uma fila, um cache, uma camada de
abstração, uma flag, um serviço separado.

Para cada um: que problema ele resolve? Esse problema é observável hoje ou foi
antecipado? Se removêssemos, o que quebraria concretamente?

Os que você não consegue responder com um problema observável são candidatos a
complexidade acidental.

## Perguntas de Entrevista

- Qual a diferença entre complexidade essencial e acidental?
- Como avalia se uma decisão reduz complexidade ou apenas a desloca?
- Dê um exemplo de decisão que parecia simplificar e complicou.

## Para Aprofundar

- Brooks, Frederick P. *No Silver Bullet: Essence and Accidents of Software Engineering*.
  IFIP, 1986 — a distinção essencial/acidental.
- Ousterhout, John. *A Philosophy of Software Design*. Yaknyam Press, 2018.
- Moseley, Ben; Marks, Peter. *Out of the Tar Pit*, 2006 — complexidade
  originada de estado.
