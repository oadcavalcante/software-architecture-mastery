# Software Architecture Mastery

[Português](README.md) · [English](README.en-US.md)

Um percurso de aprendizado para Engenheiros de Software que querem pensar como
Arquitetos de Software.

O objetivo não é ensinar padrões, frameworks ou serviços de nuvem. É desenvolver
raciocínio arquitetural:

```text
Entender o problema
        ↓
Identificar restrições
        ↓
Avaliar alternativas
        ↓
Raciocinar sobre trade-offs
        ↓
Tomar decisões arquiteturais
        ↓
Comunicar e defender essas decisões
        ↓
Evoluir a arquitetura ao longo do tempo
```

## Estado do projeto

**Fase F1 — espinha dorsal concluída.** As 23 seções existem com índices que
explicam o percurso inteiro, a navegação está agrupada nos sete níveis, e o
glossário, o modelo de maturidade e a política terminológica estão publicados.
Os tópicos individuais de cada seção ainda não foram escritos.

O plano completo, com padrão de qualidade, política de tradução e critérios de
conclusão, está em **[SPEC.md](SPEC.md)**. O estado documento a documento fica
em **[ROADMAP.md](ROADMAP.md)**.

## Os sete níveis

```text
NÍVEL 01 — Fundamentos              Por que arquitetura existe?
        ↓
NÍVEL 02 — Design de Software       Como estruturar código e domínio?
        ↓
NÍVEL 03 — Design de Sistemas       Como ir de requisitos a um sistema?
        ↓
NÍVEL 04 — Sistemas Distribuídos    Por que sistemas distribuídos são difíceis?
        ↓
NÍVEL 05 — Arquitetura              Como as disciplinas se combinam?
        ↓
NÍVEL 06 — Arquitetura Corporativa  Como arquitetar acima de um sistema?
        ↓
NÍVEL 07 — Liderança em Arquitetura Como decidir e influenciar?
```

A progressão de competência correspondente:

```text
código → design → sistemas → sistemas distribuídos → arquitetura → corporativo → estratégia
```

## Para quem é

Engenheiro de Software com 3+ anos de experiência, confortável com uma linguagem
de backend, banco relacional e APIs HTTP, que já entregou software em produção e
agora precisa raciocinar sobre sistemas maiores que o próprio serviço.

Não é material para quem está começando a programar. Assume fluência em código.

## Idiomas

**pt-BR é o idioma canônico.** en-US é traduzido progressivamente e nunca bloqueia
a produção de conteúdo novo. Páginas ainda não traduzidas recaem no português.

O estado da tradução, documento a documento, está no [ROADMAP.md](ROADMAP.md).

## Rodando localmente

```bash
npm install
npm start                     # pt-BR em http://localhost:3000
npm start -- --locale en-US   # en-US
npm run build                 # build de produção, ambas as locales
npm run validate              # todos os validadores de conteúdo
npm run roadmap               # regenera as tabelas do ROADMAP.md
```

O servidor de desenvolvimento do Docusaurus constrói uma locale por vez; o build
de produção gera todas.

## Validação

O conteúdo é verificado automaticamente a cada PR — links e âncoras, schema de
front matter, grafo de pré-requisitos sem ciclo, paridade de tradução,
consistência terminológica e ausência de conteúdo incompleto marcado como pronto.

```bash
npm run validate
```

Os critérios estão em [SPEC.md §13](SPEC.md).

## Filosofia

Quinze princípios governam o material. Os que mais determinam o que entra e o
que não entra:

- **Arquitetura é sobre decisões e trade-offs.** Não existe arquitetura
  universalmente melhor; existe adequação a restrições.
- **Complexidade precisa ser justificada.** Distribuir só quando necessário.
- **Tecnologia serve à arquitetura, não a define.** O princípio vem primeiro; a
  ferramenta ilustra.
- **Documentação explica o porquê**, não só o quê.
- **Estudar decisões fracassadas** vale tanto quanto estudar as bem-sucedidas.

Na prática, isso significa que a maior parte dos documentos termina com uma
decisão **condicionada a restrições**, e não com uma recomendação. Material que
entrega conclusões sem as condições treina o hábito contrário ao que o percurso
desenvolve.

## O que você deve conseguir fazer ao final

Receber *"Projete a arquitetura de uma plataforma de pagamentos de alto volume"*
e, em vez de começar a desenhar caixas, percorrer:

```text
Qual é o problema de negócio?
        ↓
Quais são os requisitos funcionais?
        ↓
Quais atributos de qualidade importam, e com que número?
        ↓
Que restrições existem?
        ↓
Quais são as opções de arquitetura?
        ↓
Que trade-offs existem entre elas?
        ↓
Qual arquitetura cabe nas restrições?
        ↓
Como o sistema deve evoluir?
        ↓
Como comunico e defendo essa decisão?
```

## Como progredir

O percurso é linear por construção, mas ninguém entra no zero. O guia de
[como usar](docs/how-to-use.md) tem uma tabela de pontos de entrada por
experiência atual.

Para se localizar em capacidade — e não em conteúdo lido — use o
[modelo de maturidade](docs/maturity-model.md), que define seis estágios pela
decisão que a pessoa toma sozinha.

## Como contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para o padrão de escrita, o schema de
front matter, a política terminológica e o fluxo de tradução.

A regra que governa tudo: o material ensina raciocínio arquitetural, não
memorização. Contribuição que apresenta solução sem o problema, ou padrão sem
discutir quando não usá-lo, é rejeitada.

## Licença

Conteúdo sob [CC BY-SA 4.0](LICENSE). Código sob [MIT](LICENSE-CODE).
