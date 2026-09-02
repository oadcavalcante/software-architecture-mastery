---
id: file-integration
title: Integração por Arquivo
sidebar_position: 8
description: O transporte mais antigo e mais usado entre organizações — e o que ele exige para ser confiável.
doc_type: concept
level: 5
difficulty: intermediário
status: complete
objective: >
  Ao terminar, o leitor projeta trocas por arquivo com as garantias que faltam por
  padrão: atomicidade, deduplicação e detecção de ausência.
prerequisites: [batch-integration]
related: [batch-integration, integration-contracts, data-lifecycle]
canonical_for: [integração por arquivo, arquivo de controle, escrita atômica]
content_version: 2
last_reviewed: 2026-08-27
---

# Integração por Arquivo

## Visão Geral

Trocar arquivos é a forma mais antiga de integração entre sistemas, e continua
sendo a mais comum entre organizações diferentes.

Bancos, operadoras, governo, seguradoras, folha de pagamento — a maior parte do
volume corporativo trafega como arquivo depositado em algum lugar.

Ela é subestimada porque parece primitiva. Ela é primitiva, e é a que exige menos
das duas pontas: nenhuma precisa expor endpoint nem manter disponibilidade síncrona
para a outra — basta um protocolo de transferência e um formato acordado.

## Problema

Duas organizações que não podem — por regulação, por política, por incompatibilidade
tecnológica — expor APIs uma à outra ainda precisam trocar dados.

Arquivo resolve com o mínimo de acoplamento possível: um formato, um local, uma
periodicidade. Nenhuma das pontas precisa saber nada sobre a tecnologia da outra.

O preço é que **nenhuma garantia vem junto**. Não há entrega confirmada, não há
transação, não há esquema validado, não há detecção de duplicata. Tudo isso
precisa ser construído sobre a troca — e é o que separa integração por arquivo
confiável de fonte permanente de incidente.

## Conceitos Centrais

### Escrita atômica: o problema número um

Quem lê pode começar a ler enquanto quem escreve ainda está escrevendo. O
resultado é um arquivo processado pela metade — e a metade parece completa.

A solução é universal e simples:

```text
1. escrever em nome temporário    dados.csv.tmp
2. fechar o arquivo
3. renomear para o nome final     dados.csv
```

A renomeação é atômica na maioria dos sistemas de arquivo. O leitor nunca vê um
arquivo parcial.

A alternativa, quando a renomeação não é atômica: um **arquivo de controle**
escrito depois, e o leitor só processa quando ele existe.

Este é o defeito mais comum e o mais fácil de evitar da categoria.

### O nome do arquivo é parte do contrato

```text
PAGAMENTOS_20260827_001.csv
└─ tipo    └─ data   └─ sequência
```

O nome carrega informação que o processamento precisa: o que é, de quando, e qual
a ordem. Sem sequência, dois arquivos do mesmo dia são ambíguos.

E o nome é o que permite **deduplicar**: processar o mesmo arquivo duas vezes é o
segundo defeito mais comum, e um registro de arquivos já processados resolve.

### Detectar ausência é tão importante quanto processar

Um arquivo que não chega não gera erro. O processo simplesmente não roda, e
ninguém sabe.

O contrato precisa dizer **quando** o arquivo chega, e precisa haver alerta se ele
não chegar. Ver [integração em lote](/08-integration-architecture/batch-integration.md).

Times que só monitoram falha de processamento descobrem a ausência dias depois,
pela reclamação de quem esperava o efeito.

### Contagem e totais de conferência

Um arquivo truncado na transferência continua sendo um arquivo válido. As linhas
que chegaram estão bem formadas; as que faltam simplesmente não estão lá.

A defesa é um rodapé ou um arquivo de controle com a contagem de registros e a
soma dos valores. O leitor confere antes de processar.

Isso detecta o que muda a contagem ou o campo somado: truncamento e a linha perdida
num filtro intermediário. Não detecta corrupção fora do campo somado — o Exemplo Real
deste documento traz um caso que rodou três semanas com contagem e soma batendo. Para
essa classe, a defesa é validação de esquema e de codificação na entrada.

