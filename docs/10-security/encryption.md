---
id: encryption
title: Criptografia
sidebar_position: 6
description: Em trânsito, em repouso e em uso — o que cada uma protege, e por que "está criptografado" não é resposta.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor sabe contra qual ameaça cada tipo de criptografia protege e
  reconhece quando ela não protege nada.
prerequisites: [security]
related: [key-management, network-security, data-protection]
canonical_for: [criptografia em trânsito, criptografia em repouso, cifra simétrica, cifra assimétrica]
content_version: 1
last_reviewed: 2026-08-28
---

# Criptografia

## Visão Geral

Criptografia protege dados contra quem não deveria lê-los. A pergunta que organiza
tudo é: **contra qual acesso?**

```text
em trânsito   contra quem observa a rede
em repouso    contra quem obtém o meio de armazenamento
em uso        contra quem tem acesso ao ambiente de execução
```

"Está criptografado" não é resposta, porque não diz qual dessas — e cada uma protege
contra uma ameaça diferente, deixando as outras abertas.

## Problema

A resposta reflexiva a um requisito de proteção é "vamos criptografar". Ela costuma
significar habilitar cifragem em repouso no armazenamento, o que é fácil e frequente.

Isso protege contra um cenário específico: alguém obtém fisicamente o disco. Num
ambiente de nuvem, esse cenário é remoto.

E não protege contra o cenário provável: uma credencial comprometida usa a aplicação
para ler os dados — e a aplicação decifra normalmente, porque é isso que ela faz.

O resultado é um requisito atendido no papel, sem redução de risco real.

## Conceitos Centrais

### Simétrica e assimétrica

**Simétrica.** Uma chave cifra e decifra. Rápida, adequada para volume. O problema é
distribuir a chave para quem precisa.

**Assimétrica.** Um par de chaves: a pública cifra, a privada decifra. Resolve
distribuição, e é ordens de grandeza mais lenta.

Na prática, os dois são combinados: a assimétrica estabelece uma chave simétrica, e o
volume é cifrado com ela. É como TLS funciona.

Uma terceira categoria, frequentemente confundida com criptografia: **funções de
resumo** são unidirecionais e não têm chave. Senhas não são criptografadas — elas
passam por uma função de derivação lenta, projetada para resistir a tentativas em
massa. Cifrar senha em vez de derivar é um erro clássico.

### Em trânsito

Protege contra observação e alteração na rede.

**TLS em tudo**, inclusive dentro da rede interna. A premissa de "a rede interna é
confiável" é a mesma que [confiança zero](/10-security/zero-trust.md) desmonta.

Dois pontos que costumam faltar:

**Verificação de certificado.** Desabilitá-la para "resolver" um erro anula a
proteção inteira — o canal fica cifrado com quem quer que esteja no meio.

**TLS mútuo** entre serviços, quando as duas pontas precisam se identificar. Ver
[malha de serviço](/08-integration-architecture/service-mesh.md).

### Em repouso, e o que ela realmente protege

Cifragem de disco e de armazenamento protege contra acesso ao meio físico e, na
nuvem, contra a leitura de um volume descartado.

Ela **não** protege contra: credencial da aplicação comprometida, consulta indevida,
vazamento por defeito de autorização, ou administrador com acesso legítimo.

Isso não a torna inútil — é requisito regulatório e defesa em profundidade barata.
Torna-a insuficiente como resposta a "como protegemos esses dados?".

### Cifragem no nível do campo é a que muda o cálculo

Cifrar campos específicos na aplicação, com chave separada, protege contra
exatamente o que a cifragem em repouso não protege: quem acessa o banco lê dados
cifrados.

O custo é real e precisa ser reconhecido:

**Não dá para consultar.** Buscar por um campo cifrado exige cifragem determinística
— que vaza padrão de repetição — ou índice separado.

**Ordenação e comparação** deixam de funcionar.

**A chave precisa ser gerenciada** fora do banco. Ver
[gestão de chaves](/10-security/key-management.md).

