import React, {type ReactNode} from 'react';
import {Analytics} from '@vercel/analytics/react';
import {SpeedInsights} from '@vercel/speed-insights/react';

/**
 * `Root` envolve toda a aplicação e não é remontado entre navegações — é onde o
 * Docusaurus documenta que vai o que precisa sobreviver à troca de página.
 *
 * O painel da Vercel entrega a receita de Next.js (`@vercel/analytics/next`),
 * que não se aplica aqui: este site é Docusaurus. Os componentes genéricos de
 * React fazem o mesmo trabalho e acompanham a navegação do react-router sozinhos.
 *
 * São dois, e medem coisas diferentes. `Analytics` conta quem chega e por onde;
 * `SpeedInsights` mede o que o leitor sente — as métricas de carregamento por
 * página, que num acervo de 446 documentos é o número que diz quais páginas
 * estão pesadas e quais não.
 *
 * Só reportam no domínio publicado. Em `npm start` e no build local os dois
 * entram em modo de depuração e não enviam nada.
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
