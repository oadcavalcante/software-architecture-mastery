---
id: glossary
title: Glossário
sidebar_position: 91
description: Terminologia de arquitetura com definições precisas e a distinção entre termos frequentemente confundidos.
doc_type: reference
level: 0
difficulty: iniciante
status: complete
objective: >
  Ao terminar, o leitor dispõe de definições operacionais dos termos usados no
  percurso, incluindo as distinções que a literatura costuma borrar.
prerequisites: []
related: [i18n-terminology]
canonical_for: []
content_version: 1
last_reviewed: 2026-08-26
---

# Glossário

Definições operacionais — o que o termo significa quando alguém precisa decidir
com ele, não a definição de dicionário.

Onde dois termos são confundidos com frequência, a distinção é declarada.

## A

**Abstração** — Representação que expõe o que importa para um propósito e oculta
o resto. Boa abstração reduz o que é preciso saber; abstração ruim adiciona uma
camada sem remover nenhuma.

**Acoplamento** (coupling) — Grau em que uma mudança em um módulo obriga a
mudança em outro. Não é um defeito a eliminar: é uma quantidade a alocar
deliberadamente. Módulos que mudam juntos devem estar acoplados.

**Agregado** (aggregate) — Em DDD, conjunto de objetos tratado como uma unidade
de consistência transacional, acessado apenas pela sua raiz.

**Anti-corruption layer** — Camada de tradução que impede que o modelo de um
sistema externo vaze para dentro do seu.

**Atributo de qualidade** — Propriedade mensurável de como o sistema se comporta:
disponibilidade, desempenho, segurança. Distingue-se de requisito funcional, que
descreve o que o sistema faz.

## B

**Backpressure** — Mecanismo pelo qual um consumidor sobrecarregado sinaliza ao
produtor que reduza o ritmo. Sem ele, sobrecarga vira perda de mensagem ou
esgotamento de memória.

**Bounded context** — Fronteira dentro da qual um modelo de domínio e sua
linguagem têm significado único e consistente. Dois contextos podem usar a mesma
palavra com sentidos diferentes, e isso é correto.

**Bulkhead** (anteparo) — Isolamento de recursos para que a exaustão em uma parte
não derrube as demais. O nome vem dos compartimentos estanques de um navio.

## C

**CAP** — Resultado que afirma que, durante uma partição de rede, um sistema
distribuído não pode ser simultaneamente consistente e disponível. Diz respeito
apenas ao comportamento **durante** a partição — é frequentemente citado como se
fosse uma escolha permanente entre as três letras, o que não é.

**Circuit breaker** (disjuntor) — Componente que interrompe chamadas a um serviço
que está falhando, evitando que o chamador desperdice recursos e propague a falha.

**Coesão** (cohesion) — Grau em que os elementos de um módulo pertencem juntos.
Alta coesão e baixo acoplamento são a mesma decisão vista de dois lados: o que
fica junto e o que fica separado.

**Consistência eventual** — Garantia de que, na ausência de novas escritas, todas
as réplicas convergem para o mesmo valor. Não diz **quando**, e é essa ausência
que precisa ser tratada na aplicação.

**Consistência forte** — Garantia de que toda leitura observa a escrita mais
recente. Custa latência mesmo sem partição de rede — ver PACELC.

**CQRS** — Separação entre o modelo usado para escrever e o usado para ler.
Resolve o caso em que os dois têm requisitos incompatíveis, ao custo de
sincronização entre eles.

## D

**DDD** — Domain-Driven Design. Abordagem que estrutura o software a partir do
domínio de negócio e da linguagem de quem o entende.

**Disponibilidade** (availability) — Fração do tempo em que o sistema responde
corretamente. Expressa como porcentagem sobre uma janela declarada; sem a janela,
o número não significa nada.

**Dívida técnica** — Custo futuro assumido por uma decisão que privilegia
velocidade agora. Só é dívida quando a escolha foi consciente e há intenção de
pagar; o resto é apenas trabalho mal feito.

## E

**Event sourcing** — Persistir a sequência de eventos que levou ao estado, em vez
do estado. O estado vira uma projeção derivável. Poderoso e caro: exige
versionamento de eventos e reprocessamento.

## F

