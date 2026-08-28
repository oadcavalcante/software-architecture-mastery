---
id: leadership-governance
title: Governança sob a Ótica de Quem Estabelece
sidebar_position: 11
description: Desenhar mecanismos com dono, custo declarado e data de validade — e ter processo para removê-los.
doc_type: concept
level: 7
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor desenha um mecanismo de governança com dono, medida e prazo, e institui
  a prática de remover mecanismos.
prerequisites: [architecture-leadership-basics]
related: [leadership-principles, leadership-standards, fitness-functions]
canonical_for: [desenho de mecanismo de governança, validade de mecanismo, meta de remoção]
content_version: 1
last_reviewed: 2026-08-29
---

# Governança sob a Ótica de Quem Estabelece

## Visão Geral

O [nível anterior](../19-architecture-governance/index.md) descreve como a governança opera. Este
documento trata de quem a **cria** — e a diferença é grande, porque o criador tem uma
responsabilidade que o operador não tem:

```text
operar   fazer o mecanismo funcionar
criar    decidir se ele deve existir, e por quanto tempo
```

Toda organização tem processo para adicionar mecanismos: um incidente acontece, cria-se um
controle. Quase nenhuma tem processo para removê-los — e essa assimetria é a causa de toda
acumulação de burocracia.

```text
adicionar   tem dono, urgência e um incidente para justificar
remover     não tem dono, é politicamente arriscado, e o
            benefício é difuso
```

Quem estabelece governança precisa desenhar a segunda metade também.

## Problema

O mecanismo típico nasce assim:

```text
incidente     um serviço foi para produção sem revisão de segurança
resposta      toda entrega passa a exigir aprovação de segurança
resultado     três anos depois, 400 aprovações por ano, das quais
              duas encontraram algo
```

A resposta original era proporcional ao incidente. Ela deixou de ser proporcional quando a
organização construiu verificação automática de segurança e ninguém revisitou o mecanismo manual.

E há um segundo padrão: o mecanismo criado sem medida. Ele não pode ser avaliado, porque nunca se
definiu o que ele deveria produzir — e sem isso, a discussão sobre mantê-lo é sobre opinião.

## Conceitos Centrais

### Todo mecanismo nasce com quatro campos

```text
o risco que ele endereça       específico, não categoria
como o efeito será medido      quantas vezes ele pegou algo
o custo estimado               atraso médio × volume
o dono                         papel, não área
a data de validade             no máximo 24 meses
```

Os dois últimos são os que faltam em quase todo mecanismo existente. Sem dono, ele não é ajustado;
sem validade, ele é permanente por omissão.

Ver [medição de governança](../19-architecture-governance/measuring-governance.md).

### Escolha o ponto de intervenção mais cedo viável

Antes de criar um mecanismo humano, a pergunta:

```text
"isto pode ser impedido no ambiente ou no gabarito, em vez
 de verificado por alguém?"
```

```text
no ambiente     o caminho errado não existe
no gabarito     nasce correto
na esteira      falha automaticamente
em revisão      alguém percebe
em comitê       alguém percebe semanas depois
```

Um mecanismo humano criado quando um automático era viável custa para sempre. Ver
[fundamentos de governança](../19-architecture-governance/governance-basics.md).

### Meta de remoção anual

A intervenção estrutural que resolve a acumulação:

```text
"removemos ao menos um mecanismo por ano"
```

Isso dá dono ao ato de remover, que era o que faltava. E força a revisão do conjunto, porque
escolher qual remover exige olhar todos.

Uma organização que nunca removeu um mecanismo tem, com alta probabilidade, mais mecanismos do
que precisa — e o diagnóstico independe de qual deles se examine primeiro.

### Suspender é melhor que discutir

```text
discutir se um mecanismo é necessário   argumentos indefinidos
suspendê-lo por um trimestre            evidência em três meses
```

A suspensão temporária é o instrumento mais eficaz e o mais difícil de conseguir autorização para
usar. Ela produz evidência que nenhuma análise produz, e é aplicável a tudo exceto controles
regulatórios e de segurança crítica.

### Proporcionalidade ao risco, sempre

```text
sistema crítico regulado     mecanismo pesado se justifica
ferramenta interna de uso
  ocasional                  o mesmo mecanismo é desperdício
```

Aplicar governança uniforme é o erro que consome a paciência da organização em casos irrelevantes
— e a paciência acaba justamente quando um caso importante aparece.

Escalonar por criticidade exige uma classificação que já deveria existir por outros motivos:
recuperação de desastre, resposta a incidente, controle de acesso.

### Quem cria precisa operar por um tempo

Uma prática incomum e reveladora: quem propõe um mecanismo o opera pelos primeiros meses.

Isso produz duas coisas. O custo do mecanismo fica visível para quem o criou, e não apenas para
quem o sofre. E o desenho melhora rápido, porque quem sente o atrito tem incentivo e autoridade
para ajustá-lo.

A prática também corrige uma assimetria comum: mecanismos costumam ser propostos por quem responde
por um risco e operados por quem responde por entrega, o que separa quem decide o custo de quem
paga. Juntar os dois papéis por alguns meses é a intervenção mais barata contra propostas
desproporcionais, e ela não exige processo nenhum — apenas a regra.

### Governança boa é invisível

```text
mecanismo visível     alguém precisa fazer algo a mais
mecanismo invisível   o caminho fácil já é o correto
```

