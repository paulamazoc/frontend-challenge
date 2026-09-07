import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Providers } from './app/Providers';
import { router } from './app/router';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Unable to start: #root element is missing from index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
