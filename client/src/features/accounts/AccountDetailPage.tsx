import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router';

export function AccountDetailPage() {
  const { accountId } = useParams();

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography variant="h5" component="h1">
        Account detail
      </Typography>
      <Typography color="text.secondary">
        The transaction ledger for <code>{accountId}</code> goes here.
      </Typography>
      <Button component={RouterLink} to="/accounts" variant="outlined">
        Back to accounts
      </Button>
    </Stack>
  );
}
