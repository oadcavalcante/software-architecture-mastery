---
id: architecture-vs-implementation
title: Arquitetura vs. Implementação
sidebar_position: 3
description: Por que uma arquitetura que não é imposta pelo código não existe, e o que fazer a respeito.
doc_type: foundation
level: 1
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor reconhece a diferença entre arquitetura pretendida e
  arquitetura real, e sabe quais mecanismos tornam uma fronteira efetiva.
prerequisites: [architecture-vs-design]
related: [dependency-management, technical-debt]
canonical_for: [arquitetura pretendida, arquitetura real, deriva arquitetural]
content_version: 1
last_reviewed: 2026-08-26
---

# Arquitetura vs. Implementação

## Visão Geral

Existem duas arquiteturas em todo sistema: a **pretendida**, que está nos
diagramas e na cabeça das pessoas, e a **real**, que é o grafo de dependências
que o código de fato tem.

Quando as duas divergem, a real vence. Ela é a que determina o custo de mudança,
a que propaga falhas e a que o próximo desenvolvedor vai copiar como referência.

## O Problema

O padrão é conhecido. A documentação descreve três camadas com responsabilidades
separadas e dependências apontando para dentro. O código tem um controlador que
importa o cliente HTTP de um serviço externo, uma entidade de domínio que
carrega anotação de serialização, e um módulo de relatórios que lê direto das
tabelas de outros quatro módulos.

Ninguém decidiu isso. Cada passo individual foi razoável sob pressão de prazo, e
nada impedia. A arquitetura pretendida nunca foi implementada — só desenhada.

O erro de diagnóstico comum é chamar isso de indisciplina. Não é. É a
consequência previsível de uma fronteira que existe como acordo verbal em vez de
como restrição verificável. **Toda fronteira que depende exclusivamente de
lembrança vai ser atravessada.** É questão de tempo e de rotatividade.

## Conceitos Centrais

### Deriva arquitetural

O afastamento gradual entre a arquitetura pretendida e a real.

A deriva raramente acontece por uma decisão grande. Acontece por acúmulo: um
atalho aqui sob prazo, um import ali que "é só temporário", uma exceção pontual
que vira precedente. Cada passo é pequeno; a soma é estrutural.

O sinal característico é o comentário "aqui a gente já não segue mais a
arquitetura". Quando alguém consegue dizer isso, a deriva já é conhecida e
tolerada — que é o estágio anterior a ela ser invisível.

### Fronteira efetiva versus fronteira nominal

Uma fronteira **nominal** está no diagrama, na documentação ou na convenção de
diretórios. Ela restringe quem lembra dela e escolhe respeitá-la.

Uma fronteira **efetiva** é imposta por algo que falha quando é violada. O código
não compila, o teste quebra, o CI recusa o merge.

A distinção é binária na prática: fronteira nominal é uma sugestão com aparência
de regra.

### Os mecanismos que tornam uma fronteira efetiva

Ordenados por força — quanto mais alto, menos depende de vigilância humana:

| Mecanismo | Força | Custo |
|---|---|---|
| Separação de processo ou repositório | Muito alta — a violação é impossível | Alto: operação, versionamento, latência |
| Módulo de linguagem com visibilidade real | Alta — não compila | Depende do que a linguagem oferece |
| Teste de arquitetura no CI | Alta — não faz merge | Baixo: manutenção da regra |
| Análise estática de dependências | Média a alta | Baixo |
| Revisão de código | Média — depende de quem revisa e de estar atento | Contínuo e humano |
| Convenção documentada | Baixa | Aparente zero, real alto |

A tabela contém a decisão principal do documento: **fronteiras que importam
merecem mecanismo automatizado.** Revisão de código é uma rede com furos de
tamanho variável, e o tamanho aumenta com pressão de prazo — exatamente quando
mais precisa funcionar.

### O teste de arquitetura

O mecanismo com melhor relação entre efeito e custo para a maioria dos times:
um teste que falha quando uma dependência proibida aparece.

```text
teste: "domínio não depende de infraestrutura"

  para cada classe em  com.exemplo.dominio
    nenhum import de   com.exemplo.infra
                       org.springframework
                       jakarta.persistence
```

É barato de escrever, roda em segundos, e converte a fronteira de acordo verbal
em condição verificável. Quando alguém precisa violá-la, precisa alterar o teste
— o que torna a violação uma decisão explícita, discutível em revisão, em vez de
um import que passa despercebido.

Essa é a ideia que reaparece no Nível 07 como
[fitness function](../23-architecture-leadership/index.md).

## Modelo Mental

**A arquitetura real de um sistema é o seu grafo de dependências.** Tudo o mais é
comentário sobre ele.

