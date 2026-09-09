import { Button, Link, Stack, Typography } from '@mui/material';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Link as RouterLink, Navigate, useParams } from 'react-router';
import { isApiError } from '@/api/errors';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncStates';
import type { AccountWithBalance } from '@/domain/accounts';
import { TransactionLedger } from '@/features/transactions/TransactionLedger';
import { AccountSummary } from './AccountSummary';
import { accountQueryOptions } from './queries';

export function AccountDetailPage() {
  const { accountId } = useParams();

  if (accountId === undefined || accountId === '') {
    return <Navigate to="/accounts" replace />;
  }

  return <AccountDetail accountId={accountId} />;
}

function AccountDetail({ accountId }: { accountId: string }) {
  const account = useQuery(accountQueryOptions(accountId));

  return (
    <Stack spacing={3}>
      <Link component={RouterLink} to="/accounts" variant="body2" sx={{ alignSelf: 'flex-start' }}>
        ← All accounts
      </Link>

      <AccountDetailBody accountId={accountId} account={account} />
    </Stack>
  );
}

interface AccountDetailBodyProps {
  accountId: string;
  account: UseQueryResult<AccountWithBalance>;
}

function AccountDetailBody({ accountId, account }: AccountDetailBodyProps) {
  if (account.isPending) {
    return <LoadingState label="Loading this account details…" />;
  }

  if (account.isError && isApiError(account.error) && account.error.status === 404) {
    return (
      <>
        <Typography variant="h5" component="h1">
          Account not found
        </Typography>
        <EmptyState
          title={`We couldn't find an account "${accountId}".`}
          description={
            <Button component={RouterLink} to="/accounts" variant="outlined" sx={{ mt: 2 }}>
              Back to accounts
            </Button>
          }
        />
      </>
    );
  }

  if (account.isError) {
    return (
      <ErrorState
        title="We couldn't load this account"
        message={
          isApiError(account.error)
            ? account.error.message
            : 'We ran into an issue while loading this account. Please try again later.'
        }
        onRetry={() => {
          void account.refetch();
        }}
      />
    );
  }

  return (
    <>
      <AccountSummary account={account.data} />
      <TransactionLedger accountId={account.data.id} currency={account.data.currency} />
    </>
  );
}
