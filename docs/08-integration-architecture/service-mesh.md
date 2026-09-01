---
id: service-mesh
title: Malha de Serviço
sidebar_position: 10
description: Tirar comunicação da aplicação e pôr na infraestrutura — e a distância entre a adoção e a necessidade.
doc_type: pattern
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor avalia malha de serviço pelo problema concreto que ela
  resolve, e reconhece quando o custo operacional supera o ganho.
prerequisites: [api-gateways]
related: [api-gateways, grpc, integration-architecture]
canonical_for: [malha de serviço, sidecar, plano de controle, mTLS entre serviços]
content_version: 2
last_reviewed: 2026-08-27
---

# Malha de Serviço

## Visão Geral

Uma malha de serviço move a comunicação entre serviços para uma camada de
infraestrutura: um processo auxiliar ao lado de cada serviço intercepta todo o
tráfego e aplica retentativa, timeout, criptografia mútua, balanceamento e
observabilidade.

A aplicação deixa de conhecer essas preocupações. Uma política de retentativa
passa a valer para todos os serviços, em todas as linguagens, sem tocar em código.

É a tecnologia desta seção com a maior distância entre **adoção** e
**necessidade** — e este documento trata isso com franqueza, porque a decisão de
adotar é frequentemente tomada pelo motivo errado.

## Problema

Numa malha com muitos serviços, cada um precisa de retentativa, timeout, disjuntor,
descoberta, criptografia mútua e rastreamento distribuído.

Em uma linguagem, uma biblioteca compartilhada resolve. Em cinco linguagens, são
cinco bibliotecas, com comportamentos que divergem — e uma mudança de política
exige atualizar e reimplantar dezenas de serviços.

O ponto de dor real é esse: **política de comunicação uniforme, num ambiente
poliglota, sem reimplantar tudo**.

## Conceitos Centrais

### Processo auxiliar e plano de controle

Cada instância de serviço ganha um processo ao lado — o auxiliar — que intercepta
todo o tráfego de entrada e saída. O serviço fala com `localhost`; o auxiliar faz
o resto.

O **plano de controle** distribui configuração e certificados para todos os
auxiliares. É onde a política é declarada uma vez.

```text
serviço A → auxiliar A ══mTLS══> auxiliar B → serviço B
                  ↑                   ↑
                  └── plano de controle ──┘
```

A consequência: mudar a política de timeout de todo o ambiente é editar
configuração, não código.

### O que ela entrega de fato

**Criptografia mútua entre serviços, com rotação automática de certificado.** Esse
é, na prática, o argumento mais forte. Implementar isso na aplicação, em várias
linguagens, com rotação, é trabalho considerável e propenso a erro.

**Balanceamento por chamada.** Resolve o problema descrito em
[gRPC](/08-integration-architecture/grpc.md): conexões longas e multiplexadas que fixam clientes a instâncias.

**Retentativa, timeout e disjuntor uniformes.**

**Observabilidade sem instrumentar.** Métricas de tráfego entre serviços — latência,
taxa de erro, volume — para todos os pares, sem tocar em código.

**Divisão de tráfego.** Implantação gradual e testes com fração do tráfego,
controlados por configuração.

**Autorização entre serviços.** Qual serviço pode chamar qual, declarado
centralmente.

### O que ela custa

Sendo específico, porque é o que decide:

**Latência.** Dois saltos adicionais por chamada — um em cada auxiliar.
Tipicamente poucos milissegundos, e relevante em cadeias longas.

**Recursos.** Um processo auxiliar por instância. Em centenas de instâncias, isso
é CPU e memória que somam.

**Complexidade de diagnóstico.** Quando algo falha, a pergunta "foi a aplicação ou
o auxiliar?" precisa ser respondida antes de qualquer coisa. E o erro que a
aplicação vê pode ter sido gerado pela malha.

