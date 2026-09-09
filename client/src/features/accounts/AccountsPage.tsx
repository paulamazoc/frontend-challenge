import { Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncStates';
import { accountsQueryOptions } from './queries';

export function AccountsPage() {
  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Accounts
      </Typography>
      <AccountsContent />
    </>
  );
}

function AccountsContent() {
  const accounts = useQuery(accountsQueryOptions());

  if (accounts.isPending) {
    return <LoadingState label="Loading your accounts…" />;
  }

  if (accounts.isError) {
    return (
      <ErrorState
        title="We couldn't load your accounts"
        message={
          isApiError(accounts.error)
            ? accounts.error.message
            : 'We run into an issue while loading your accounts. Please, try again later.'
        }
        onRetry={() => {
          void accounts.refetch();
        }}
      />
    );
  }

  const { data } = accounts.data;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No accounts yet"
        description="Accounts you add will appear here with their current balance."
      />
    );
  }

  return <p>Accounts list goes here</p>;
}