Diante de qualquer afirmação sobre a arquitetura de um sistema, a verificação é
sempre a mesma: extraia as dependências reais e compare. A ferramenta varia por
linguagem; a pergunta não.

## Por Que Isso Importa

**Porque a arquitetura real é a que cobra.** O custo de mudança, a propagação de
falha e a dificuldade de testar derivam do grafo real, não do pretendido. Um
sistema documentado como desacoplado e implementado como acoplado tem todos os
custos do acoplamento e nenhum dos seus benefícios.

**Porque o código é a documentação que o próximo desenvolvedor lê.** Quem chega
aprende a arquitetura imitando o que encontra. Se o que encontra viola o
diagrama, o diagrama perdeu — e cada nova violação parece consistente com o que
já existe.

**Porque decidir uma fronteira sem mecanismo é decidir metade.** Escolher que o
domínio não depende de infraestrutura e não impor isso produz o custo da decisão
(indireção, mais arquivos) sem o benefício (independência real). É o pior dos
dois mundos, e é comum.

## Erros Comuns

**Confiar em convenção de diretórios como fronteira.** Uma pasta chamada
`domain` não impede nada. Ela sinaliza intenção, o que é útil, e não impõe
absolutamente nada.

**Achar que revisão de código basta.** Revisão pega o que o revisor procura, no
dia em que ele está atento, no diff que ele consegue ler inteiro. Nenhuma dessas
três condições é confiável sob prazo.

**Tratar violação como falha de pessoa.** Se três pessoas diferentes atravessaram
a mesma fronteira, o problema não são as três pessoas. Ou a fronteira está no
lugar errado, ou não tem mecanismo. Ambas são questões de projeto.

**Descobrir a deriva só na próxima grande refatoração.** Sem medição contínua, a
divergência é descoberta quando alguém tenta uma mudança grande e falha — que é
o momento mais caro possível para descobrir.

**Impor fronteiras demais.** O erro oposto e também real. Cada fronteira efetiva
tem custo: indireção, cerimônia, atrito. Um sistema com quinze fronteiras
impostas onde três bastariam é tão disfuncional quanto um sem nenhuma. Imponha as
que importam — e ter que escolher quais é justamente o trabalho arquitetural.

## Exemplo Real

Um time adota Arquitetura Hexagonal num serviço novo. Diagramas, documentação,
apresentação para a área. Seis meses depois, o serviço tem oito casos de uso e a
estrutura de diretórios prometida.

Uma análise de dependências revela: quatro dos oito casos de uso importam
diretamente o cliente HTTP do serviço de pagamentos, contornando a porta que
existia para isso. As entidades carregam anotações do ORM. Dois adaptadores
importam uns aos outros.

O sistema tem a indireção do Hexagonal — portas, adaptadores, mais arquivos — e
não tem a propriedade que a indireção deveria comprar: trocar o cliente de
pagamentos ainda toca o domínio.

O time reagiu com dois testes de arquitetura, escritos numa tarde: nenhum pacote
de domínio importa `infra`, e nenhum adaptador importa outro adaptador. Os dois
falharam imediatamente, com dezenove violações.

A parte instrutiva: as dezenove foram corrigidas em três semanas, e nenhuma nova
apareceu depois. O problema nunca foi capacidade nem disciplina — era ausência de
sinal. Enquanto violar era silencioso, violar acontecia.

## Conceitos Relacionados

- [Arquitetura vs. Design](architecture-vs-design.md) — a fronteira anterior.
- [Gestão de Dependências](dependency-management.md) — o material de que o grafo
  real é feito.
- [Dívida Técnica](technical-debt.md) — como a deriva se acumula e cobra juros.

## Exercício Prático

Escolha uma fronteira que seu sistema afirma ter — uma camada, um módulo, uma
regra de "isto não acessa aquilo".

Escreva um teste que falhe se ela for violada. Não corrija nada ainda: rode e
conte as violações.

Duas perguntas: o número surpreendeu? E, para cada violação, ela é um atalho a
corrigir ou um sinal de que a fronteira está no lugar errado?

A segunda pergunta é a mais valiosa. Nem toda violação é erro de quem escreveu;
algumas são o sistema informando que a fronteira foi mal desenhada.

## Perguntas de Entrevista

- Como você verifica se a arquitetura documentada é a que o sistema tem?
- O que você faz ao encontrar uma violação sistemática de uma fronteira?
- Que mecanismos tornam uma fronteira arquitetural efetiva, e como escolher entre eles?

## Para Aprofundar

- Ford, Neal; Parsons, Rebecca; Kua, Patrick. *Building Evolutionary
  Architectures*. O'Reilly, 2017 — fitness functions como mecanismo.
- Documentação do ArchUnit (Java) e de equivalentes como `import-linter`
  (Python) e `dependency-cruiser` (TypeScript) — implementações de teste de
  arquitetura.
