import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { isApiError } from '@/api/errors';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncStates';
import type { IsoDate } from '@/domain/api-types';
import { AccountsList } from './AccountsList';
import { AsOfDateControl } from './AsOfDateControl';
import { accountsParamsToSearch, parseAccountsParams } from './accountsSearchParams';
import { accountsQueryOptions } from './queries';

export function AccountsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { asOf } = parseAccountsParams(searchParams);

  const setAsOf = (next: IsoDate | undefined) => {
    setSearchParams(accountsParamsToSearch({ asOf: next }), { replace: true });
  };

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          Accounts
        </Typography>

        <AsOfDateControl value={asOf} onChange={setAsOf} />
      </Stack>

      <AccountsContent asOf={asOf} />
    </>
  );
}

function AccountsContent({ asOf }: { asOf?: IsoDate }) {
  const accounts = useQuery(accountsQueryOptions(asOf !== undefined ? { asOf } : {}));

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

  const { data, meta } = accounts.data;

  if (data.length === 0) {
    return (
      <EmptyState
        title="No accounts yet"
        description="Accounts you add will appear here with their current balance."
      />
    );
  }

  return <AccountsList accounts={data} asOf={meta.asOf} />;
}