**Conhecimento operacional.** É uma plataforma inteira, com seu próprio modelo de
configuração, seus modos de falha e suas atualizações. Alguém precisa dominá-la.

**Acoplamento à plataforma.** Sair depois é caro.

### Retentativa em camadas é o modo de falha característico

Se a malha repete e a aplicação também, as tentativas se multiplicam.

```text
aplicação: 3 tentativas
malha:     3 tentativas por tentativa
resultado: 9 chamadas ao destino
```

O fator se compõe a cada salto: numa cadeia de três, são 9³ = 729 chamadas no fim.
Uma degradação leve no destino vira avalanche. Ver
[tempestade de retentativas](/12-reliability/retry-storms.md).

A regra: **repita numa camada só**, e saiba qual.

### O critério honesto de adoção

Malha se paga quando várias destas são verdadeiras ao mesmo tempo:

```text
dezenas de serviços, não unidades
várias linguagens
criptografia mútua entre serviços é requisito
já existe orquestração de contêineres madura
há quem opere a plataforma
o custo de política divergente já dói hoje
```

Com poucos serviços, uma linguagem e uma biblioteca compartilhada, a malha adiciona
uma plataforma inteira para resolver um problema que ainda não existe.

Vale ser direto: a maioria das adoções que dão errado começa por "todo mundo está
usando" e não por nenhuma das linhas acima.

### Ela não substitui o gateway

Malha cuida do tráfego **entre** serviços. [Gateway](/08-integration-architecture/api-gateways.md) cuida do
tráfego que **entra**.

São camadas diferentes, e coexistem na maioria dos desenhos.

## Modelo Mental

**A malha move comunicação da aplicação para a infraestrutura.** Isso é lucro
quando há muitos serviços e muitas linguagens; é uma plataforma a operar sem
problema correspondente quando não há.

## Quando Usar

- Dezenas de serviços, em várias linguagens.
- Criptografia mútua entre serviços é requisito.
- Política de comunicação uniforme sem reimplantar.
- Balanceamento por chamada — especialmente com [gRPC](/08-integration-architecture/grpc.md).
- Divisão de tráfego para implantação gradual.
- Observabilidade entre serviços sem instrumentar cada um.
- Já existe orquestração madura e time de plataforma.

## Quando Não Usar

**Com poucos serviços.** Biblioteca compartilhada resolve.

**Com uma linguagem só.** O principal ganho desaparece.

**Sem quem opere a plataforma.**

**Quando a latência adicional é inaceitável.**

**Para tráfego de entrada.** Ver [gateway](/08-integration-architecture/api-gateways.md).

**Sem resolver a retentativa em camadas antes.**

**Para "resolver" problemas de arquitetura.** Uma malha não conserta fronteiras de
serviço mal traçadas — ela torna mais fácil não perceber que estão erradas.

## Alternativas

- **Biblioteca compartilhada** — mesma política, sem processo extra nem latência.
  Exige uma linguagem, ou uma biblioteca por linguagem.
- **Descoberta e balanceamento na plataforma** — orquestradores já oferecem parte
  disso.
- **Criptografia mútua sem malha** — mais trabalhoso e possível.
- **Malha sem processo auxiliar** — modelos que colocam a função no nó em vez de
  por instância, reduzindo consumo e latência.

## Trade-offs

| Com malha | Biblioteca |
|---|---|
| Independente de linguagem | Uma por linguagem |
| Política sem reimplantar | Reimplantar tudo |
| Latência adicional | Nenhuma |
| Recursos por instância | Nenhum |
| Plataforma a operar | Dependência a versionar |
| Diagnóstico em duas camadas | Uma |

## Modos de Falha

**Retentativa multiplicada.**

**Auxiliar consumindo mais que o serviço.** Comum em serviços leves.

**Erro atribuído à camada errada.** Horas perdidas antes de olhar a malha.

**Plano de controle indisponível.** Configuração congelada; auxiliares continuam
com a última recebida, e nada muda.

