---
id: integration-anti-corruption
title: Anti-Corruption Layer na Integração
sidebar_position: 12
description: Traduzir na fronteira para que o modelo alheio não entre no seu — e quando a tradução não vale a pena.
doc_type: pattern
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor decide onde colocar tradução de fronteira a partir do risco
  de o modelo externo contaminar o interno.
prerequisites: [integration-contracts]
related: [integration-contracts, event-driven-integration, schema-evolution]
canonical_for: [tradução de fronteira, modelo externo]
content_version: 2
last_reviewed: 2026-08-27
---

# Anti-Corruption Layer na Integração

## Visão Geral

Uma anti-corruption layer traduz entre o modelo de um sistema externo e o seu, de
forma que o vocabulário e as decisões de modelagem alheias parem na fronteira.

O conceito vem de
[domain-driven design](/04-domain-driven-design/anti-corruption-layer.md).
Aqui ele é visto pelo ângulo da integração: **o que acontece quando você não a
tem**, e quando o custo dela não se justifica.

O acoplamento que ela previne — acoplamento de modelo — é o mais caro quando o modelo do
fornecedor é estranho ao seu e a troca é plausível; fora dessas duas condições pode ser
barato o bastante para aceitar, e o quadrante adiante trata disso. É também o menos visível,
porque quase nunca chega como incidente: aparece como incapacidade de mudar.

## Problema

Um sistema integra com um serviço externo. O caminho mais curto é usar as
estruturas que ele devolve diretamente no código.

Funciona, e o modelo externo se espalha. Seis meses depois, o vocabulário dele
está em nomes de classe, campos de banco, telas e regras de negócio.

A partir daí:

- Trocar o fornecedor exige tocar o sistema inteiro.
- Uma mudança no modelo dele quebra coisas em lugares inesperados.
- Conceitos que não fazem sentido no seu domínio ocupam espaço nele.
- Discussões de negócio usam o vocabulário do fornecedor.

Só a segunda chega como defeito, e mesmo ela chega deslocada — a quebra aparece longe de
onde a causa está. As outras três não chegam de forma alguma: aparecem como estimativa que
triplicou.

## Conceitos Centrais

### O que a camada faz

Ela fica entre a integração e o seu domínio, e faz quatro coisas:

**Traduz vocabulário.** `Partner.legalId` vira `Fornecedor.cnpj`.

**Descarta o que não importa.** O fornecedor devolve 60 campos; seu domínio usa 8.

**Preenche o que falta.** Valores padrão, conversões, campos derivados.

**Isola falhas e formatos.** Erros do fornecedor viram erros do seu domínio; o
código de negócio não conhece códigos HTTP alheios.

O resultado: seu domínio nunca vê o modelo externo. Trocar o fornecedor é
reescrever a camada.

### Ela protege nas duas direções

Menos óbvio, e igualmente importante: quando você publica para fora, a camada
impede que **seu** modelo interno vire contrato público.

É a mesma separação entre evento interno e evento de integração descrita em
[integração orientada a eventos](/08-integration-architecture/event-driven-integration.md).

Sem ela, refatorar seu domínio quebra consumidores externos — e você perde a
liberdade de mudar o que é seu.

### O custo é real e precisa ser reconhecido

Isto é o que a literatura costuma omitir:

**Código a mais.** Duas representações do mesmo conceito e o mapeamento entre elas.

**Mudanças em dois lugares.** Um campo novo do fornecedor que você quer usar
precisa passar pela tradução.

**Camadas que não fazem nada.** Quando o modelo externo é praticamente igual ao
seu, a tradução vira cópia campo a campo — cerimônia pura.

**Indireção na depuração.** Um valor errado pode estar na origem ou na tradução.

Aplicar a camada a toda integração é tão errado quanto não aplicá-la a nenhuma.

### O critério: risco de contaminação vezes custo de troca

Duas perguntas decidem:

**O modelo externo é estranho ao seu domínio?** Se o fornecedor pensa em
"assinaturas" e você pensa em "contratos", a tradução previne confusão real. Se os
dois pensam igual, não há o que traduzir.

**Trocar o fornecedor é plausível?** Um provedor de pagamento pode ser trocado. O
sistema contábil interno da empresa, não.

```text
modelo estranho + troca plausível   → camada completa, sem discussão
modelo estranho + troca improvável  → renomear na borda, sem modelo intermediário
modelo próximo  + troca plausível   → isolar só o tipo do contrato, num ponto
modelo próximo  + troca improvável  → provavelmente não vale
```

O quadrante inferior direito é o que gera camadas inúteis quando o padrão é
aplicado por princípio.

### Onde ela mora

**Na borda do serviço** — um adaptador que só o seu domínio consome. O caso comum.

**Num serviço próprio** — quando várias aplicações integram com o mesmo externo, e
a tradução deve ser feita uma vez.

**No consumidor de eventos** — traduzindo o evento externo antes de ele entrar.

A segunda opção custa mais do que parece. O serviço de tradução compartilhado tende a
acumular regras de negócio de vários consumidores e virar um ponto de acoplamento próprio —
e, antes disso, já cobra um salto de rede em toda chamada, mais uma unidade de implantação e
de plantão, e um domínio de falha novo: se ele cai, caem **todas** as integrações de uma vez,
não uma.

### Sistema legado é o caso clássico

Ao substituir um sistema antigo gradualmente, a camada permite que o novo tenha
modelo próprio desde o início, conversando com o legado por tradução.

Sem ela, o sistema novo nasce com o modelo do que se queria substituir — o que
esvazia o motivo da substituição.

## Modelo Mental

**A camada é onde o modelo dos outros para.** O custo dela é constante e
previsível; o custo de não tê-la aparece quando você precisa mudar.

## Quando Usar

