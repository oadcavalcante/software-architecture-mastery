/**
 * Botão de recolher a barra lateral.
 *
 * Ejetado do tema só para trocar o ícone: o original usa uma seta, que não diz
 * o que se move. Comportamento, rótulo e traduções permanecem os do tema.
 */

import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import PanelIcon from '@site/src/components/PanelIcon';
import styles from './styles.module.css';

export default function CollapseButton({
  onClick,
}: {
  onClick: React.MouseEventHandler;
}): React.ReactElement {
  const rotulo = translate({
    id: 'theme.docs.sidebar.collapseButtonTitle',
    message: 'Recolher painel lateral',
    description: 'The title attribute for collapse button of doc sidebar',
  });
  return (
    <button
      type="button"
      title={rotulo}
      aria-label={rotulo}
      className={clsx('clean-btn', styles.collapse)}
      onClick={onClick}>
      <PanelIcon direcao="fechar" />
      <span className={styles.rotulo}>{rotulo}</span>
    </button>
  );
}
