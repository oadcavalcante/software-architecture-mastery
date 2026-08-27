# PROMPT.md

Instrução do loop. **Uma iteração = uma tarefa de [`fix_plan.md`](fix_plan.md).**

---

## Sua tarefa

Escreva o próximo documento pendente do currículo, no padrão de qualidade deste
repositório, e deixe tudo verde.

## Antes de escrever

1. **Pegue a tarefa.** A primeira não marcada em [`fix_plan.md`](fix_plan.md).
   Uma. Não adiante outras.

2. **Leia a spec da seção** — `specs/<seção>.md`. Escopo, `doc_type` previsto e
   critério de conclusão.

3. **Leia dois documentos vizinhos já escritos** na mesma seção ou em seção
   equivalente. Isso calibra profundidade, densidade e voz melhor que qualquer
   instrução — e é o passo que mais frequentemente é pulado.

4. **Verifique duplicação.** Procure o conceito nos `canonical_for` existentes:

   ```bash
   grep -rn "canonical_for" docs/ | grep -i "<conceito>"
   ```

   Se já é canônico em outra seção, **referencie com link** e escreva sobre o
   aspecto que a sua seção acrescenta. Não redefina.

5. **Confirme os pré-requisitos.** Se o documento vai referenciar tópicos ainda
   não escritos, ou você escreve o pré-requisito antes, ou não cria o link.
   Referência para frente quebra o build.

## Ao escrever

Siga o template do `doc_type` em [SPEC.md](SPEC.md) §7.3 e as seções obrigatórias
de [AGENTS.md](AGENTS.md).

O padrão que governa tudo:

> **O material ensina raciocínio arquitetural, não memorização.**

Na prática, isso significa cinco coisas.

**Comece pelo problema, não pela solução.** Um documento que abre descrevendo a
estrutura de um padrão já perdeu — o leitor precisa entender que força o
originou.

**"Quando Não Usar" é a seção mais valiosa.** Condições concretas e verificáveis,
não hedge. *"Quando o eixo de variação é mais de um"* é útil; *"quando não fizer
sentido"* não é.

**Declare o eixo de cada trade-off.** Uma tabela de prós e contras sem dizer o
que está sendo trocado por quê não decide nada.

**O exemplo real precisa de restrições e números.** E precisa incluir o que deu
errado, não só o desfecho. O caso em que a decisão foi revertida ensina mais que
o caso em que funcionou.

**Nada de afirmação absoluta.** "X é sempre melhor" não sobrevive a nenhum
contexto real.

Proibido: filler motivacional, definição genérica de tutorial, lista de
tecnologias sem análise, seção preenchida para completar template.

Omitir uma seção que não se aplica é correto. Preenchê-la com texto vazio é
violação.

## Depois de escrever

Rode os portões, nesta ordem:

```bash
npm test          # os validadores estão corretos
npm run validate  # o conteúdo passa — sem erro E sem aviso
npm run plan      # plano em dia
npm run roadmap   # roadmap e badges em dia
npm run build     # site constrói nas duas locales
```

**Aviso de densidade não se ignora.** Ele diz que o documento está raso. A
correção é adicionar a seção que faltava — não texto para atingir a contagem. Se
você não consegue identificar o que falta, o documento provavelmente não deveria
estar `status: complete`.

Se `plan` ou `roadmap` alteraram arquivos, eles entram no commit.

## Commit

Uma mensagem que diga **o que foi decidido**, não o que foi feito.

Ruim: `adiciona documento sobre cache`.

Bom: descreve a tese do documento, a condição que ele estabelece para não usar o
que descreve, e qualquer escolha de modelagem que precise ser justificada — por
exemplo, ter usado `foundation` em vez de `concept`, ou ter deixado um conceito
como referência em vez de duplicá-lo.

Se um validador pegou um erro seu durante a escrita, mencione. Isso é o registro
de que os portões estão funcionando.

## Encerrando a iteração

Rode `npm run plan` uma última vez e confirme que a tarefa saiu da lista.

Se sobrou algo pendente — um aviso ignorado, uma referência que você removeu para
não quebrar o build, uma decisão que precisa ser revisitada — **diga
explicitamente** em vez de deixar para o próximo passar.

## Quando parar

Pare e pergunte se:

- A tarefa exige alterar `scripts/curriculum.json` — isso muda o escopo do
  projeto e não é decisão de uma iteração.
- Dois documentos existentes se contradizem — a correção precisa ser decidida,
  não escolhida no meio de outra tarefa.
- Um validador está produzindo falso positivo. Corrija o validador **com teste de
  regressão antes da correção**, e trate isso como a tarefa da iteração.

Não pare por incerteza sobre profundidade ou sobre qual `doc_type` usar. Decida,
justifique no commit, e siga.