- O modelo externo é estranho ao seu domínio.
- Trocar o fornecedor é plausível.
- Integração com sistema legado durante substituição.
- Você publica para consumidores externos e quer poder refatorar.
- O modelo externo é instável.
- Várias aplicações integram com o mesmo externo.

## Quando Não Usar

**Quando os modelos são praticamente iguais.** A tradução vira cópia.

**Para integração interna entre serviços do mesmo time**, com vocabulário
compartilhado.

**Quando a troca é implausível e o modelo é próximo.**

**Como camada que só repassa.** Se ela não traduz nada, remova-a.

**Serviço de tradução compartilhado sem dono claro.** Vira depósito de regras.

**Em integração descartável.** Um script de migração usado uma vez.

## Alternativas

- **Adaptador simples** — tradução fina, sem modelo intermediário completo.
- **Mapeamento na desserialização** — para casos leves, converter na entrada.
- **Contrato dirigido pelo consumidor** — em vez de traduzir, negociar o formato. Exige
  consumidores conhecidos e um provedor disposto a rodar os testes deles, o que a inviabiliza
  em API pública e a torna cara com fornecedor de prateleira — mas a mantém viva quando há
  relação contratual real. Ver
  [contratos de integração](/08-integration-architecture/integration-contracts.md).
- **Aceitar o acoplamento conscientemente** — decisão legítima quando o modelo é
  próximo e a troca é implausível, desde que registrada.

## Trade-offs

| Com camada | Sem |
|---|---|
| Modelo interno protegido | Contaminado |
| Trocar fornecedor é local | Toca o sistema inteiro |
| Vocabulário próprio | O do fornecedor |
| Código de tradução a manter | Nenhum |
| Mudança passa por dois lugares | Um |
| Indireção na depuração | Direto |

## Modos de Falha

**Modelo externo vazando mesmo assim.** A camada existe e alguém importa o tipo do
fornecedor direto no domínio.

**Camada que só repassa.** Custo sem benefício.

**Tradução com regra de negócio.** A camada deveria traduzir, e passou a decidir.

**Tradução silenciosa perdendo informação.** Um campo que o fornecedor passou a
enviar nunca chega ao domínio, porque o mapeamento não o conhece.

**Serviço de tradução virando monólito de integração.**

**Camada desatualizada.** O fornecedor evoluiu e a tradução continua na versão
antiga, sem que ninguém saiba o que se está perdendo.

## Erros Comuns

**Aplicar a toda integração.**

**Não aplicar a nenhuma.**

**Deixar o tipo externo vazar** por um caminho lateral.

**Colocar regra de negócio na tradução.**

**Não testar a tradução** — ela é o lugar onde os erros de mapeamento vivem.

**Não revisar quando o fornecedor evolui.**

## Exemplo Real

Uma empresa de logística integrava com quatro transportadoras, cada uma com sua
API.

A primeira integração foi feita sem camada: os objetos da transportadora entraram
direto no domínio. O vocabulário dela — `shipment`, `waybill`, `consignee` — virou
o vocabulário do sistema, inclusive em tabelas e telas.

Quando a segunda transportadora entrou, o problema apareceu: ela usava outro
vocabulário e outro modelo — agrupava por rota, não por remessa. Não havia onde
encaixá-la.

A solução da época foi um campo `tipo_transportadora` com condicionais espalhadas.
Com a terceira, havia 40 pontos de condicional. A quarta levou cinco meses para
integrar.

A reformulação introduziu um modelo próprio de remessa, e uma camada de tradução
por transportadora.

**Modelo interno definido pelo negócio**, não por nenhuma delas. Os nomes viraram
`remessa`, `destinatário`, `rota` — o vocabulário que as pessoas já usavam nas
reuniões e que não existia no código.

**Um adaptador por transportadora**, traduzindo nos dois sentidos. As condicionais
espalhadas desapareceram.

**Testes de tradução** por transportadora, com respostas reais gravadas. Foi onde
apareceram três erros de mapeamento antigos, incluindo um campo de peso em libras
sendo tratado como quilos por uma delas.

A quinta transportadora foi integrada em **três semanas**, tocando apenas o
adaptador novo.

E uma decisão deliberada em sentido contrário: a integração com o sistema de
faturamento interno **não** ganhou camada. O modelo era o mesmo, o sistema é da
própria empresa e não seria trocado. Uma camada ali teria sido cópia campo a
campo.

O detalhe que a equipe destaca: o erro inicial não foi técnico, foi de sequência. Com uma
transportadora só, integrar direto parecia — e era — mais simples. O problema é que
ninguém perguntou "e quando entrar a segunda?", que era uma certeza do plano de
negócio.

## Conceitos Relacionados

- [Anti-Corruption Layer](/04-domain-driven-design/anti-corruption-layer.md) — o
  conceito em DDD.
- [Contratos de Integração](/08-integration-architecture/integration-contracts.md).
- [Integração Orientada a Eventos](/08-integration-architecture/event-driven-integration.md) — tradução de
  eventos.
- [Evolução de Esquema](/08-integration-architecture/schema-evolution.md).

## Exercício Prático

Procure no seu código o nome de um fornecedor ou de um conceito que só existe no
modelo dele. Conte em quantos arquivos ele aparece.

Se aparecer fora da pasta de integração, o modelo externo já entrou — e o número
de arquivos é o custo de trocar de fornecedor.

## Perguntas de Entrevista

- Que acoplamento a camada previne, e por que ele é o mais caro?
- Quando ela não vale a pena?
- Por que ela também protege na direção de saída?

## Para Aprofundar

- Evans, Eric. *Domain-Driven Design*. Addison-Wesley, 2003 — capítulo 14.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. Addison-Wesley, 2013.
- Newman, Sam. *Monolith to Microservices*. O'Reilly, 2019.
