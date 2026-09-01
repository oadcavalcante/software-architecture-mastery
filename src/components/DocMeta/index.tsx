/**
 * Linha de metadados acima do título do documento.
 *
 * O front matter carrega `doc_type` e `difficulty` em 100% dos 446 documentos,
 * validados em CI (SPEC.md §7.9), e nada disso aparecia na interface. As duas
 * respondem a perguntas que o leitor faz antes de começar: que tipo de
 * documento é este — conceito, padrão, exercício, case — e o quanto ele exige.
 *
 * O nível não entra aqui porque a trilha de navegação já o mostra ("Nível 01 —
 * Fundamentos"), e repeti-lo seria ruído.
 *
 * `doc_type` é neutro de idioma e por isso é traduzido aqui. `difficulty` já
 * vem traduzido no próprio documento — "avançado" em pt-BR, "advanced" em
 * en-US —, então é exibido como está.
 */

import React from 'react';
import {translate} from '@docusaurus/Translate';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

type LearningFrontMatter = {
  doc_type?: string;
  difficulty?: string;
};

/** Rótulo por `doc_type`. `index` fica de fora: índices trazem o painel de progresso. */
function typeLabels(): Record<string, string> {
  return {
    concept: translate({id: 'sam.docType.concept', message: 'Conceito'}),
    pattern: translate({id: 'sam.docType.pattern', message: 'Padrão'}),
    foundation: translate({id: 'sam.docType.foundation', message: 'Fundamento'}),
    tradeoff: translate({id: 'sam.docType.tradeoff', message: 'Trade-off'}),
    'case-study': translate({id: 'sam.docType.caseStudy', message: 'Case'}),
    exercise: translate({id: 'sam.docType.exercise', message: 'Exercício'}),
    adr: translate({id: 'sam.docType.adr', message: 'ADR'}),
    reference: translate({id: 'sam.docType.reference', message: 'Referência'}),
  };
}

export default function DocMeta(): React.ReactElement | null {
  const {frontMatter} = useDoc();
  const {doc_type: docType, difficulty} = frontMatter as LearningFrontMatter;

  const type = docType ? typeLabels()[docType] : undefined;
  if (!type && !difficulty) {
    return null;
  }

  return (
    <p className={styles.meta}>
      {type && <span>{type}</span>}
      {type && difficulty && (
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
      )}
      {difficulty && <span className={styles.difficulty}>{difficulty}</span>}
    </p>
  );
}
