---
id: cost-architecture
title: Arquitetura de Custo
sidebar_position: 14
description: Na nuvem, o desenho tem preço mensal — e ele é um atributo de qualidade como qualquer outro.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor estima o custo de uma decisão de arquitetura antes de
  implementá-la, e reconhece os desperdícios estruturais.
prerequisites: [cloud-architecture]
related: [managed-services, serverless, cloud-storage]
canonical_for: [arquitetura de custo, custo por transação, desperdício estrutural]
content_version: 1
last_reviewed: 2026-08-27
---

# Arquitetura de Custo

## Visão Geral

Numa infraestrutura própria, a máquina já foi comprada: um desenho ineficiente
consome capacidade ociosa e não muda a fatura.

Na nuvem, cada requisição, cada gigabyte transferido, cada segundo de execução e
cada byte armazenado aparecem na conta do mês seguinte.

Isso torna custo um **atributo de qualidade** como latência ou disponibilidade —
algo que se projeta, se mede e se degrada quando ninguém olha. Ver
[atributos de qualidade](/01-fundamentals/quality-attributes.md).

## Problema

O custo de nuvem é tratado como assunto financeiro: alguém olha a fatura no fim do
mês, acha alta, e pede para "otimizar".

A otimização que se segue costuma ser tática — reduzir uma instância, apagar
volumes órfãos — e recupera uma fração. O custo volta a crescer no trimestre
seguinte.

Porque a maior parte do custo não vem de configuração. Vem de **decisões de
arquitetura**: quantas chamadas uma operação faz, por onde os dados trafegam, o
que é guardado e por quanto tempo, quanta capacidade fica ligada esperando.

Essas decisões são tomadas por engenheiros que não veem a fatura.

## Conceitos Centrais

### As dimensões cobradas

```text
computação      por segundo ou hora, por tamanho de instância
armazenamento   por gigabyte-mês, por classe de acesso
transferência   por gigabyte — entre zonas, entre regiões, para a internet
requisições     por operação, em armazenamento de objetos, filas, funções
gerenciados     por unidade de capacidade provisionada
operações       consultas, invocações, verificações de saúde
```

A terceira e a quarta são as que surpreendem, porque não têm equivalente óbvio na
infraestrutura própria — e são as que crescem com o tráfego, invisivelmente.

### A métrica que importa é custo por unidade de negócio

Custo total sobe quando a empresa cresce, o que é esperado. O que revela problema é
**custo por transação**, por usuário ativo, por pedido processado.

Se o custo total dobra e o número de pedidos dobra, está tudo bem. Se o custo dobra
e os pedidos crescem 20%, a arquitetura piorou.

Essa métrica raramente existe, e sem ela não há como distinguir crescimento
saudável de degradação.

### Os desperdícios estruturais

Os que aparecem em quase todo ambiente, por ordem de frequência:

**Capacidade ociosa em horário não útil.** Ambientes de desenvolvimento e teste
ligados 24 horas para uso de 8. Dois terços desperdiçados por definição.

**Superdimensionamento.** Instâncias escolhidas por precaução e nunca revistas. O
padrão é utilização entre 5% e 15%.

**Transferência desnecessária.** Tráfego cruzando zonas por falta de preferência de
roteamento. Ver [zonas de disponibilidade](/09-cloud-architecture/availability-zones.md).

**Dados sem política de retenção.** Registros e cópias acumulando indefinidamente.
Ver [ciclo de vida do dado](/07-data-architecture/data-lifecycle.md).

**Recursos órfãos.** Volumes de instâncias apagadas, endereços IP reservados,
imagens antigas. Ninguém os vê porque não têm dono.

**Consultas excessivas.** Uma tela que faz 40 chamadas em vez de 3.

**Classe de armazenamento errada.** Dados frios em armazenamento de acesso
imediato.

Nenhum deles é otimização micro. Todos são de arquitetura ou de disciplina.

### Marcação é pré-requisito de tudo

Sem etiquetar recursos por time, produto e ambiente, não há como atribuir custo — e
sem atribuição, ninguém é responsável.

O efeito de tornar o custo visível por time costuma ser maior que o de qualquer
otimização técnica: gente que vê o próprio número age sobre ele.

Marcação obrigatória na criação, com recursos não marcados bloqueados ou
sinalizados, é a base.

### Custo entra no desenho, não na revisão

A pergunta a fazer antes de implementar: **quanto isto vai custar por mês, com o
volume esperado?**

```text
1 milhão de pedidos/mês
  × 4 chamadas a armazenamento de objetos por pedido
  = 4 milhões de requisições
  + transferência entre zonas se o desenho não tiver preferência
```

Uma estimativa grosseira, feita em quinze minutos, evita descobrir em produção que
uma decisão custa dez vezes o esperado.

E permite comparar alternativas pelo custo, além de latência e complexidade.

### Otimizar demais também custa

Vale a honestidade: engenharia gasta tempo, e tempo custa mais que a maior parte
das economias pequenas.

Perseguir 5% em algo que representa 2% da fatura é trabalho negativo. A regra
prática é atacar o que está no topo da distribuição — tipicamente dois ou três
itens respondem pela maior parte da conta.

## Modelo Mental

**Na nuvem, o desenho tem preço mensal.** Quem projeta sem ver a fatura projeta com
uma dimensão a menos.

## Quando Usar

Custo deve ser critério explícito quando:

- O volume vai crescer em ordens de grandeza.
- A margem do produto é sensível a custo de infraestrutura.
- Há alternativas de desenho com preços muito diferentes.
- A fatura já é material perto da receita.
- Um componente cresce mais rápido que o negócio.

## Quando Não Usar

