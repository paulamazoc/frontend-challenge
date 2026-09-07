import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: { mode: 'light' },
  typography: {
    fontFamily: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'].join(
      ',',
    ),
  },
});
