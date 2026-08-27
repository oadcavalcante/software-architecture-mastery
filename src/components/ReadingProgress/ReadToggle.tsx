/**
 * Botão "marcar como lido" — renderizado no rodapé de cada documento.
 *
 * Ele existe porque o percurso tem mais de 400 documentos: sem marcação, quem
 * volta depois de uma semana não sabe onde parou (SPEC.md §10.1).
 */

import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {toggleRead} from '@site/src/lib/readingProgress';
import {useIsRead} from './useReadingProgress';
import styles from './styles.module.css';

type Props = {
  /** `id` do front matter — estável entre locales, ao contrário da URL. */
  docId: string;
};

export default function ReadToggle({docId}: Props): React.ReactElement {
  const read = useIsRead(docId);

  return (
    <button
      type="button"
      className={`${styles.toggle} ${read ? styles.toggleRead : ''}`}
      // O rótulo já descreve a ação; `aria-pressed` comunica o estado a quem usa
      // leitor de tela sem depender do símbolo visual.
      aria-pressed={read}
      onClick={() => toggleRead(docId)}
      title={translate({
        id: 'readingProgress.toggle.title',
        message: 'O progresso fica salvo apenas neste navegador',
        description: 'Tooltip do botão de marcar documento como lido',
      })}>
      <span className={`${styles.box} ${read ? styles.boxChecked : ''}`} aria-hidden="true">
        {read ? '✓' : ''}
      </span>
      {read ? (
        <Translate
          id="readingProgress.toggle.read"
          description="Rótulo do botão quando o documento já foi lido">
          Lido
        </Translate>
      ) : (
        <Translate
          id="readingProgress.toggle.unread"
          description="Rótulo do botão quando o documento ainda não foi lido">
          Marcar como lido
        </Translate>
      )}
    </button>
  );
}
