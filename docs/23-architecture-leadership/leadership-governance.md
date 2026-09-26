---
id: leadership-governance
title: Governança sob a Ótica de Quem Estabelece
sidebar_position: 11
description: Desenhar mecanismos com dono, custo declarado e data de validade, e ter processo para removê-los.
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
content_version: 3
last_reviewed: 2026-08-29
---

# Governança sob a Ótica de Quem Estabelece

## Visão Geral

O [nível anterior](/19-architecture-governance/index.md) descreve como a governança opera. Este
documento trata de quem a **cria**, e a diferença é grande, porque o criador tem uma
responsabilidade que o operador não tem:

```text
operar   fazer o mecanismo funcionar
criar    decidir se ele deve existir, e por quanto tempo
```

Toda organização tem processo para adicionar mecanismos: um incidente acontece, cria-se um
controle. Quase nenhuma tem processo para removê-los. E, entre as causas de acumulação de burocracia,
essa assimetria é a única que está nas mãos de quem desenha o mecanismo; regulação e crescimento de
escopo não estão. A assimetria em si está descrita em
[patologias de governança](/19-architecture-governance/governance-pathologies.md).

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
definiu o que ele deveria produzir, e, sem isso, a discussão sobre mantê-lo é sobre opinião.

## Conceitos Centrais

### Todo mecanismo nasce com cinco campos

```text
o risco que ele endereça       específico, não categoria
como o efeito será medido      quantas vezes ele pegou algo
o custo estimado               atraso médio × volume
o dono                         papel, não área
a data de validade             no máximo 24 meses
```

Os dois últimos são os que faltam em quase todo mecanismo existente. Sem dono, ele não é ajustado;
sem validade, ele é permanente por omissão.

Ver [medição de governança](/19-architecture-governance/measuring-governance.md).

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

Um mecanismo humano criado quando um automático era viável custa atrito a cada entrega, enquanto existir. Ver
[fundamentos de governança](/19-architecture-governance/governance-basics.md).

### Meta de remoção anual

A intervenção estrutural que resolve a acumulação:

```text
"removemos ao menos um mecanismo por ano"
```

Isso dá dono ao ato de remover, que era o que faltava. E força a revisão do conjunto, porque
escolher qual remover exige olhar todos.

Uma organização que nunca removeu um mecanismo tem, com alta probabilidade, mais mecanismos do
que precisa, e o diagnóstico independe de qual deles se examine primeiro.

### Suspender é melhor que discutir

```text
discutir se um mecanismo é necessário   argumentos indefinidos
suspendê-lo por um trimestre            evidência em três meses
```

Para decidir se um mecanismo existente deve continuar, a suspensão temporária é o instrumento que
produz evidência mais rápido, e o mais difícil de conseguir autorização para usar. Ela é aplicável
a tudo exceto controles regulatórios e de segurança crítica. Um programa de redução que a usou
está em [patologias de governança](/19-architecture-governance/governance-pathologies.md); aqui
importa o desenho: quem cria o mecanismo deveria prever, já na criação, que ele pode ser suspenso.

### Proporcionalidade ao risco

```text
sistema crítico regulado     mecanismo pesado se justifica
ferramenta interna de uso
  ocasional                  o mesmo mecanismo é desperdício
```

Por que a governança uniforme se paga mal está em
[fundamentos de governança](/19-architecture-governance/governance-basics.md). Do lado de quem cria,
a consequência prática é que o campo "risco" precisa nomear a classe de sistema a que o mecanismo
se aplica, e não só o risco.

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
desproporcionais, e ela não exige processo nenhum, apenas a regra.

### Governança boa é invisível

```text
mecanismo visível     alguém precisa fazer algo a mais
mecanismo invisível   o caminho fácil já é o correto
```

O objetivo de quem estabelece governança deveria ser tornar os mecanismos desnecessários, movendo
o que eles verificam para dentro da plataforma, do gabarito e da esteira.

Uma área de governança cujo sucesso é medido por número de mecanismos operados tem o incentivo
invertido. Ver
[engenharia de plataforma](/14-devops-and-platform/platform-engineering.md).

## Modelo Mental

**Todo mecanismo nasce com risco, medida, custo, dono e validade.** E a organização precisa de uma meta de
remoção, porque adicionar tem dono e remover não tem.

## Quando Usar

- Ao criar qualquer mecanismo de governança.
- Na revisão periódica do conjunto.
- Antes de responder a um incidente com um controle novo.

## Quando Não Usar

**Controles cuja validade é fixada por terceiros.** Quando um regulador ou um contrato define o
prazo e o conteúdo do controle, uma validade interna de 24 meses é teatro: a renovação não pode
decidir nada. O desenho ainda vale para dono e medida, mas a validade é a do regulador.