**Fitness function** — Verificação automatizada de que uma propriedade
arquitetural desejada continua válida. Transforma intenção arquitetural em teste.

## G

**Gargalo** (bottleneck) — Recurso que satura primeiro e limita a capacidade do
conjunto. Otimizar qualquer outro ponto não aumenta a capacidade total.

## I

**Idempotência** — Propriedade de uma operação cujo efeito é o mesmo se executada
uma ou várias vezes. É o que torna seguro repetir uma chamada cujo resultado você
não conhece — e por isso é a base de quase toda recuperação em sistema
distribuído.

## L

**Latência** — Tempo entre requisição e resposta. Sempre relatada em percentis,
nunca em média: a média esconde exatamente a cauda que os usuários percebem.

## M

**Microsserviços** — Estilo em que a aplicação é um conjunto de serviços
implantáveis de forma independente, cada um com seus dados. A independência de
implantação é o objetivo; o tamanho pequeno é consequência, não meta.

**Modularidade** — Grau em que o sistema é composto de partes com fronteiras
explícitas que podem ser entendidas e alteradas separadamente.

**Monolito modular** — Aplicação implantada como uma unidade, com fronteiras
internas explícitas e impostas. Frequentemente a resposta correta para o caso em
que microsserviços seriam adotados por reputação.

## P

**PACELC** — Extensão de CAP: durante partição (P), escolhe-se entre
disponibilidade e consistência; **caso contrário (E)**, escolhe-se entre latência
e consistência. Descreve melhor o dilema cotidiano, porque partições são raras e
o segundo trade-off vale sempre.

**Particionamento** — Divisão de dados em subconjuntos disjuntos para distribuir
carga ou volume. Ver também sharding.

## R

**Replicação** — Manutenção de cópias do mesmo dado em locais distintos.
Aumenta disponibilidade e capacidade de leitura; introduz a questão de qual cópia
está certa.

**Confiabilidade** (reliability) — Probabilidade de o sistema operar corretamente
por um período. Distingue-se de disponibilidade: um sistema pode estar disponível
e devolver resultados errados.

**RPO** — Recovery Point Objective. Quantidade máxima de dado que se aceita
perder, medida em tempo. Define a estratégia de replicação e backup.

**RTO** — Recovery Time Objective. Tempo máximo aceitável para restaurar o
serviço após uma falha. Define a topologia de redundância.

## S

**Saga** — Sequência de transações locais com compensações, usada quando uma
transação distribuída não é viável. Troca atomicidade por disponibilidade, e
exige que cada passo tenha compensação definida.

**Escalabilidade** (scalability) — Capacidade de absorver crescimento adicionando
recursos. Distingue-se de desempenho: um sistema pode ser rápido e não escalar.

**Sharding** — Particionamento horizontal em que cada partição vive numa
instância separada. A escolha da chave determina se a carga distribui ou
concentra num hotspot.

**SLA** — Service Level Agreement. Compromisso contratual sobre nível de serviço,
com consequência comercial. É decisão de negócio.

**SLI** — Service Level Indicator. A métrica em si — por exemplo, a fração de
requisições respondidas abaixo de 300 ms.

**SLO** — Service Level Objective. A meta interna sobre um SLI. É decisão de
engenharia, e deve ser mais rigorosa que o SLA correspondente.

**Strangler fig** — Padrão de substituição incremental em que o novo sistema
intercepta progressivamente o tráfego do antigo até que este possa ser desligado.

## T

**Tolerância a falhas** — Capacidade de continuar operando corretamente apesar da
falha de componentes.

**Trade-off** — Escolha em que ganhar em uma dimensão implica perder em outra. Um
"trade-off" sem perda declarada não é um trade-off, é uma preferência.

**Transação** — Unidade de trabalho com garantias de atomicidade, consistência,
isolamento e durabilidade. O nível de isolamento efetivo raramente é o que o
nome sugere; vale conferir na documentação do banco específico.

## U

**Ubiquitous language** — Vocabulário compartilhado entre especialistas de
domínio e desenvolvedores, usado sem tradução no código e nas conversas. É o
mecanismo que faz o restante de DDD funcionar.

## V

**Value object** — Objeto definido pelos seus atributos e não por identidade.
Dois com os mesmos valores são intercambiáveis. Imutável por construção.
