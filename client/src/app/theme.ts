import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: { mode: 'light' },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: ['system-ui', '-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'].join(
      ',',
    ),
  },
  components: {
    MuiTypography: {
      styleOverrides: { root: { fontVariantNumeric: 'tabular-nums' } },
    },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiTable: { defaultProps: { size: 'small' } },
  },
});