**Conjuntos pequenos demais para uma meta anual.** Numa organização com três ou quatro mecanismos,
todos com efeito medido, "remover ao menos um por ano" força remover o que funciona, ou convida a
cumprir a meta com um mecanismo irrelevante. A meta pressupõe acumulação; sem ela, a revisão de
validade basta.

**Controles de segurança crítica, para a suspensão.** Suspender por um trimestre produz evidência
ao preço de expor o risco por um trimestre. Quando o dano de um único evento é irreversível, esse
preço não se paga, e a avaliação precisa vir de medida indireta, não de experimento.

**Resposta a incidente em curso.** Durante a contenção, um controle provisório sem desenho é
legítimo; as duas semanas de desenho vêm depois, antes de o provisório virar permanente.

## Alternativas

- **Plataforma**: mover a propriedade para o caminho pavimentado, eliminando o mecanismo.
- **Função de aptidão**: verificação automática em vez de humana. Ver
  [funções de aptidão](/23-architecture-leadership/fitness-functions.md).
- **Registro sem aprovação**: para riscos baixos, visibilidade basta.
- **Nada**: aceitar o risco formalmente é uma resposta legítima. Ver
  [gestão de risco](/23-architecture-leadership/risk-management.md).

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

**Renovação como carimbo.** Aos 24 meses, o dono renova sem apresentar a medida, porque ninguém
pediu. A validade passa a existir só no papel, e o mecanismo volta a ser permanente por omissão,
agora com a aparência de ter sido revisado.

**Cumprir a meta de remoção com o mecanismo irrelevante.** Remove-se o formulário que ninguém
preenchia, e o comitê que atrasa toda entrega fica. A meta é cumprida e a acumulação continua; o
sinal é que o custo total do conjunto não cai de um ano para outro.

**Responder a incidente** com controle sem avaliar o ponto de intervenção.

**Não definir** como o efeito será medido.

**Não atribuir dono** como papel.

**Nunca remover nada.**

**Não escalonar** por criticidade.

## Exemplo Real

Uma empresa de logística com 160 engenheiros sofreu um vazamento de credencial: uma chave de
acesso a um armazenamento de objetos foi comitada num repositório público por engano, e ficou
exposta por nove dias.

A resposta institucional imediata foi a esperada: criar um comitê de revisão de segurança para
toda entrega. A liderança de arquitetura pediu duas semanas antes de instituí-lo, para desenhar
o mecanismo com os cinco campos.

O exercício mudou a resposta:

```text
risco endereçado    credencial exposta em repositório
                    — específico, não "segurança de código"
efeito medido como  credenciais detectadas antes de chegarem ao
                    repositório remoto
custo estimado      comitê: ~3 dias de atraso × 340 entregas/ano
                    ≈ 1.000 dias de atraso acumulado por ano
                    verificação automática: ~0
ponto de intervenção mais cedo viável: no cliente de versionamento,
                    antes do envio
```

O comitê nunca foi criado. Em vez dele: verificação local no momento do envio, verificação na
esteira como rede de segurança, e rotação automática de credenciais com prazo curto, de modo que
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
revisões humanas de segurança realizadas     29 (24 previstas, a 12/ano,
                                             mais 5 exceções)
```

Na renovação, aos 24 meses, o dono apresentou os números e o mecanismo foi mantido, com o escopo
das revisões humanas ampliado para incluir integrações com parceiros externos, que tinham
aparecido como lacuna.

O aprendizado que ficou: a pergunta "qual é o ponto de intervenção mais cedo viável?" transformou
uma proposta de cerca de mil dias de atraso acumulado por ano num mecanismo sem atraso adicionado
à entrega. E ela custou duas
semanas de espera. Essa foi a parte politicamente difícil, porque logo após um incidente a
pressão é por agir, não por desenhar.

## Conceitos Relacionados

- [Governança](/19-architecture-governance/index.md): a operação.
- [Princípios](/23-architecture-leadership/leadership-principles.md).
- [Padrões](/23-architecture-leadership/leadership-standards.md).
- [Funções de Aptidão](/23-architecture-leadership/fitness-functions.md).

## Exercício Prático

Escolha o último controle criado na sua organização em resposta a um incidente e preencha os
cinco campos: o risco específico, como o efeito seria medido, o custo em atraso × volume, o dono
como papel e a data de validade. Depois responda: qual é o ponto de intervenção mais cedo viável
para esse risco, e o controle está nele? Se algum campo ficar em branco, é ele que decide se o
mecanismo deveria existir.

## Perguntas de Entrevista

- Por que adicionar mecanismos tem dono e remover não tem?
- Por que suspender temporariamente produz mais que discutir?
- Por que quem propõe um mecanismo deveria operá-lo?

## Para Aprofundar

- Hohpe, Gregor. *The Software Architect Elevator*. O'Reilly, 2020.
- Forsgren, Nicole et al. *Accelerate*. IT Revolution, 2018.
- Ford, Neal et al. *Building Evolutionary Architectures*. 2ª ed. O'Reilly, 2022.