### Formato: o texto delimitado é traiçoeiro

CSV parece trivial e não é. Delimitador dentro do campo, quebra de linha dentro do
campo, aspas, codificação de caracteres, formato de data, separador decimal.

Cada um desses já derrubou integrações reais. O contrato precisa fixar todos
explicitamente — inclusive a codificação, que é a causa mais frequente de "os
acentos vieram errados".

Formatos com esquema declarado evitam a maior parte disso, e nem sempre a outra
ponta os aceita.

### Ordem e reprocessamento

Arquivos podem chegar fora de ordem — uma retransmissão de ontem chegando depois
da de hoje. O processamento precisa usar a data do nome, não a de chegada.

E o reprocessamento precisa ser possível: guardar os arquivos originais, com
retenção definida, é o que permite corrigir um defeito de processamento sem pedir
o arquivo de volta.

### Dados sensíveis em trânsito e em repouso

Arquivos ficam parados em diretórios, frequentemente por meses, frequentemente com
dados pessoais.

Criptografia em trânsito é o mínimo. Criptografia em repouso, controle de acesso
ao diretório e retenção definida são o que costuma faltar. Ver
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

## Modelo Mental

**Arquivo é o transporte com o menor acoplamento e a menor garantia.** Tudo que
outros estilos dão de graça, aqui você constrói.

## Quando Usar

- As organizações não podem expor APIs uma à outra.
- O parceiro só oferece esse canal — bancos, governo, operadoras.
- Volume alto com periodicidade definida.
- Requisito regulatório de arquivo em formato específico.
- A integração precisa funcionar sem dependência tecnológica comum.
- Carga inicial de migração.

## Quando Não Usar

**Quando a latência importa.** O ciclo é de horas.

**Internamente, quando há alternativa.** Ver
[mensageria](/08-integration-architecture/messaging-integration.md).

**Sem escrita atômica.** Arquivos parciais processados.

**Sem deduplicação por nome.**

**Sem detecção de ausência.**

**Sem contagem de conferência.** Truncamento invisível.

**Para registros que precisam de tratamento individual e imediato.**

## Alternativas

- **[Mensageria](/08-integration-architecture/messaging-integration.md)** — internamente, ou quando o parceiro
  aceita.
- **API de leitura paginada** — o parceiro busca em vez de receber; elimina
  entrega e ausência.
- **[Webhooks](/08-integration-architecture/webhooks.md)** — para notificar mudanças individuais.
- **Armazenamento de objetos com notificação de evento** — arquivo como
  transporte, com aviso de chegada. Combina o alcance do arquivo com a reação
  imediata.

A última opção é o desenho moderno para quem controla os dois lados: o arquivo
continua sendo o dado, e a chegada dele vira evento.

## Trade-offs

| Arquivo | API |
|---|---|
| Acoplamento mínimo | Tecnologia compartilhada |
| Nenhuma garantia nativa | Contrato, erro, retentativa |
| Volume alto barato | Custo por registro |
| Latência de horas | Segundos |
| Nenhuma ponta expõe endpoint | As duas precisam estar de pé |
| Dados parados em repouso | Em trânsito apenas |

## Modos de Falha

**Arquivo parcial processado.** Escrita não atômica.

**Arquivo processado duas vezes.**

**Arquivo ausente sem alerta.**

**Truncamento silencioso.** Sem contagem de conferência.

**Codificação errada.** Acentos corrompidos em todo o conjunto.

**Ordem de chegada diferente da ordem lógica.**

**Diretório crescendo indefinidamente.** Sem retenção.

**Dado pessoal parado sem criptografia nem controle de acesso.**

## Erros Comuns

**Não escrever de forma atômica.** O consumidor encontra o arquivo pela metade e processa dados truncados. Escrever com nome temporário e renomear ao final elimina a janela.