**Certificado expirado.** Comunicação entre serviços para, e a causa não é óbvia.

**Configuração errada isolando um serviço.** Uma política de autorização mal
escrita corta o tráfego.

**Ordem de inicialização.** O serviço sobe antes do auxiliar e as primeiras
chamadas falham.

## Erros Comuns

**Adotar por tendência.**

**Repetir na malha e na aplicação.**

**Não dimensionar o consumo dos auxiliares.**

**Não treinar o time antes.**

**Esperar que resolva problemas de fronteira de serviço.**

**Adotar tudo de uma vez** em vez de começar por um recurso — tipicamente
criptografia mútua — e expandir.

## Exemplo Real

Uma empresa de tecnologia financeira com 60 serviços, em quatro linguagens,
adotou malha de serviço. O gatilho foi legítimo: uma exigência regulatória de
criptografia entre todos os serviços internos, com rotação de certificados.

Implementar isso em quatro linguagens foi estimado em cinco meses de trabalho
distribuído por vários times, com risco de divergência.

A malha entregou em seis semanas, e junto veio o resto: métricas por par de
serviços, política de timeout uniforme e implantação gradual por divisão de
tráfego.

Três problemas:

**Avalanche por retentativa.** As aplicações já repetiam três vezes. A malha foi
configurada com três. Numa degradação leve de um serviço de consulta, a cadeia de
três saltos gerou 729 chamadas por requisição original. O serviço, que estava
lento, caiu completamente. O diagnóstico levou seis horas porque as métricas da
aplicação mostravam três tentativas, e as do destino no fim da cadeia mostravam 729. A retentativa
foi removida das aplicações e centralizada na malha.

**Consumo dos auxiliares.** Serviços pequenos, de baixo tráfego, passaram a
consumir mais no auxiliar do que na própria aplicação. O custo de infraestrutura
subiu 30% antes de alguém ligar os pontos. Resolvido com limites por perfil de
serviço.

**Certificado expirado.** Uma falha no plano de controle impediu a rotação. Os
certificados expiraram durante a madrugada, e toda a comunicação entre serviços
parou. Os alertas apontavam falhas de conexão em dezenas de serviços
simultaneamente, e a causa raiz levou 40 minutos para ser encontrada. Passou a
haver alerta de proximidade de expiração.

A conclusão registrada: a adoção foi acertada porque havia um requisito concreto
que a alternativa não atendia bem. Um time vizinho, com 8 serviços numa linguagem
só, adotou a mesma malha "para padronizar" e a removeu quatorze meses depois — o
custo operacional era real e o benefício não existia naquele contexto.

## Conceitos Relacionados

- [API Gateways](/08-integration-architecture/api-gateways.md) — o tráfego de entrada.
- [gRPC](/08-integration-architecture/grpc.md) — onde o balanceamento por chamada importa.
- [Retentativas](/06-distributed-systems/retries.md) — o risco de multiplicação.
- [Observabilidade](/13-observability/index.md).

## Exercício Prático

Se você usa malha, verifique quantas camadas repetem: a aplicação, a malha, o
cliente HTTP.

Multiplique os fatores de cada camada para achar o fator por salto, e eleve esse
fator ao número de saltos da sua cadeia mais longa — a amplificação é exponencial
na profundidade, não linear. Esse é o número de chamadas que uma única requisição
pode gerar numa degradação.

## Perguntas de Entrevista

- Qual o argumento mais forte para adotar uma malha?
- Como retentativa em camadas produz avalanche?
- Quando uma biblioteca compartilhada é a escolha melhor?

## Para Aprofundar

- Morgan, William. *What's a service mesh? And why do I need one?*, 2017.
- Calçado, Phil. *Pattern: Service Mesh*, 2017.
- Newman, Sam. *Building Microservices*. 2ª ed. O'Reilly, 2021.
