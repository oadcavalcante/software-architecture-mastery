/**
 * Ícone de painel lateral.
 *
 * O tema usa uma seta para recolher e expandir a barra lateral. Seta sozinha
 * não diz o que se move — pode ser voltar, pode ser paginar. O ícone de painel
 * mostra a coluna e o sentido em que ela vai, que é a convenção corrente para
 * este controle.
 */

import React from 'react';

type Props = {
  /** `fechar` aponta para dentro; `abrir` aponta para fora. */
  direcao: 'fechar' | 'abrir';
  className?: string;
};

export default function PanelIcon({direcao, className}: Props): React.ReactElement {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <path d={direcao === 'fechar' ? 'M16.5 15 13.5 12l3-3' : 'M13.5 9l3 3-3 3'} />
    </svg>
  );
}
