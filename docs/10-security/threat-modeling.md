---
id: threat-modeling
title: Modelagem de Ameaças
sidebar_position: 10
description: Transformar "vamos pensar em segurança" numa lista de decisões — a prática de maior retorno da seção.
doc_type: concept
level: 5
difficulty: avançado
status: complete
objective: >
  Ao terminar, o leitor conduz uma modelagem de ameaças sobre um desenho e sai com
  decisões priorizadas, não com preocupações genéricas.
prerequisites: [security]
related: [secure-boundaries, least-privilege, security-failure-modes]
canonical_for: [modelagem de ameaças, STRIDE, superfície de ataque, ator de ameaça]
content_version: 1
last_reviewed: 2026-08-28
---

# Modelagem de Ameaças

## Visão Geral

Modelagem de ameaças é olhar para um desenho e perguntar, de forma estruturada:
**o que pode dar errado aqui, quem faria isso, e o que fazemos a respeito?**

O produto não é um relatório. São **decisões**: mudanças no desenho, controles a
implementar, riscos aceitos conscientemente.

É a prática de maior retorno desta seção, porque ela acontece antes de o código
existir — quando mudar ainda é barato.

## Problema

"Precisamos pensar em segurança" é uma frase sem consequência. Ela não diz o que
fazer, e o resultado típico é uma lista de boas práticas aplicadas uniformemente,
sem relação com os riscos reais daquele sistema.

Isso produz dois erros ao mesmo tempo: esforço em proteções que não importam ali, e
ausência de proteção onde importa.

A modelagem resolve fazendo o inverso: parte do sistema concreto, identifica o que
tem valor, e trabalha para fora.

## Conceitos Centrais

### As quatro perguntas

O método, reduzido ao essencial:

```text
1. no que estamos trabalhando?    o desenho, com fronteiras de confiança
2. o que pode dar errado?         as ameaças
3. o que vamos fazer?             as decisões
4. fizemos um bom trabalho?       revisão
```

A primeira pergunta consome mais tempo do que se espera, e é onde está o valor: a
maior parte das equipes descobre, ao desenhar o fluxo de dados, coisas que ninguém
sabia — um caminho de escrita esquecido, um serviço que tem acesso ao que não
deveria.

### Comece pelo diagrama de fluxo de dados

Não é o diagrama de arquitetura bonito. É um esboço com:

**Processos** — o que executa código.

**Repositórios** — onde o dado para.

**Entidades externas** — usuários, parceiros, sistemas de terceiros.

**Fluxos** — quem manda o quê para quem.

**Fronteiras de confiança** — as linhas que separam níveis de confiança diferentes.

As fronteiras são o ponto. **Toda ameaça interessante atravessa uma delas.** Ver
[fronteiras seguras](secure-boundaries.md).

### STRIDE dá vocabulário para a pergunta 2

Para cada elemento do diagrama, seis categorias de ameaça:

```text
falsificação de identidade   alguém se passa por outro
adulteração                  alguém altera dados ou código
repúdio                      alguém nega ter feito, e não há prova
divulgação de informação     alguém lê o que não deveria
negação de serviço           alguém impede o uso legítimo
elevação de privilégio       alguém obtém mais acesso do que tem
```

O valor não está na sigla. Está em ter uma lista que impede o time de pensar só nas
ameaças que já conhece — que é o viés natural.

Percorrer as seis categorias para cada fronteira, com disciplina, encontra coisas
que a conversa livre não encontra.

### Ator de ameaça define o que é razoável

Proteger contra "hackers" não orienta nada. Proteger contra atores específicos, sim:

```text
usuário curioso           tenta o que a interface permite, mais um pouco
funcionário mal-intencionado  tem credencial legítima e acesso interno
concorrente               motivado, recursos moderados
crime organizado          motivado por dinheiro, recursos altos
estado                    recursos praticamente ilimitados
```

