---
id: availability
title: Disponibilidade
sidebar_position: 10
description: A fração do tempo em que o sistema responde corretamente — e o que o número esconde.
doc_type: concept
level: 4
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor expressa disponibilidade com janela e critério declarados,
  e entende como ela se compõe entre componentes.
prerequisites: [partial-failure]
related: [cap, consistency, reliability-basics]
canonical_for: [disponibilidade, noves de disponibilidade]
content_version: 1
last_reviewed: 2026-08-27
---

# Disponibilidade

## Visão Geral

Disponibilidade é a fração do tempo em que o sistema responde corretamente.

O número — "quatro noves" — é citado com frequência e significa pouco sem três
complementos: **em que janela**, **medido de onde**, e **o que conta como
resposta correta**.

## Problema

"Nosso sistema tem 99,9% de disponibilidade" pode significar coisas muito
diferentes.

**A janela muda tudo.** 99,9% por mês permite 43 minutos de indisponibilidade;
por ano, 8,8 horas. O mesmo número, uma ordem de grandeza de diferença.

**O ponto de medição muda tudo.** Medido no servidor, a rede não conta. Medido no
cliente, conta — e é o que o usuário experimenta.

**O critério muda tudo.** Responder `500` rapidamente conta como disponível? E
responder correto em 30 segundos? Um sistema que responde a tudo com erro tem 100%
de "resposta" e 0% de utilidade.

Sem os três, o número é decorativo.

## Conceitos Centrais

### A tabela que decide a conversa

| Disponibilidade | Por mês | Por ano |
|---|---|---|
| 99% | 7,2 h | 3,65 dias |
| 99,9% | 43 min | 8,8 h |
| 99,95% | 22 min | 4,4 h |
| 99,99% | 4,3 min | 53 min |
| 99,999% | 26 s | 5,3 min |

Cada nove adicional custa desproporcionalmente mais. A diferença entre 99,9% e
99,99% não é 10% de esforço — é frequentemente redundância multi-zona, ausência de
janela de manutenção, implantação sem interrupção e resposta operacional em
minutos.

Apresentar essa tabela antes de perguntar "quantos noves você precisa?" muda a
resposta. Sem ela, a resposta é sempre o número maior.

### Disponibilidade compõe de forma multiplicativa

Componentes em série multiplicam:

```text
5 serviços em cadeia, cada um 99,9%
  → 0,999⁵ = 99,5%
  → de 43 min para 3,6 h por mês
```

Isso é o argumento quantitativo contra cadeias longas de chamadas síncronas. Ver
[serviços](/05-system-design/services.md).

Componentes redundantes em paralelo somam noves:

```text
2 instâncias independentes de 99% cada
  → 1 - (0,01)² = 99,99%
```

A palavra que carrega essa segunda conta é **independentes**. Duas instâncias na
mesma zona, no mesmo banco, com a mesma dependência, falham juntas — e a
multiplicação não vale.

### Correlação é o que quebra a redundância

Redundância só entrega o ganho se as falhas forem independentes.

Falhas correlacionadas comuns: mesma zona de disponibilidade, mesmo banco, mesma
versão de código com o mesmo defeito, mesma configuração errada, mesma dependência
externa, mesmo certificado expirando.

Três instâncias com um defeito de código idêntico têm a disponibilidade de uma.

### Disponibilidade não é confiabilidade

Um sistema pode estar disponível e devolver resultados errados. Ver
[confiabilidade](/12-reliability/index.md).

Um sistema que responde `200` com dado desatualizado está disponível pela métrica
e falhando pelo propósito.

### Disponibilidade parcial é o caso comum

Sistemas raramente estão inteiramente fora. O usual é uma funcionalidade
degradada, uma região afetada, uma fração dos usuários.

Medir disponibilidade como binário esconde isso. A métrica melhor é a **taxa de
requisições bem-sucedidas** — que captura degradação parcial e é o que
[SLI](/12-reliability/index.md) formaliza.

### Meça do lado do cliente

A disponibilidade que o servidor reporta e a que o usuário experimenta são números
diferentes, e a diferença costuma ser grande.

Métrica de servidor não enxerga falha de DNS, de rede intermediária, de borda, de
balanceador, nem requisição que nunca chegou. Um sistema pode registrar 99,99% de
respostas bem-sucedidas enquanto uma fração dos usuários não consegue nem abrir a
conexão.

O número que importa para o negócio é o do cliente. Obtê-lo exige instrumentação
no navegador ou no aplicativo, ou sondagem externa a partir das regiões onde os
usuários estão.

Quando os dois números divergem de forma persistente, a diferença é o mapa do que
está quebrado fora do seu perímetro — e é justamente a parte que ninguém está
observando.

## Modelo Mental

