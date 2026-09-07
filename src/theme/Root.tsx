import React, {type ReactNode} from 'react';
import {Analytics} from '@vercel/analytics/react';

/**
 * `Root` envolve toda a aplicação e não é remontado entre navegações — é onde o
 * Docusaurus documenta que vai o que precisa sobreviver à troca de página.
 *
 * O painel da Vercel entrega a receita de Next.js (`@vercel/analytics/next`),
 * que não se aplica aqui: este site é Docusaurus. O componente genérico de React
 * faz o mesmo trabalho e acompanha a navegação do react-router sozinho.
 *
 * Só reporta no domínio publicado. Em `npm start` e no build local o pacote
 * entra em modo de depuração e não envia nada.
 */
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