Por isso ela é aplicada seletivamente, aos campos que justificam: documento, dados de
saúde, credenciais de terceiros.

### Cifragem por titular resolve o apagamento

Uma aplicação específica e poderosa: cifrar os dados de cada titular com uma chave
própria.

Apagar os dados dessa pessoa passa a ser **descartar a chave** — o registro
permanece, e o conteúdo fica irrecuperável.

Isso resolve o conflito entre imutabilidade e direito ao apagamento em
[event sourcing](/06-distributed-systems/distributed-event-sourcing.md) e em
armazenamentos de arquivos imutáveis. Ver
[ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

Precisa ser projetado desde o início; retroagir exige reescrever o histórico.

### Não implemente

A regra mais importante e a mais violada sob pressão:

**Use bibliotecas maduras e algoritmos padronizados.** Não invente esquema, não
combine primitivas por conta, não use modos de operação sem entender suas exigências.

Os erros são sutis e silenciosos: um vetor de inicialização reutilizado, um modo sem
autenticação, uma comparação que vaza tempo. O sistema funciona, os testes passam, e
a proteção não existe.

Prefira construções que dificultam o erro — cifragem autenticada, bibliotecas de alto
nível com poucas opções.

## Modelo Mental

**Criptografia protege contra um acesso específico.** Nomeie qual, ou você não sabe
o que está protegendo.

## Quando Usar

- **Em trânsito:** sempre, inclusive interno.
- **Em repouso:** sempre que disponível — é barato.
- **No campo:** para dados sensíveis, quando o acesso ao banco é ameaça real.
- **Por titular:** quando há requisito de apagamento em armazenamento imutável.
- **Assimétrica:** quando as partes não compartilham segredo previamente.

## Quando Não Usar

**Como resposta genérica** a um requisito de proteção, sem nomear a ameaça.

**Para senhas.** Use função de derivação.

**Cifragem no campo em tudo.** Consultas param de funcionar.

**Cifragem determinística** sem entender o que ela vaza.

**Implementação própria.**

**Com verificação de certificado desabilitada.**

**Quando o problema é autorização.** Criptografia não conserta permissão errada —
e é frequentemente adotada como se fosse.

## Alternativas

Para proteger dados sem cifrar:

- **Não coletar.** Ver [proteção de dados](/10-security/data-protection.md).
- **Tokenização** — substituir o dado por uma referência, guardando o original em
  um cofre separado. Comum para dados de cartão.
- **Pseudonimização** — remover identificadores diretos.
- **Autorização adequada** — frequentemente o controle que de fato faltava.

## Trade-offs

| Cifragem no campo | Em repouso |
|---|---|
| Protege contra acesso ao banco | Só contra acesso ao meio |
| Consulta e ordenação quebram | Transparente |
| Chave gerenciada pela aplicação | Pela plataforma |
| Custo de processamento | Desprezível |
| Aplicada seletivamente | Tudo de uma vez |

| Cifragem autenticada | Só confidencialidade |
|---|---|
| Detecta alteração | Não detecta |
| Padrão recomendado | Legado |

## Modos de Falha

**Verificação de certificado desabilitada.**

**Chave junto do dado.** Cifrar e guardar a chave no mesmo lugar não protege nada.

**Vetor de inicialização reutilizado.** Vaza informação sobre o conteúdo.

**Cifragem determinística revelando padrão.** Valores iguais produzem cifras iguais.

**Modo sem autenticação.** Permite alteração não detectada.

**Chave perdida.** Dado irrecuperável — o modo de falha oposto e igualmente grave.

**Requisito atendido sem risco reduzido.** Cifragem em repouso contra uma ameaça de
credencial comprometida.

## Erros Comuns

**Não nomear a ameaça.** Criptografia em repouso protege contra disco roubado e cópia de backup vazada; não protege contra credencial comprometida, que é a via mais comum. Sem nomear a ameaça, cifra-se o que não estava em risco.

**Cifrar senha em vez de derivar.** Cifrar é reversível — quem obtém a chave obtém todas as senhas. Senha exige função de derivação lenta e com sal, que não tem volta.

**Guardar a chave junto do dado.** A chave no mesmo banco, no mesmo servidor ou no mesmo repositório anula a criptografia: quem alcança um alcança o outro.

**Implementar o esquema.** Criptografia falha em detalhes — reuso de vetor de inicialização, comparação suscetível a tempo, modo sem autenticação. Bibliotecas revisadas existem justamente porque esses erros não são visíveis em teste.

**Desabilitar verificação de certificado.** Feita para destravar um ambiente de desenvolvimento, ela sobrevive até produção — e transforma o canal cifrado em canal cifrado com quem quer que esteja no meio.

**Tratar criptografia como substituta de autorização.** Dado cifrado em repouso é devolvido decifrado para quem a aplicação deixa consultar. Se a autorização está errada, a criptografia não impede nada.

## Exemplo Real

Uma operadora de saúde precisava atender a um requisito regulatório de proteção de
dados de pacientes.

A resposta inicial: habilitar cifragem em repouso em todos os bancos e
armazenamentos. Feito em duas semanas, requisito marcado como atendido.

Dezoito meses depois, um incidente: uma credencial de aplicação vazou por um registro
de erro, e foram extraídos dados de 40 mil pacientes.

A cifragem em repouso não teve nenhum efeito. A aplicação decifrava os dados
normalmente — é isso que ela faz — e a credencial permitia usá-la.

A revisão posterior mudou a abordagem, começando por nomear as ameaças:

```text
ameaça                              controle adequado
disco descartado                    cifragem em repouso ✓ já existia
observação de rede                  TLS ✓ já existia
credencial da aplicação vazada      cifragem no campo + menor privilégio
administrador de banco curioso      cifragem no campo + auditoria
solicitação de apagamento           cifragem por titular
```

As duas últimas linhas não tinham nenhum controle.

O que foi implementado:

**Cifragem no nível do campo** para documento, diagnóstico e resultado de exame, com
chaves gerenciadas fora do banco. A busca por documento passou a usar um índice
separado com resumo, em vez de consulta direta.

**Cifragem por titular** para os dados de saúde, permitindo apagamento por descarte
de chave — o que resolveu um requisito regulatório que estava pendente havia dois
anos.

**Escopo reduzido** da credencial de aplicação, com acesso apenas às tabelas
necessárias. Ver [menor privilégio](/10-security/least-privilege.md).

**Auditoria** de acesso a dados sensíveis, com alerta de volume anômalo.

**Filtro de registros** para não gravar credenciais.

O ponto que a equipe sublinha: o requisito regulatório dizia "os dados devem ser
criptografados", e eles atenderam literalmente. A pergunta que ninguém fez — "contra
quem?" — teria mudado a resposta inteira, com o mesmo orçamento.

## Conceitos Relacionados

- [Gestão de Chaves](/10-security/key-management.md) — sem ela, criptografia não funciona.
- [Proteção de Dados](/10-security/data-protection.md) — as alternativas a cifrar.
- [Segurança de Rede](/10-security/network-security.md) — cifragem em trânsito.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md).

## Exercício Prático

Para cada tipo de dado sensível do seu sistema, escreva contra qual acesso ele está
protegido — e contra qual não está.

A coluna da direita costuma incluir "credencial da aplicação comprometida", que é o
cenário mais provável.

## Perguntas de Entrevista

- Contra o que cifragem em repouso protege, e contra o que não protege?
- Por que senhas não são criptografadas?
- Como cifragem por titular resolve apagamento em armazenamento imutável?

## Para Aprofundar

- Ferguson, Niels; Schneier, Bruce; Kohno, Tadayoshi. *Cryptography Engineering*.
  Wiley, 2010.
- NIST SP 800-175B — diretrizes de uso de criptografia.
- OWASP. *Cryptographic Storage Cheat Sheet*.
