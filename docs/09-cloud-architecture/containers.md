---
id: containers
title: Contêineres
sidebar_position: 4
description: Empacotar aplicação e dependências juntas — o que isso resolve de fato, e o que continua sendo seu problema.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor entende o que o contêiner isola e o que não isola, e
  constrói imagens que não viram passivo de segurança.
prerequisites: [cloud-architecture]
related: [kubernetes, serverless, cloud-compute]
canonical_for: [contêiner, imagem de contêiner, camada de imagem]
content_version: 1
last_reviewed: 2026-08-27
---

# Contêineres

## Visão Geral

Um contêiner empacota a aplicação com suas dependências — bibliotecas, binários,
configuração — num artefato imutável que roda igual em qualquer lugar que tenha o
tempo de execução.

Ele não é uma máquina virtual leve. É um processo do sistema operacional
hospedeiro, isolado por recursos do próprio núcleo. O núcleo é **compartilhado**, e
essa é a diferença que explica tanto a leveza quanto os limites de isolamento.

## Problema

"Funciona na minha máquina" é o sintoma de um problema real: a aplicação depende do
ambiente, e o ambiente varia entre a máquina do desenvolvedor, o servidor de teste
e a produção.

Versão de biblioteca do sistema, variável de ambiente, caminho de arquivo, versão
do tempo de execução — qualquer diferença muda o comportamento.

Contêiner resolve levando o ambiente junto. O artefato que passou nos testes é
literalmente o mesmo que roda em produção.

## Conceitos Centrais

### Processo isolado, não máquina

```text
máquina virtual     núcleo próprio, sistema completo, isolamento forte
                    inicia em dezenas de segundos, ocupa gigabytes
contêiner           núcleo compartilhado, só a aplicação e dependências
                    inicia em milissegundos, ocupa megabytes
```

A leveza vem de não replicar o sistema operacional. O custo vem do mesmo lugar: uma
falha de isolamento no núcleo atravessa contêineres.

Isso significa que **contêiner não é fronteira de segurança forte**. Para separar
cargas que não confiam umas nas outras, a fronteira precisa ser outra — máquina
virtual, ou tempos de execução que adicionam isolamento.

### A imagem é um empilhamento de camadas

Cada instrução de construção cria uma camada, e as camadas são compartilhadas entre
imagens.

Duas consequências práticas:

**A ordem importa para o cache.** Instruções que mudam raramente — instalar
dependências — devem vir antes das que mudam sempre — copiar o código. Invertido, a
reconstrução refaz tudo a cada alteração.

**Nada some de verdade.** Um arquivo apagado numa camada posterior continua na
anterior. Um segredo copiado e depois removido continua na imagem, recuperável por
quem tem a imagem.

O segundo ponto é a origem de vazamentos reais: chave privada, token, arquivo de
configuração com senha.

### Imutável é o ponto

Uma imagem construída não muda. Atualizar significa construir uma nova e
substituir, não alterar a que está rodando.

Isso é o que dá previsibilidade e o que torna reversão trivial: voltar é reimplantar
a imagem anterior.

E implica uma regra: **nada de mudança manual dentro do contêiner**. Uma correção
aplicada com acesso direto some no próximo reinício, e cria divergência que ninguém
rastreia.

### Estado precisa sair

Contêineres são efêmeros — podem ser recriados a qualquer momento, em qualquer nó.
O sistema de arquivos deles morre junto.

Estado que precisa sobreviver vai para volume externo, banco ou armazenamento de
objetos. Ver
[stateless](/05-system-design/stateless-vs-stateful.md).

Registros de aplicação escritos em arquivo dentro do contêiner são registros que se
perdem. Eles precisam ir para a saída padrão e ser coletados de fora.

### Imagem pequena não é estética

Uma imagem baseada num sistema completo carrega centenas de pacotes que a aplicação
não usa — e cada um é superfície de ataque e ruído para o verificador de
vulnerabilidades.

Construção em múltiplos estágios resolve: um estágio compila com todas as
ferramentas, e o estágio final copia apenas o binário para uma base mínima.

Imagens de 30 MB em vez de 900 MB significam implantação mais rápida, menos
armazenamento e uma lista de vulnerabilidades que alguém consegue de fato tratar.

### O que continua sendo seu problema

O contêiner empacota; ele não resolve:

**Vulnerabilidades das dependências.** A imagem congela as versões, inclusive as
vulneráveis. Sem reconstrução periódica e verificação, a imagem apodrece.

**Configuração por ambiente.** Ela entra por variável ou por montagem, e continua
sendo sua.

**Segredos.** Nunca na imagem — ver acima. Ver
[segurança](/10-security/index.md).

**Limites de recurso.** Sem limite de CPU e memória, um contêiner consome o nó
inteiro e derruba os vizinhos.

**Usuário não privilegiado.** O padrão é executar como administrador dentro do
contêiner, o que amplifica qualquer falha de isolamento.

## Modelo Mental

**Contêiner é um pacote com o ambiente junto, não uma máquina.** Ele resolve
consistência de ambiente; segurança e operação continuam sendo trabalho.

## Quando Usar

- Consistência entre ambientes importa.
- Implantação frequente, com reversão rápida.
- Várias linguagens ou versões convivendo.
- Empacotamento uniforme para orquestração. Ver
  [Kubernetes](/09-cloud-architecture/kubernetes.md).