A escolha de contra quem você se defende define o custo aceitável. Um sistema
interno de RH e uma plataforma de pagamentos não enfrentam os mesmos atores, e
protegê-los igualmente é errado nos dois casos.

Ser explícito sobre isso — inclusive sobre quem você **não** vai conseguir deter —
é o que torna a discussão honesta.

### Priorizar por impacto vezes probabilidade

Nem toda ameaça merece controle. A priorização evita a lista infinita:

**Impacto.** O que acontece se isso ocorrer? Perda financeira, exposição de dados,
indisponibilidade, dano reputacional, sanção regulatória.

**Probabilidade.** Qual a facilidade de explorar, dado o ator considerado?

E quatro respostas possíveis para cada ameaça:

```text
mitigar    implementar controle
transferir seguro, contrato, terceirizar
aceitar    registrar a decisão e o motivo
eliminar   remover a funcionalidade ou o dado
```

A última é subestimada. **Dado que não existe não vaza.** Frequentemente a resposta
certa é não coletar, não guardar, ou apagar antes.

### Quando fazer

**No desenho**, antes de implementar. É quando mudar é barato.

**Em mudanças estruturais** — nova integração, novo tipo de dado, nova fronteira.

**Periodicamente** para sistemas críticos, porque o contexto muda.

Não em toda alteração. Modelagem para cada tarefa vira ritual esvaziado, e o time
para de fazer.

### O produto precisa ter dono e prazo

Uma modelagem que termina em "documento com preocupações" não muda nada.

O produto útil é uma lista curta de decisões, cada uma com responsável e prazo, e
os riscos aceitos registrados **com quem aceitou** — porque aceitar risco é decisão
de negócio, não de engenharia.

## Modelo Mental

**Modelagem de ameaças é desenho, não auditoria.** Ela acontece antes, e o produto
são decisões.

## Quando Usar

- Antes de implementar um sistema ou funcionalidade relevante.
- Ao adicionar uma fronteira de confiança nova.
- Ao passar a tratar um tipo de dado novo, especialmente pessoal.
- Ao integrar com um sistema externo.
- Periodicamente, em sistemas críticos.
- Após um incidente, para revisar o modelo.

## Quando Não Usar

**Para cada alteração pequena.** Vira ritual.

**Sem definir os atores.** Produz lista genérica.

**Como auditoria depois de pronto.** Aí é revisão de segurança, que é outra coisa e
chega tarde para mudanças estruturais.

**Sem priorizar.** Uma lista de 80 ameaças sem ordem não é acionável.

**Sem dono e prazo.**

**Só com o time de segurança.** Quem conhece o sistema é quem o constrói; sem eles,
o modelo fica errado.

## Alternativas

- **Revisão de segurança** — depois de pronto, para o que a modelagem não pegou.
- **Teste de intrusão** — verifica a implementação, não o desenho.
- **Análise automatizada** — encontra classes conhecidas de defeito, não decisões
  ruins de arquitetura.
- **Árvores de ataque** — mais detalhado, para um cenário específico de alto risco.

Nenhuma substitui a modelagem, porque nenhuma acontece antes de o desenho existir.

## Trade-offs

| Modelagem no desenho | Revisão depois |
|---|---|
| Mudança estrutural viável | Cara ou impossível |
| Custo de tempo antes | Retrabalho depois |
| Encontra decisões ruins | Encontra defeitos |
| Exige o time todo | Time de segurança basta |

| STRIDE completo | Conversa livre |
|---|---|
| Cobertura sistemática | Só o que se lembra |
| Mais demorado | Rápido |
| Encontra o inesperado | Confirma o conhecido |

## Modos de Falha

**Documento sem decisões.**

**Lista sem priorização.**

**Atores não definidos.** Protege contra tudo, mal.

**Feita tarde.** As mudanças estruturais já não cabem.

**Sem revisão após mudanças.** O modelo envelhece com o sistema.

**Riscos aceitos sem registro.** Ninguém sabe que foram aceitos, nem por quem.

