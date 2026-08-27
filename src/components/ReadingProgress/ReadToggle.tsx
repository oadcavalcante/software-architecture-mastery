/**
 * Cartão "marcar como lido" — fim de cada documento.
 *
 * O percurso tem mais de 400 documentos: sem marcação, quem volta depois de uma
 * semana não sabe onde parou (SPEC.md §10.1).
 *
 * O cartão ocupa a largura do texto e traz uma chamada explícita. A primeira
 * versão era um botão discreto solto entre a bibliografia e o rodapé, e passava
 * despercebido justamente por quem acabava de ler — o único momento em que ele
 * serve para alguma coisa.
 */

import React from 'react';
import Translate, {translate} from '@docusaurus/Translate';
import {toggleRead} from '@site/src/lib/readingProgress';
import {useIsRead} from './useReadingProgress';
import styles from './styles.module.css';

type Props = {
  /** Id do documento no Docusaurus — estável entre locales, ao contrário da URL. */
  docId: string;
};

export default function ReadToggle({docId}: Props): React.ReactElement {
  const read = useIsRead(docId);

  return (
    <div className={`${styles.card} ${read ? styles.cardRead : ''}`}>
      <div className={styles.prompt}>
        <span className={styles.promptTitle}>
          {read ? (
            <Translate
              id="readingProgress.toggle.doneTitle"
              description="Título do cartão quando o documento já foi lido">
              Documento concluído
            </Translate>
          ) : (
            <Translate
              id="readingProgress.toggle.promptTitle"
              description="Título do cartão convidando a marcar o documento como lido">
              Terminou de ler este documento?
            </Translate>
          )}
        </span>
        <span className={styles.promptHint}>
          <Translate
            id="readingProgress.toggle.hint"
            description="Aviso de que o progresso fica apenas neste navegador">
            Seu progresso fica salvo apenas neste navegador.
          </Translate>
        </span>
      </div>

      <button
        type="button"
        className={`${styles.button} ${read ? styles.buttonRead : ''}`}
        // O rótulo descreve a ação; `aria-pressed` comunica o estado a quem usa
        // leitor de tela, sem depender do símbolo visual.
        aria-pressed={read}
        onClick={() => toggleRead(docId)}
        title={translate({
          id: 'readingProgress.toggle.title',
          message: 'O progresso fica salvo apenas neste navegador',
          description: 'Tooltip do botão de marcar documento como lido',
        })}>
        <span className={styles.check} aria-hidden="true">
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
    </div>
  );
}