- Isolamento de dependências entre serviços no mesmo nó.
- Ambientes de desenvolvimento reproduzíveis.

## Quando Não Usar

**Como fronteira de segurança entre cargas não confiáveis.**

**Para aplicação com estado no sistema de arquivos** sem volume externo.

**Quando a aplicação exige acesso profundo ao núcleo** ou a hardware específico.

**Para uma aplicação única e estável** numa máquina que ninguém toca — o benefício
não paga a mudança de ferramental.

**Com imagens que nunca são reconstruídas.** Vira passivo de segurança.

**Como sinônimo de modernização.** Empacotar um sistema mal desenhado produz um
sistema mal desenhado em contêiner.

## Alternativas

- **Máquina virtual** — isolamento forte, mais pesado.
- **Pacote do sistema operacional** — para aplicação única e estável.
- **[Serverless](/09-cloud-architecture/serverless.md)** — sem empacotamento nem capacidade.
- **Tempos de execução com isolamento reforçado** — quando se quer contêiner com
  fronteira de segurança mais próxima da máquina virtual.

## Trade-offs

| Contêiner | Máquina virtual |
|---|---|
| Inicia em milissegundos | Dezenas de segundos |
| Megabytes | Gigabytes |
| Núcleo compartilhado | Próprio |
| Isolamento mais fraco | Forte |
| Densidade alta | Baixa |
| Mesmo sistema base | Sistemas diferentes |

## Modos de Falha

**Segredo dentro da imagem.** Recuperável por quem a tem.

**Imagem antiga com vulnerabilidades.** Nunca reconstruída.

**Sem limite de recurso.** Um contêiner derruba o nó.

**Estado perdido no reinício.**

**Execução como administrador.** Amplifica qualquer falha.

**Imagem enorme.** Implantação lenta, superfície grande.

**Alteração manual dentro do contêiner.** Some no reinício.

**Etiqueta móvel em produção.** Apontar para a mais recente torna a implantação não
reproduzível — duas implantações da mesma referência podem rodar códigos
diferentes.

## Erros Comuns

**Copiar segredo para dentro da imagem.**

**Usar imagem base completa sem necessidade.**

**Não definir limites de recurso.**

**Não reconstruir periodicamente.**

**Rodar como administrador.**

**Usar etiqueta móvel** em vez de versão fixa ou digest.

## Exemplo Real

Uma empresa de serviços financeiros migrou 30 aplicações para contêineres. A
consistência entre ambientes melhorou de imediato — a classe de defeito "funciona em
teste, falha em produção" praticamente desapareceu.

Quatro problemas apareceram na primeira auditoria de segurança, um ano depois:

**Segredos em imagens.** Sete imagens continham chaves privadas ou tokens copiados
durante a construção e removidos numa camada posterior. Todos permaneciam
recuperáveis. As credenciais precisaram ser rotacionadas, e o registro de imagens
foi tratado como comprometido.

**Imagens sem reconstrução.** A imagem base de 22 das 30 aplicações não era
reconstruída havia mais de oito meses. A varredura encontrou centenas de
vulnerabilidades conhecidas, várias de gravidade alta, todas com correção
disponível havia meses.

**Execução privilegiada.** 26 das 30 rodavam como administrador dentro do
contêiner, por ser o padrão.

**Sem limites.** Nenhuma tinha limite de memória. Um vazamento numa aplicação
consumiu a memória de um nó e derrubou outras cinco que rodavam nele — um incidente
que tinha acontecido meses antes e sido diagnosticado como "problema de
infraestrutura".

As correções:

**Construção em múltiplos estágios** com base mínima. A imagem média caiu de 740 MB
para 90 MB, e a lista de vulnerabilidades ficou tratável.

**Segredos por injeção em tempo de execução**, nunca na construção. Verificação
automatizada que recusa imagens com padrões de segredo.

**Reconstrução semanal** de todas as imagens, automatizada.

**Usuário não privilegiado** obrigatório, verificado na esteira.

**Limites de CPU e memória** obrigatórios.

**Referência por digest** em produção, eliminando a etiqueta móvel.

O que a equipe aprendeu: a migração foi tratada como projeto de empacotamento —
"colocar em contêiner" — e terminou quando as aplicações rodavam. As práticas acima
não estavam no escopo porque ninguém as tinha listado como parte de adotar
contêineres.

## Conceitos Relacionados

- [Kubernetes](/09-cloud-architecture/kubernetes.md) — a orquestração.
- [Serverless](/09-cloud-architecture/serverless.md) — o modelo sem empacotamento.
- [Computação em Nuvem](/09-cloud-architecture/cloud-compute.md).
- [Segurança](/10-security/index.md).

## Exercício Prático

Pegue a imagem de produção do seu serviço e responda: quando ela foi construída
pela última vez, e quantas vulnerabilidades conhecidas ela tem hoje?

Depois verifique se ela roda como administrador e se tem limite de memória. Essas
três respostas costumam ser desconfortáveis.

## Perguntas de Entrevista

- Por que contêiner não é fronteira de segurança forte?
- Por que um segredo removido continua na imagem?
- Por que etiqueta móvel torna a implantação não reproduzível?

## Para Aprofundar

- Documentação de boas práticas de construção de imagens.
- Rice, Liz. *Container Security*. O'Reilly, 2020.
- Burns, Brendan et al. *Kubernetes: Up and Running*. 3ª ed. O'Reilly, 2022.
