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

**Fase F0 — fundação técnica concluída.** A estrutura, o build bilíngue, os
validadores e o pipeline de publicação estão no lugar. O conteúdo dos sete
níveis ainda não foi escrito.

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

## Licença

Conteúdo sob [CC BY-SA 4.0](LICENSE). Código sob [MIT](LICENSE-CODE).
