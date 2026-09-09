import type { ReactNode } from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';

/**
 * The loading, error and empty states shared by async screens. They carry no
 * domain knowledge 
 */

export function LoadingState({ label }: { label: string }) {
  return (
    <Box
      role="status"
      aria-busy="true"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, py: 8 }}
    >
      <CircularProgress size={24} aria-hidden />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}

export function EmptyState({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      {description ? <Typography color="text.secondary">{description}</Typography> : null}
    </Paper>
  );
}
