---
id: singleton
title: Singleton
sidebar_position: 5
description: Uma instância global com acesso global — o padrão mais aplicado e o mais frequentemente errado.
doc_type: pattern
level: 2
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor reconhece que Singleton acopla duas decisões
  independentes e sabe qual delas ele realmente precisa.
prerequisites: [design-patterns]
related: [factory-method, facade, dependency-inversion]
canonical_for: [singleton]
content_version: 2
last_reviewed: 2026-08-26
---

# Singleton

## Visão Geral

Singleton garante que uma classe tenha uma única instância e fornece um ponto
global de acesso a ela.

A frase contém **duas promessas independentes**, e é a junção delas que torna o
padrão problemático. Quase sempre você precisa de uma, não das duas.

## Problema

O problema declarado: alguns recursos devem existir uma vez só — um pool de
conexões, um registro de configuração, um cache.

Isso é legítimo. O que o padrão faz de errado é resolver a unicidade **e** o
acesso global no mesmo mecanismo.

Unicidade é uma decisão de ciclo de vida. Acesso global é uma decisão de
visibilidade. Quando `Configuracao.getInstance()` está espalhado por trezentos
lugares, você não tem uma instância única — tem uma dependência oculta em
trezentos lugares, que nenhuma assinatura declara.

As consequências são conhecidas e todas derivam do acesso global, não da
unicidade:

**Dependência invisível.** A assinatura de um método não revela que ele depende
da configuração. Ler o código não basta para saber o que ele precisa.

**Teste acoplado.** Substituir a instância exige mecanismo global, e testes
passam a interferir uns nos outros pela ordem de execução.

**Estado compartilhado.** Um singleton mutável é uma variável global com
encapsulamento aparente, com todos os problemas de concorrência que isso implica.

## Conceitos Centrais

### Separe as duas decisões

**Se você precisa de uma instância só** — configure isso onde o objeto é criado.
Um contêiner de injeção de dependência faz exatamente isso: escopo de aplicação,
uma instância, injetada em quem precisa.

**Se você precisa de acesso conveniente** — passe a dependência. Uma assinatura
que declara `(Configuracao config)` é honesta sobre o que o método precisa.

A combinação de instância única com injeção explícita entrega a unicidade e a
testabilidade que o Singleton promete, ao custo do cabeamento explícito — que se paga em
quase tudo, e vira ruído desproporcional nas dependências transversais que atravessam a base
inteira.

### Singleton sem estado é menos ruim

Um objeto imutável e sem estado acessado globalmente causa menos dano — não há
condição de corrida nem interferência entre testes.

Continua havendo dependência oculta, que é o custo estrutural. Mas o risco
operacional cai muito.

### O caso legítimo

Existe: pontos de entrada de infraestrutura que o próprio ambiente já trata como
global — registro de log, métricas, relógio do sistema.

Mesmo ali, a forma testável é a fachada global sobre uma instância injetável.

## Quando Usar

- Recursos que o ambiente já trata como globais — log, métricas — e cuja
  passagem explícita por toda a base seria ruído desproporcional.
- Objetos imutáveis e sem estado.
- Quando a linguagem ou o framework impõe o mecanismo.

## Quando Não Usar

**Quando você só precisa de uma instância.** Use escopo de injeção de
dependência. É a resposta na maioria esmagadora dos casos.

**Para qualquer coisa com estado mutável.** É variável global.

**Para acesso a banco, cliente HTTP, repositório.** São dependências de negócio e
devem ser declaradas na assinatura.

**Quando o teste precisa substituir.** Se substituir exige mecanismo global, o
teste ficou acoplado à ordem de execução.

**Para configuração.** É a aplicação mais comum e uma das piores: espalha uma
dependência oculta por todo o sistema.

## Alternativas

- **Injeção de dependência com escopo de aplicação** — unicidade sem acesso
  global. A alternativa principal.
- **Parâmetro explícito** — passar o objeto.
- **Objeto de contexto** — agrupar o que atravessa muitas camadas.
- **Módulo com estado encapsulado** — em linguagens com módulos de primeira
  classe, resolve sem classe.

## Trade-offs

