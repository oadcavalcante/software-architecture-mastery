---
id: file-storage
title: Armazenamento de Arquivos
sidebar_position: 16
description: Onde os arquivos moram — e por que o banco e o disco local são as duas respostas erradas.
doc_type: concept
level: 3
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor escolhe onde armazenar arquivos e projeta upload e
  download sem passar bytes pela aplicação.
prerequisites: [state-management]
related: [cdn, stateless-vs-stateful, cloud-storage]
canonical_for: [armazenamento de arquivos, upload, armazenamento de objetos]
content_version: 1
last_reviewed: 2026-08-27
---

# Armazenamento de Arquivos

## Visão Geral

Sistemas precisam guardar arquivos: documentos, imagens, anexos, exportações.

Duas respostas aparecem primeiro e ambas cobram caro depois: **guardar no banco**
e **guardar no disco local**.

## Problema

Arquivos têm propriedades diferentes de registros: são grandes, imutáveis na
maior parte dos casos, acessados por identificador, e servidos diretamente ao
cliente.

Tratá-los como registro — no banco — ou como estado de processo — no disco local —
ignora isso.

**No banco:** o backup incha, a replicação fica lenta, o cache do banco é ocupado
por bytes que ninguém consulta, e cada leitura passa por conexão de banco. Um
banco de 200 GB dos quais 180 são PDFs é um problema de operação que não precisava
existir.

**No disco local:** o arquivo só existe naquela instância. Escalar
horizontalmente quebra, reiniciar em contêiner perde, e o backup vira
responsabilidade de quem cuida da máquina. Ver
[sem estado vs. com estado](/05-system-design/stateless-vs-stateful.md).

A resposta usual é **armazenamento de objetos**: um serviço que guarda blobs por
chave, com durabilidade, e serve diretamente por HTTP.

## Conceitos Centrais

### Metadado no banco, bytes no armazenamento

A divisão que resolve quase tudo:

```text
banco:            arquivos(id, nome, tipo, tamanho, dono, criado_em, chave)
armazenamento:    chave → bytes
```

O banco guarda o que precisa ser consultado, filtrado e relacionado. O
armazenamento guarda o que precisa ser servido.

Isso mantém o banco pequeno e permite servir arquivos sem passar pela aplicação.

### Os bytes não devem passar pela aplicação

O erro de arquitetura mais comum nesta área: o cliente envia o arquivo para a
aplicação, que o repassa ao armazenamento. E na leitura, a aplicação busca e
repassa.

Isso consome memória, banda e conexão da aplicação para transportar bytes que ela
não usa. Um upload de 500 MB ocupa um processo inteiro durante a transferência.

A alternativa é **URL assinada**: a aplicação gera uma URL temporária com
permissão específica, e o cliente fala direto com o armazenamento.

```text
1. cliente pede permissão de upload
2. aplicação valida, cria o metadado, devolve URL assinada com prazo
3. cliente envia direto para o armazenamento
4. armazenamento notifica, ou o cliente confirma
5. aplicação marca o metadado como disponível
```

A aplicação decide e autoriza; ela não transporta.

Para download, o mesmo: URL assinada com prazo curto, servida por
[CDN](/05-system-design/cdn.md) quando o conteúdo é público.

### O ciclo de vida precisa ser decidido

Arquivos acumulam. Três decisões:

**Retenção.** Por quanto tempo guardar. Frequentemente há exigência regulatória, e
frequentemente ninguém perguntou.

**Classe de armazenamento.** Acesso frequente custa mais por mês; acesso raro custa
menos e cobra na recuperação. Mover automaticamente por idade reduz custo
significativamente em acervos grandes.

**Órfãos.** Um upload iniciado e não confirmado deixa bytes sem metadado. Sem
limpeza, eles acumulam e ninguém sabe que existem.

### Imutabilidade simplifica

Tratar arquivos como imutáveis — nova versão é uma chave nova — elimina uma classe
de problemas: cache pode ser eterno, não há corrida entre leitura e escrita, e o
histórico existe de graça.

É a mesma razão pela qual [CDN](/05-system-design/cdn.md) funciona melhor com URL versionada.

## Modelo Mental

**A aplicação decide quem pode e registra o que existe. Os bytes viajam por fora.**

## Quando Usar

Armazenamento de objetos quando:
- Há arquivos de usuário — anexos, imagens, documentos.
- O volume cresce.
- Os arquivos são servidos ao cliente.
- A aplicação escala horizontalmente.

Disco local quando:
- É temporário, dentro de uma operação.
- É cache, e a perda é aceitável.

Banco quando:
- O arquivo é pequeno e sempre lido junto com o registro — uma assinatura, um
  ícone.
- A transacionalidade com o registro é requisito real.

## Quando Não Usar

**Banco para arquivo grande.** Backup, replicação e cache pagam por isso.