**Disponibilidade é uma promessa com prazo e critério.** Sem os dois, é um número
que não obriga a nada.

## Quando Usar

- Ao negociar requisito com o negócio, com a tabela na mão.
- Ao dimensionar redundância.
- Ao avaliar o custo de uma cadeia de chamadas síncronas.
- Ao estabelecer [SLO](/12-reliability/index.md).

## Quando Não Usar

**Como número isolado.** Sem janela e critério, não significa nada.

**Perseguir noves sem custo na mesa.** A conversa precisa incluir o que cada nove
exige.

**Presumir independência entre réplicas.** Verifique a correlação.

**Como métrica binária.** Degradação parcial é o caso comum.

**Prometer disponibilidade maior que a das dependências.** Um sistema não pode ser
mais disponível que o produto das suas dependências síncronas.

## Alternativas

Para melhorar disponibilidade percebida sem adicionar noves de infraestrutura:

- **Degradação graciosa** — responder parcialmente em vez de falhar.
- **Assíncrono** — aceitar e processar depois, em vez de depender da
  disponibilidade do destino.
- **Cache** — servir dado velho quando a origem está fora.
- **Reduzir dependências síncronas** — a que mais rende, e a menos considerada.

## Trade-offs

| Mais noves | Menos |
|---|---|
| Menos indisponibilidade | Mais |
| Custo cresce de forma não linear | Baixo |
| Redundância e complexidade operacional | Simplicidade |
| Frequentemente exige sacrificar consistência | Consistência preservada |

A última linha remete a [CAP](/06-distributed-systems/cap.md): sob partição, disponibilidade e
consistência não coexistem.

## Modos de Falha

**Redundância correlacionada.** Réplicas que falham juntas.

**Cadeia longa.** Disponibilidade multiplicada para baixo.

**Disponibilidade medida no lugar errado.** O painel mostra 99,99% e os usuários
não conseguem acessar.

**Degradação invisível.** Métrica binária não captura.

**Dependência externa não contabilizada.** O sistema promete mais que o provedor
que ele usa.

## Erros Comuns

**Citar noves sem janela.**

**Não apresentar o custo antes de perguntar o requisito.**

**Presumir independência.**

**Medir só no servidor.**

**Não contar as dependências.** A disponibilidade prometida precisa caber no
produto das dependências síncronas.

## Exemplo Real

Uma empresa prometia 99,95% em contrato — 22 minutos por mês.

A arquitetura tinha redundância: três instâncias da aplicação, duas do banco, tudo
com verificação de saúde e failover.

Em oito meses, três incidentes consumiram 4 horas — muito acima do prometido, com
consequência contratual.

A análise dos três mostrou o mesmo padrão: **nenhum foi falha de instância**.

O primeiro foi um certificado TLS expirado, presente nas três instâncias.

O segundo foi uma configuração errada implantada nas três simultaneamente.

O terceiro foi a indisponibilidade de um provedor de autenticação externo, chamado
sincronamente em toda requisição — e cuja disponibilidade contratual era 99,9%,
menor que a que a empresa prometia aos próprios clientes.

A redundância protegia contra o modo de falha que não estava acontecendo.

As correções atacaram a correlação, não a quantidade de instâncias.

Certificados passaram a ter alerta com 30 dias de antecedência e renovação
automatizada.

Implantação passou a ser gradual — uma instância por vez, com verificação entre
elas — em vez de simultânea.

E a chamada ao provedor de autenticação ganhou cache de token validado e
degradação: com o provedor fora, sessões já estabelecidas continuam funcionando, e
apenas novos logins falham.

Essa última mudança sozinha alterou o cálculo: o sistema deixou de depender
sincronamente de um provedor menos disponível que ele.

## Conceitos Relacionados

- [CAP](/06-distributed-systems/cap.md) — a escolha sob partição.
- [Consistência](/06-distributed-systems/consistency.md) — o que se troca.
- [Confiabilidade](/12-reliability/index.md) — SLI, SLO e degradação.
- [Replicação](/06-distributed-systems/replication.md) — o mecanismo de redundância.

## Exercício Prático

Calcule a disponibilidade teórica do seu sistema: multiplique a disponibilidade de
todas as dependências que estão no caminho síncrono de uma requisição.

Compare com o que você promete. Se o prometido for maior, a promessa não tem
lastro.

## Perguntas de Entrevista

- O que falta a "99,9% de disponibilidade" para significar algo?
- Por que redundância nem sempre multiplica a disponibilidade?
- Por que uma cadeia de cinco serviços é menos disponível que cada um deles?

## Para Aprofundar

- Beyer, Betsy et al. *Site Reliability Engineering*. O'Reilly, 2016.
- Treynor, Ben et al. *The Calculus of Service Availability*. ACM Queue, 2017.