| Singleton | Injeção com escopo único |
|---|---|
| Acesso de qualquer lugar | Precisa ser recebido |
| Nenhum cabeamento | Cabeamento explícito |
| Dependência invisível | Dependência declarada |
| Teste exige mecanismo global | Substituição trivial |
| Risco de estado compartilhado | Escopo controlado |
| Uma instância garantida | Uma instância configurada |

O Singleton ganha em duas colunas. Uma é conveniência. A outra é a força da garantia: a
unicidade é estrutural, enquanto um registro de injeção mal configurado como transitório
entrega duas instâncias sem avisar ninguém. A segunda vantagem é real e mesmo assim não
compensa — configuração de registro é verificável num teste, e o acoplamento que o acesso
global cria não é verificável em lugar nenhum.

## Modos de Falha

**Estado compartilhado sob concorrência.** Condições de corrida em código que
parece isolado.

**Testes que se interferem.** Um teste altera o singleton, outro falha depois —
e a falha depende da ordem.

**Inicialização preguiçosa não segura.** Duas threads criam duas instâncias.

**Ciclo de inicialização.** Dois singletons que se referenciam durante a
construção.

**Dependência oculta descoberta tarde.** Um método que parecia puro depende da
configuração, e isso só aparece quando o ambiente muda.

## Erros Comuns

**Usar para configuração.** O mais comum.

**Confundir unicidade com acesso global.** A confusão central.

**Achar que a solução é tornar o singleton testável.** Se você precisa de
mecanismo para substituí-lo, a dependência deveria ser explícita.

**Singleton mutável.** Variável global com outro nome.

## Onde ele aparece na prática

**Registros de log.** `LoggerFactory.getLogger(...)` é acesso global sobre
configuração única. É o caso legítimo, e funciona porque log é infraestrutura
transversal e o objeto é efetivamente sem estado do ponto de vista do chamador.

**Contêineres de injeção de dependência.** Ironicamente, o contêiner costuma ser
um singleton — e existe para que nada mais precise ser.

**Pools de conexão.** Uma instância por aplicação, mas as boas bibliotecas a
injetam em vez de expor acesso estático.

O padrão nos três casos é o mesmo: **unicidade sim, acesso global só quando o
objeto é transversal e sem estado observável**. Bibliotecas maduras convergiram
para isso; código de aplicação frequentemente não.

## Exemplo Real

Um sistema tinha `ConfiguracaoGlobal.getInstance()` chamado em 214 lugares.

Dois problemas apareceram juntos.

Testes falhavam de forma intermitente conforme a ordem — um teste que alterava um
parâmetro afetava os seguintes, e o CI reordenava.

E ninguém conseguia responder quais partes do sistema dependiam de qual
parâmetro, porque a dependência não estava em nenhuma assinatura.

A migração foi incremental: a classe passou a ser injetável, `getInstance()` foi
mantido como delegação temporária, e as chamadas foram substituídas módulo a
módulo.

O resultado inesperado veio no meio do caminho: ao declarar as dependências, o
time descobriu que 60% dos 214 pontos usavam apenas três parâmetros. Esses três
viraram parâmetros de método, e a maior parte do sistema deixou de depender de
configuração de qualquer forma.

O Singleton não estava só escondendo uma dependência — estava escondendo que a
dependência era muito menor do que parecia.

## Conceitos Relacionados

- [Inversão de Dependência](/02-software-design/dependency-inversion.md) — a
  alternativa estrutural.
- [Facade](/03-design-patterns/facade.md) — frequentemente confundido, resolve outro problema.
- [Encapsulamento](/02-software-design/encapsulation.md).

## Exercício Prático

Conte quantas chamadas a métodos estáticos de acesso a instância existem no seu
sistema.

Escolha o mais usado e liste, para os dez primeiros pontos de uso, **o que
exatamente** cada um consome dele.

Se a maioria usa poucos campos, a dependência real é menor que a declarada — e
provavelmente pode virar parâmetro.

## Perguntas de Entrevista

- Quais são as duas promessas do Singleton, e por que juntá-las é problema?
- Por que Singleton dificulta testes?
- Quando ele é aceitável?

## Para Aprofundar

- Gamma, Erich et al. *Design Patterns*. Addison-Wesley, 1994.
- Fowler, Martin. *Inversion of Control Containers and the Dependency Injection
  Pattern*, 2004.
