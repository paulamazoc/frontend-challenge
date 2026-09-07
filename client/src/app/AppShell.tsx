import { AppBar, Container, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router';

export function AppShell() {
  return (
    <>
      <AppBar position="static" component="header">
        <Toolbar>
          <Typography variant="h6" component="p">
            Personal Finance Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  );
}
