import { Typography } from '@mui/material';
import { createBrowserRouter, Navigate } from 'react-router';
import { AccountsPage } from '@/features/accounts/AccountsPage';
import { AppShell } from './AppShell';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/accounts" replace /> },
      { path: 'accounts', element: <AccountsPage /> },
      {
        path: '*',
        element: (
          <Typography variant="h5" component="h1">
            Page not found
          </Typography>
        ),
      },
    ],
  },
]);