**Só o time de segurança na sala.** Modelo de um sistema que não existe.

## Erros Comuns

**Pular o diagrama de fluxo de dados.**

**Não marcar as fronteiras de confiança.**

**Não definir os atores de ameaça.**

**Não considerar "eliminar" como resposta.**

**Terminar sem dono e prazo.**

**Fazer uma vez e nunca revisar.**

## Exemplo Real

Uma empresa de saúde ia lançar um portal onde pacientes acessariam resultados de
exames. O desenho estava pronto e a implementação começaria em duas semanas.

A modelagem de ameaças levou dois encontros de três horas, com o time de produto, o
de engenharia e uma pessoa de segurança.

O diagrama de fluxo de dados, feito no primeiro encontro, já produziu duas
descobertas antes de qualquer análise de ameaça:

**Um caminho esquecido.** O sistema de laboratório enviava resultados por um
diretório de arquivos compartilhado, sem autenticação, herdado de uma integração
antiga. Ninguém do time do portal sabia disso.

**Dado desnecessário.** O portal recebia o registro completo do paciente, incluindo
histórico de outras especialidades, porque a API existente devolvia tudo. Só o
resultado do exame era exibido.

A análise por STRIDE, no segundo encontro, produziu 31 ameaças. A priorização, com
o ator definido como "usuário mal-intencionado com conta legítima" e "funcionário
com acesso interno", reduziu para 9 acionáveis.

As decisões:

**Eliminar.** O portal passou a receber apenas o resultado do exame consultado, não
o registro completo. Isso removeu 6 das 31 ameaças de uma vez, e foi a decisão de
maior impacto — tomada porque alguém perguntou "por que estamos trazendo isso?".

**Mitigar.** Autorização verificada por exame, não por paciente — a versão original
verificava se o usuário era o paciente e depois listava tudo. Um identificador
sequencial de exame na URL foi trocado por opaco.

**Mitigar.** A integração por diretório compartilhado ganhou autenticação e
cifragem, e virou tarefa separada com prazo.

**Aceitar.** Um cenário de funcionário do laboratório acessando resultados
indevidamente foi aceito como risco, mitigado por trilha de auditoria e revisão
periódica, com registro de quem aceitou.

**Transferir.** O envio de notificações por mensagem de texto foi terceirizado, com
o requisito contratual de não incluir conteúdo clínico na mensagem.

Nove meses depois, um teste de intrusão contratado encontrou dois problemas — ambos
de implementação, nenhum estrutural.

O que a equipe registra: a descoberta que mais mudou o resultado não veio da análise
de ameaças, veio de desenhar o fluxo de dados. Ninguém tinha, antes daquele
encontro, um diagrama que mostrasse todos os caminhos por onde o dado do paciente
entrava e saía.

## Conceitos Relacionados

- [Fronteiras Seguras](secure-boundaries.md) — o que o diagrama marca.
- [Menor Privilégio](least-privilege.md) — a resposta mais comum.
- [Modos de Falha de Segurança](security-failure-modes.md).
- [Proteção de Dados](data-protection.md) — a resposta "eliminar".

## Exercício Prático

Desenhe o fluxo de dados de uma funcionalidade que seu time vai construir, com as
fronteiras de confiança marcadas.

Para cada fronteira, percorra as seis categorias do STRIDE. Você vai encontrar pelo
menos uma coisa que ninguém tinha considerado — e provavelmente um caminho de dado
que alguém esqueceu de mencionar.

## Perguntas de Entrevista

- Quais são as quatro perguntas, e qual delas costuma dar mais retorno?
- Por que definir o ator de ameaça muda as decisões?
- Por que "eliminar" é a resposta mais subestimada?

## Para Aprofundar

- Shostack, Adam. *Threat Modeling: Designing for Security*. Wiley, 2014.
- Threat Modeling Manifesto, 2020 — as quatro perguntas.
- OWASP. *Threat Modeling Cheat Sheet*.
