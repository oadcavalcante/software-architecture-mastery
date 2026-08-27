---
id: supply-chain-trust
title: Confiança na Cadeia de Suprimentos
sidebar_position: 17
description: Você executa muito mais código de terceiros do que escreve — e o vetor que mais cresceu.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor controla o que entra no artefato e o que pode implantá-lo,
  com rastreabilidade do que roda em produção.
prerequisites: [security]
related: [secrets, least-privilege, containers]
canonical_for: [cadeia de suprimentos de software, inventário de dependências, assinatura de artefato, proveniência]
content_version: 1
last_reviewed: 2026-08-28
---

# Confiança na Cadeia de Suprimentos

## Visão Geral

O código que você escreve é uma fração pequena do que roda em produção. O resto vem
de dependências, imagens base, ferramentas de construção e da esteira que monta tudo.

Cada um desses é código de terceiros executando com os privilégios do seu sistema.

É o vetor que mais cresceu, e o menos coberto por controles tradicionais — porque
revisão de código, teste e varredura de vulnerabilidade olham o que você escreveu, não
o que você importou.

## Problema

Uma aplicação típica tem centenas ou milhares de dependências transitivas. Ninguém as
revisa.

E os pontos de comprometimento são vários:

```text
dependência           pacote malicioso, ou legítimo comprometido
imagem base           camadas que você não construiu
ferramenta de construção executa com acesso ao código e aos segredos
esteira               pode implantar qualquer coisa em produção
registro de artefatos o que é publicado é o que roda
```

O ponto que mais surpreende: **a esteira tem os privilégios de produção**. Quem
consegue alterar o que ela executa consegue implantar código arbitrário, sem tocar no
repositório da aplicação.

## Conceitos Centrais

### Os vetores de dependência

**Pacote malicioso publicado com nome parecido.** Erro de digitação instala o pacote
do atacante.

**Confusão de nomes.** Um pacote interno com o mesmo nome de um público — e o gerenciador
prefere o público, de versão maior.

**Mantenedor comprometido.** Um pacote legítimo, com milhões de instalações, publica
uma versão maliciosa.

**Transferência de manutenção.** O mantenedor original passa o projeto a alguém que
introduz código malicioso meses depois.

Os dois últimos são os difíceis: o pacote é legítimo, a origem é a esperada, e a
verificação de nome não ajuda.

### Fixar versão e verificar integridade

**Fixar por versão exata**, não por intervalo. Uma faixa aberta significa que a
construção de hoje pode trazer código diferente do de ontem.

**Arquivo de bloqueio versionado**, com resumo criptográfico de cada dependência. É o
que garante que a mesma versão traz o mesmo conteúdo.

**Construções reproduzíveis**, onde possível: a mesma entrada produz o mesmo artefato,
o que permite verificar independentemente.

Isso não impede uma dependência maliciosa — impede que ela **entre sem que ninguém
altere um arquivo revisado**.

### Inventário do que roda

Um inventário de componentes lista tudo o que compõe o artefato, com versões.

O valor prático aparece no dia em que uma vulnerabilidade grave é divulgada numa
biblioteca amplamente usada. A pergunta é imediata: **usamos isso, onde, e em qual
versão?**

Sem inventário, a resposta leva dias de busca manual — e costuma ficar incompleta,
porque a dependência é transitiva e não aparece em nenhum arquivo direto.

Com inventário, é uma consulta.

### Assinatura e proveniência

**Assinar artefatos** permite verificar que aquilo que vai rodar é o que foi
construído pela sua esteira.

**Proveniência** vai além: um registro verificável de quem construiu, a partir de qual
código-fonte, com quais entradas.

Isso fecha o caminho de alguém publicar um artefato no registro sem passar pela
esteira — que é um dos ataques mais eficazes, porque não deixa rastro no repositório.

A verificação precisa ser **obrigatória na implantação**. Assinar sem verificar é
cerimônia.

### A esteira é ambiente de produção

Vale repetir, porque muda a postura: a esteira tem acesso ao código, aos segredos e
ao ambiente produtivo.

Consequências:

**Menor privilégio.** Ver [menor privilégio](least-privilege.md). Uma esteira que
pode implantar em produção não deveria poder alterar políticas de acesso.

**Credenciais efêmeras.** Federação em vez de chave estática. Ver
[segredos](secrets.md).

**Isolamento entre execuções.** Uma execução de um ramo qualquer não deveria alcançar
segredos de produção.

**Aprovação para alterar a própria configuração.** Se qualquer pessoa pode alterar o
arquivo da esteira num ramo e vê-lo executar com privilégios, o controle de acesso ao
repositório é o controle de acesso à produção.

O último é o erro mais comum e o mais explorado.

### Atualizar é o controle contínuo

A maior parte dos comprometimentos por dependência não usa ataque sofisticado — usa
vulnerabilidade conhecida, com correção disponível há meses.

Isso torna a atualização regular mais eficaz que qualquer controle exótico. E ela
depende de duas coisas: automação que propõe as atualizações, e testes que dão
confiança para aceitá-las.

Times sem testes automatizados não atualizam, e acumulam risco por medo de quebrar.

## Modelo Mental

**Você executa o código de milhares de pessoas que não conhece.** O trabalho é saber
o que entrou, verificar que não mudou, e limitar o que ele alcança.

## Quando Usar

Controles se aplicam sempre. Prioridade quando:

- A aplicação tem muitas dependências.
- A esteira tem acesso a produção.
- Artefatos são publicados em registro compartilhado.
- Há requisito regulatório de rastreabilidade.
- O produto é distribuído a terceiros.

## Quando Não Usar

**Faixas abertas de versão.**

**Arquivo de bloqueio não versionado.**

**Assinatura sem verificação obrigatória.**

**Esteira com permissão de administrador.**

**Configuração de esteira alterável sem aprovação.**

**Bloquear tudo que a varredura aponta.** Sem contexto de exploração, o volume de
alertas paralisa — e o time passa a ignorar todos.

## Alternativas

- **Registro interno espelhado** — dependências aprovadas, sem buscar do público
  diretamente. Resolve confusão de nomes e dá controle sobre o que entra.
- **Imagens base mínimas** — menos componentes, menos superfície. Ver
  [contêineres](../09-cloud-architecture/containers.md).
- **Fixar por resumo criptográfico** em vez de por etiqueta.
- **Reduzir dependências** — a mais eficaz e a menos considerada. Uma biblioteca
  adicionada para uma função de três linhas traz sua árvore inteira.

## Trade-offs

| Controle rigoroso | Fluidez |
|---|---|
| Superfície conhecida | Desconhecida |
| Atrito para adicionar dependência | Nenhum |
| Atualização mais lenta | Imediata |
| Infraestrutura a manter | Nenhuma |

| Registro espelhado | Público direto |
|---|---|
| Controle do que entra | Nenhum |
| Resiste a confusão de nomes | Vulnerável |
| Operação adicional | Nenhuma |

## Modos de Falha

**Dependência maliciosa instalada.**

**Confusão de nomes.** Pacote interno substituído por público.

**Mantenedor comprometido.** Versão maliciosa de pacote legítimo.

**Esteira comprometida.** Implantação de código arbitrário.

**Artefato publicado sem passar pela esteira.**

**Vulnerabilidade conhecida não corrigida.** O caso mais comum.

**Alertas ignorados.** Volume alto sem priorização.

## Erros Comuns

**Faixas abertas de versão.**

**Não manter inventário.**

**Esteira com privilégio excessivo.**

**Permitir alteração da esteira sem aprovação.**

**Assinar sem verificar.**

**Não atualizar por falta de testes.**

## Exemplo Real

Uma empresa de tecnologia teve sua esteira de integração contínua comprometida.

O caminho: um colaborador externo abriu uma contribuição num repositório público da
empresa, alterando o arquivo de configuração da esteira. A execução automática de
verificação rodava a configuração do próprio ramo enviado — com acesso aos segredos de
produção, porque a esteira era única.

O código adicionado extraiu as credenciais e as enviou para fora. O incidente foi
detectado por um alerta de uso anômalo de credencial, três horas depois.

A auditoria seguinte encontrou:

**Esteira com permissão de administrador** na conta de produção. Ela podia criar
identidades e alterar políticas — muito além de implantar.

**Segredos de produção acessíveis** em execuções de ramos e de contribuições
externas.

**Sem verificação de assinatura** na implantação. Um artefato colocado no registro por
qualquer via seria implantado.

**Faixas abertas** de versão em quatro dos onze serviços.

**Sem inventário.** Uma vulnerabilidade divulgada dois meses antes numa biblioteca
comum tinha levado nove dias para ser mapeada — e o mapeamento estava incompleto.

As correções:

**Separação de esteiras.** Contribuições externas rodam numa esteira isolada, sem
segredos e sem acesso a nada produtivo.

**Configuração de esteira protegida.** Alterações nos arquivos de esteira exigem
aprovação de mantenedor, e a execução de contribuições externas usa a configuração do
ramo principal, não a enviada.

**Credenciais efêmeras por federação**, com escopo mínimo por serviço. A esteira
perdeu a permissão de alterar políticas.

**Assinatura e verificação obrigatória** na implantação. Artefato sem proveniência
válida é recusado.

**Versões fixas e arquivo de bloqueio** em todos os serviços.

**Inventário gerado a cada construção**, consultável. A vulnerabilidade seguinte foi
mapeada em minutos.

O que a equipe registra: o comprometimento não usou nenhuma vulnerabilidade de
software. Usou uma característica de configuração da esteira que estava documentada e
era conhecida — e que ninguém tinha avaliado como fronteira de confiança.

## Conceitos Relacionados

- [Segredos](secrets.md) — o que a esteira acessa.
- [Menor Privilégio](least-privilege.md) — o escopo da esteira.
- [Contêineres](../09-cloud-architecture/containers.md) — imagens base.
- [Fronteiras Seguras](secure-boundaries.md).

## Exercício Prático

Descubra o que a sua esteira pode fazer em produção. Não o que ela faz — o que ela
**pode**.

Depois verifique se uma contribuição externa consegue alterar a configuração dela e
executá-la. Se conseguir, o acesso ao repositório é o acesso à produção.

## Perguntas de Entrevista

- Por que a esteira deve ser tratada como ambiente de produção?
- O que assinatura e proveniência impedem que fixar versão não impede?
- Por que atualizar regularmente é mais eficaz que controles exóticos?

## Para Aprofundar

- SLSA — Supply-chain Levels for Software Artifacts.
- NIST SP 800-218 — Secure Software Development Framework.
- Torres-Arias, Santiago et al. *in-toto: Providing farm-to-table guarantees*, 2019.