O objetivo de quem estabelece governança deveria ser tornar os mecanismos desnecessários — movendo
o que eles verificam para dentro da plataforma, do gabarito e da esteira.

Uma área de governança cujo sucesso é medido por número de mecanismos operados tem o incentivo
invertido. Ver
[engenharia de plataforma](../14-devops-and-platform/platform-engineering.md).

## Modelo Mental

**Todo mecanismo nasce com dono, medida e validade.** E a organização precisa de uma meta de
remoção, porque adicionar tem dono e remover não tem.

## Quando Usar

- Ao criar qualquer mecanismo de governança.
- Na revisão periódica do conjunto.
- Antes de responder a um incidente com um controle novo.

## Quando Não Usar

**Sem dono, medida e validade.**

**Quando o ponto de intervenção automático era viável.**

**Uniformemente**, sem escalonar por criticidade.

**Sem processo de remoção.**

**Criando mecanismo** como resposta reflexa a incidente.

## Alternativas

- **Plataforma** — mover a propriedade para o caminho pavimentado, eliminando o mecanismo.
- **Função de aptidão** — verificação automática em vez de humana. Ver
  [funções de aptidão](fitness-functions.md).
- **Registro sem aprovação** — para riscos baixos, visibilidade basta.
- **Nada** — aceitar o risco formalmente é uma resposta legítima. Ver
  [gestão de risco](risk-management.md).

## Trade-offs

| Mecanismo formal | Plataforma |
|---|---|
| Rápido de instituir | Caro de construir |
| Custo permanente de atrito | Custo único |
| Contornável | Invisível e efetivo |

| Validade curta | Longa |
|---|---|
| Revisão frequente | Menos overhead |
| Custo de renovar | Permanência por omissão |

## Modos de Falha

**Acumulação.** Adicionar tem dono, remover não.

**Mecanismo sem medida.** Impossível avaliar.

**Sem validade.** Permanente por omissão.

**Uniforme.** Consome paciência em casos irrelevantes.

**Humano onde automático era viável.** Custo perpétuo.

**Sucesso medido por número de mecanismos.** Incentivo invertido.

## Erros Comuns

**Responder a incidente** com controle sem avaliar o ponto de intervenção.

**Não definir** como o efeito será medido.

**Não atribuir dono** como papel.

**Nunca remover nada.**

**Não escalonar** por criticidade.

## Exemplo Real

Uma empresa de logística com 160 engenheiros sofreu um vazamento de credencial: uma chave de
acesso a um armazenamento de objetos foi comitada num repositório público por engano, e ficou
exposta por nove dias.

A resposta institucional imediata foi a esperada — criar um comitê de revisão de segurança para
toda entrega. A liderança de arquitetura pediu duas semanas antes de instituí-lo, para desenhar
o mecanismo com os quatro campos.

O exercício mudou a resposta:

```text
risco endereçado    credencial exposta em repositório
                    — específico, não "segurança de código"
efeito medido como  credenciais detectadas antes de chegarem ao
                    repositório remoto
custo estimado      comitê: ~3 dias de atraso × 340 entregas/ano
                    ≈ 4 anos-pessoa de calendário
                    verificação automática: ~0
ponto de intervenção mais cedo viável: no cliente de versionamento,
                    antes do envio
```

O comitê nunca foi criado. Em vez dele: verificação local no momento do envio, verificação na
esteira como rede de segurança, e rotação automática de credenciais com prazo curto — de modo que
uma chave exposta expire antes de ser útil.

O mecanismo humano que restou foi pequeno e específico: revisão de segurança obrigatória apenas
para serviços que expõem superfície pública nova, cerca de 12 por ano em vez de 340.

**Dono, validade e medida** foram definidos antes de ligar qualquer coisa. Dono: o papel de
mantenedor da plataforma. Validade: 24 meses. Medida: credenciais bloqueadas antes do envio.

Nos 24 meses seguintes:

```text
credenciais bloqueadas antes do envio        41
credenciais que chegaram ao repositório       0
atraso adicionado ao processo de entrega      0
revisões humanas de segurança realizadas     23 (das 12/ano previstas
                                             mais exceções)
```

Na renovação, aos 24 meses, o dono apresentou os números e o mecanismo foi mantido — com o escopo
das revisões humanas ampliado para incluir integrações com parceiros externos, que tinham
aparecido como lacuna.

O aprendizado que ficou: a pergunta "qual é o ponto de intervenção mais cedo viável?" transformou
uma proposta de quatro anos-pessoa de atraso anual num mecanismo de custo zero. E ela custou duas
semanas de espera — que foi a parte politicamente difícil, porque logo após um incidente a
pressão é por agir, não por desenhar.

## Conceitos Relacionados

- [Governança](../19-architecture-governance/index.md) — a operação.
- [Princípios](leadership-principles.md).
- [Padrões](leadership-standards.md).
- [Funções de Aptidão](fitness-functions.md).

## Exercício Prático

Pergunte, na sua organização: qual foi o último mecanismo de governança removido, e quando?

Se ninguém souber responder, o conjunto só cresceu — e o diagnóstico independe de qual mecanismo
você examine primeiro.

## Perguntas de Entrevista

- Por que adicionar mecanismos tem dono e remover não tem?
- Por que suspender temporariamente produz mais que discutir?
- Por que quem propõe um mecanismo deveria operá-lo?

## Para Aprofundar

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
