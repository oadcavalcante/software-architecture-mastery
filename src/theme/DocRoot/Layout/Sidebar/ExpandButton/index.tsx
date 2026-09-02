/**
 * Faixa que reabre a barra lateral recolhida.
 *
 * Ejetado do tema pela mesma razão do botão de recolher: trocar a seta pelo
 * ícone de painel, que diz o que vai se mover.
 */

import React from 'react';
import {translate} from '@docusaurus/Translate';
import PanelIcon from '@site/src/components/PanelIcon';
import styles from './styles.module.css';

export default function DocRootLayoutSidebarExpandButton({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}): React.ReactElement {
  const rotulo = translate({
    id: 'theme.docs.sidebar.expandButtonTitle',
    message: 'Abrir painel lateral',
    description:
      'The ARIA label and title attribute for expand button of doc sidebar',
  });
  return (
    <div
      className={styles.expand}
      title={rotulo}
      aria-label={rotulo}
      tabIndex={0}
      role="button"
      onKeyDown={toggleSidebar}
      onClick={toggleSidebar}>
      <PanelIcon direcao="abrir" />
    </div>
  );
}