**Não registrar arquivos já processados.** Um reenvio da origem ou uma releitura após falha reprocessa o mesmo conteúdo, e o efeito duplica.

**Não alertar sobre ausência.** O arquivo que não chegou não gera erro em lugar nenhum. A verificação precisa ser pela expectativa — devia ter chegado até as 6h e não chegou.

**Não conferir contagem e totais.** Transferência truncada produz arquivo sintaticamente válido com menos registros. Sem conferir o rodapé contra o processado, a perda é silenciosa.

**Não fixar codificação e formato de data no contrato.** É onde a integração por arquivo quebra na prática: acento vira caractere inválido e 03/04 é lido como quatro de março de um lado e três de abril do outro.

**Não definir retenção nem apagar os arquivos processados.** O diretório cresce até a listagem ficar lenta, e a varredura para achar o que é novo passa a custar mais que o processamento.

## Exemplo Real

Uma operadora de planos de saúde recebia diariamente um arquivo de movimentação de
beneficiários de 40 empresas clientes, por transferência de arquivos.

Cinco categorias de incidente ao longo de três anos:

**Arquivos parciais.** Doze das 40 empresas escreviam direto no nome final. O
processamento noturno às vezes pegava o arquivo pela metade. Beneficiários ficavam
sem inclusão, e a descoberta vinha do beneficiário tentando usar o plano. Corrigido
exigindo escrita temporária mais renomeação, ou arquivo de controle — o que a
empresa preferisse.

**Reprocessamento duplicado.** Uma empresa reenviava o arquivo quando tinha dúvida
se havia enviado. Sem registro de processados, as movimentações eram aplicadas de
novo. Cerca de 200 duplicações por mês, tratadas manualmente.

**Truncamento.** Um arquivo de 12 mil linhas chegou com 8 mil, por falha na
transferência. As 8 mil eram válidas. Quatro mil beneficiários não foram
processados, e ninguém soube por 11 dias. Passou a haver rodapé com contagem e
soma de conferência, e o processamento passou a recusar arquivos que não batem.

**Codificação.** Uma empresa mudou o sistema de origem e passou a enviar em outra
codificação. Todos os nomes com acento foram gravados corrompidos por três
semanas. O contrato não fixava codificação; passou a fixar, com validação na
entrada.

**Arquivos acumulados.** O diretório tinha três anos de arquivos com CPF, nome e
dados de saúde de beneficiários — em texto plano, com permissão ampla, porque
ninguém tinha definido retenção. Encontrado numa auditoria. Passou a haver
criptografia em repouso, acesso restrito e retenção de 90 dias, com arquivamento
cifrado para o que a regulação exige guardar.

Na retrospectiva: nenhuma dessas correções é sofisticada. Todas são
mecânica conhecida de integração por arquivo, documentada há décadas. Elas não
existiam porque a integração era tratada como "coisa simples, é só ler um CSV" — e
por isso nunca recebeu projeto.

## Conceitos Relacionados

- [Integração em Lote](/08-integration-architecture/batch-integration.md) — o processamento.
- [Contratos de Integração](/08-integration-architecture/integration-contracts.md) — formato e periodicidade.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md) — retenção.
- [Idempotência](/06-distributed-systems/idempotency.md).

## Exercício Prático

Pegue uma troca de arquivo do seu sistema e verifique três coisas: a escrita é
atômica, existe registro de arquivos já processados, e existe alerta se o arquivo
não chegar.

Se alguma faltar, ela é um incidente que ainda não aconteceu.

## Perguntas de Entrevista

- Por que escrever direto no nome final é um defeito?
- O que uma contagem de conferência detecta que nada mais detecta?
- Por que detectar ausência de arquivo é diferente de detectar falha?

## Para Aprofundar

- Hohpe, Gregor; Woolf, Bobby. *Enterprise Integration Patterns*.
  Addison-Wesley, 2003 — *File Transfer*.
- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017 —
  capítulo 10.
- RFC 4180 — formato de arquivos de valores separados por vírgula.