**Como critério dominante em fase de descoberta.** Antes de saber se o produto
funciona, otimizar custo é otimizar o que pode nem existir.

**Sacrificando confiabilidade.** Remover redundância para economizar é trocar custo
previsível por risco.

**Micro-otimização sem medir a distribuição.**

**Reserva de capacidade de longo prazo** antes de o padrão de uso estabilizar.

**Autogerir para economizar** sem contabilizar o tempo das pessoas. Ver
[serviços gerenciados](/09-cloud-architecture/managed-services.md).

## Alternativas

Para reduzir custo sem mudar arquitetura:

- **Desligar o que não é usado** fora do horário — o de maior retorno imediato.
- **Redimensionar** com base em utilização real.
- **Compromisso de uso** — descontos por reserva, para capacidade estável.
- **Capacidade interrompível** — muito mais barata, para cargas tolerantes.
- **Classes de armazenamento** por frequência de acesso.
- **Cache** — reduz chamadas cobradas e latência ao mesmo tempo.

## Trade-offs

| Otimizado para custo | Para desempenho |
|---|---|
| Menor capacidade ociosa | Folga para picos |
| Escalonamento reativo | Capacidade pronta |
| Armazenamento mais frio | Acesso imediato |
| Menos redundância | Mais |
| Mais risco sob pico | Mais previsível |

| Reservado | Sob demanda | Interrompível |
|---|---|---|
| Mais barato com compromisso | Preço cheio | Muito barato |
| Compromisso de 1 a 3 anos | Nenhum | Pode ser retirado |
| Para carga estável | Variável | Tolerante a interrupção |

## Modos de Falha

**Custo por transação crescendo sem ninguém notar.**

**Fatura surpresa.** Um laço que consulta em excesso, um processo que não terminou.

**Recursos órfãos acumulando.**

**Transferência entre zonas dominando a conta.**

**Retenção infinita.** Registros de anos que ninguém consulta.

**Escalonamento sem teto.** Um defeito gera carga e a conta acompanha.

**Otimização quebrando confiabilidade.**

## Erros Comuns

**Não marcar recursos.**

**Não medir custo por unidade de negócio.**

**Tratar custo como assunto do financeiro.**

**Não estimar antes de implementar.**

**Otimizar o que não está no topo da distribuição.**

**Não definir teto de escalonamento nem alerta de anomalia.**

## Exemplo Real

Uma plataforma de vídeo viu a fatura de nuvem crescer 180% em um ano, enquanto a
base de usuários crescia 40%.

A análise, feita depois que a marcação por produto foi implementada, encontrou a
distribuição:

**Transferência entre zonas: 31% da fatura.** O serviço de transcodificação lia os
arquivos de um armazenamento e os balanceadores distribuíam sem preferência de
zona. A maior parte do tráfego atravessava zonas sem necessidade.

**Armazenamento de vídeos antigos: 24%.** Todos os vídeos, de sete anos, em
armazenamento de acesso imediato. A análise de acesso mostrou que 88% deles não
eram acessados havia mais de um ano.

**Ambientes de desenvolvimento: 12%.** Onze ambientes ligados 24 horas, usados em
horário comercial.

**Instâncias superdimensionadas: 9%.** Utilização média de 11%.

**Recursos órfãos: 4%.** Volumes de instâncias apagadas havia meses.

As correções, e o que cada uma rendeu:

**Preferência de zona no roteamento** — configuração, dois dias de trabalho.
Reduziu a transferência em cerca de 70%.

**Política de ciclo de vida** movendo vídeos sem acesso por 90 dias para classe
fria e, após um ano, para arquivamento. Reduziu o custo de armazenamento pela
metade, com a ressalva de que a recuperação de arquivamento tem latência — o que
exigiu tratamento na aplicação para vídeos raramente acessados.

**Desligamento automático** dos ambientes fora do horário e nos fins de semana.

**Redimensionamento** com base em utilização real de 30 dias.

**Varredura semanal de órfãos.**

Resultado: a fatura caiu 44%, e o **custo por hora de vídeo assistida** — a métrica
que passou a ser acompanhada — caiu 61%.

A leitura que a equipe faz: nenhuma correção exigiu mudar a arquitetura da aplicação.
Todas eram decisões de infraestrutura tomadas por omissão, que ninguém revisitou
porque ninguém era dono do número.

A marcação por produto, que veio primeiro, foi o que tornou tudo o resto possível —
e ela era vista como burocracia antes disso.

## Conceitos Relacionados

- [Serviços Gerenciados](/09-cloud-architecture/managed-services.md) — a comparação de custo total.
- [Serverless](/09-cloud-architecture/serverless.md) — outro modelo de cobrança.
- [Ciclo de Vida do Dado](/07-data-architecture/data-lifecycle.md) — retenção.
- [Zonas de Disponibilidade](/09-cloud-architecture/availability-zones.md) — transferência.

## Exercício Prático

Descubra os três maiores itens da sua fatura de nuvem. Para cada um, pergunte: ele
cresce com o negócio ou mais rápido que ele?

Depois calcule o custo por transação do último mês e do mesmo mês do ano anterior.
A tendência dessa razão diz mais que o valor absoluto.

## Perguntas de Entrevista

- Por que custo é atributo de qualidade na nuvem e não na infraestrutura própria?
- Qual métrica revela degradação de arquitetura que o custo total esconde?
- Por que marcação de recursos precede qualquer otimização?

## Para Aprofundar

- Storment, J.R.; Fuller, Mike. *Cloud FinOps*. 2ª ed. O'Reilly, 2023.
- Fowler, Martin. *Cloud Cost Attribution*, 2021.
- Documentação de boas práticas de custo dos principais provedores.