**Disco local com múltiplas instâncias.** O arquivo só existe numa.

**Passar bytes pela aplicação.** Desperdício de recurso.

**Sem política de retenção.** O acervo cresce indefinidamente, e o custo com ele.

**URL assinada com prazo longo.** Uma URL de 7 dias é um link público por 7 dias —
quem receber, acessa.

## Alternativas

- **Armazenamento de objetos** — a resposta padrão.
- **Sistema de arquivos em rede** — quando o acesso precisa parecer disco local;
  mais caro e com mais modos de falha.
- **Banco, para blobs pequenos** — legítimo abaixo de alguns kilobytes.
- **Não armazenar** — gerar sob demanda, quando o custo de gerar é menor que o de
  guardar.

## Trade-offs

| Armazenamento de objetos | Banco de dados |
|---|---|
| Banco pequeno e rápido | Cresce com os arquivos |
| Servido direto ao cliente | Passa pela aplicação |
| Custo por GB baixo | Alto |
| Sem transação com o registro | Transacional |
| Metadado e bytes podem divergir | Sempre consistentes |
| Mais um componente | Nenhum |

A quinta linha é o custo real: como são dois sistemas, um pode ter o que o outro
não tem — metadado sem bytes, ou bytes sem metadado. Isso precisa de limpeza
periódica.

## Modos de Falha

**Órfãos.** Bytes sem metadado, acumulando.

**Metadado sem bytes.** O registro existe, o download falha.

**URL assinada vazada.** Prazo longo transforma em link público.

**Upload não confirmado.** O cliente envia e nunca confirma; o arquivo fica em
limbo.

**Sem limite de tamanho.** Um upload de 10 GB que ninguém previu.

**Custo silencioso.** O acervo cresce e a fatura junto, sem que ninguém monitore.

## Erros Comuns

**Guardar arquivo grande no banco.**

**Transportar bytes pela aplicação.**

**Não definir retenção.**

**Prazo longo em URL assinada.**

**Não validar tipo e tamanho antes de autorizar o upload.**

**Confiar no nome do arquivo enviado.** É entrada do usuário e pode conter caminho
relativo.

## Exemplo Real

Um sistema de gestão documental guardava PDFs no banco, como coluna binária.

Depois de três anos, o banco tinha 340 GB — 310 deles em PDFs. As consequências:

O backup completo levava 6 horas e o restore, 9. O objetivo de tempo de
recuperação era de 2 horas, e ninguém tinha testado.

A réplica de leitura ficava minutos atrás nos horários de upload intenso.

E cada download consumia uma conexão de banco por vários segundos, porque a
aplicação lia o blob e repassava.

A migração moveu os bytes para armazenamento de objetos, mantendo no banco apenas
os metadados. O banco caiu para 28 GB; o backup, para 20 minutos.

Duas decisões que a equipe registrou como mais importantes que a migração em si.

**Upload direto por URL assinada.** A aplicação valida tipo, tamanho e permissão,
cria o metadado com estado "aguardando", e devolve uma URL de 15 minutos. O
cliente envia direto. Um evento do armazenamento confirma e o metadado vira
"disponível".

Isso removeu completamente o tráfego de arquivo da aplicação, e o consumo de
memória dos processos caiu pela metade.

**Rotina de reconciliação semanal.** Ela compara metadados e objetos, e reporta as
duas divergências: metadado sem objeto — que vira alerta, porque é perda — e
objeto sem metadado por mais de 24 horas — que é órfão de upload abandonado e é
removido.

Na primeira execução, encontrou 12 mil órfãos acumulados em três anos, de uploads
que falharam no meio. Ninguém sabia que existiam.

## Conceitos Relacionados

- [Gestão de Estado](/05-system-design/state-management.md) — arquivos como estado persistente.
- [CDN](/05-system-design/cdn.md) — servir arquivos públicos na borda.
- [Sem Estado vs. Com Estado](/05-system-design/stateless-vs-stateful.md) — por que disco local
  quebra.
- [Nuvem](/09-cloud-architecture/index.md) — classes de armazenamento e custo.

## Exercício Prático

Verifique onde seu sistema guarda arquivos. Se for no banco, meça quanto do
tamanho total eles ocupam e quanto tempo leva o restore.

Se for em armazenamento de objetos, verifique: existe reconciliação entre
metadado e objeto? Qual o prazo das URLs assinadas?

## Perguntas de Entrevista

- Por que arquivos grandes no banco são um problema?
- O que é URL assinada e qual problema ela resolve?
- Como um arquivo órfão surge e como detectá-lo?

## Para Aprofundar

- Kleppmann, Martin. *Designing Data-Intensive Applications*. O'Reilly, 2017.
- Documentação de URLs pré-assinadas dos principais provedores de armazenamento de
  objetos.
