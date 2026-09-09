import { useCallback } from 'react';
import { Box, Button, Stack, TablePagination, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { isApiError } from '@/api/errors';
import type { TransactionSort } from '@/api/transactions';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/AsyncStates';
import type { CurrencyCode, ListMeta, Transaction } from '@/domain/api-types';
import { LedgerSearchField } from './LedgerSearchField';
import { TransactionTable } from './TransactionTable';
import {
  PAGE_SIZES,
  applyLedgerChange,
  ledgerParamsToSearch,
  parseLedgerParams,
  type LedgerParams,
  type PageSize,
} from './ledgerSearchParams';
import { transactionsQueryOptions } from './queries';

const HEADING_ID = 'transaction-ledger-heading';

interface TransactionLedgerProps {
  accountId: string;
  currency: CurrencyCode;
}

/**
 * The ledger for one account. It owns its navigational state in the URL and
 * knows nothing about balances: the account screen composes it, and the two
 * only share the account id and the currency the amounts are stated in.
 */
export function TransactionLedger({ accountId, currency }: TransactionLedgerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = parseLedgerParams(searchParams);

  const change = useCallback(
    (patch: Partial<LedgerParams>, { replace = false } = {}) => {
      setSearchParams(
        (current) => ledgerParamsToSearch(applyLedgerChange(parseLedgerParams(current), patch)),
        { replace },
      );
    },
    [setSearchParams],
  );

  // Debounced keystrokes replace rather than push, so Back leaves the ledger
  // instead of walking the search term backwards.
  const onSearch = useCallback((q: string) => change({ q }, { replace: true }), [change]);
  const onSortChange = useCallback((sort: TransactionSort) => change({ sort }), [change]);

  const transactions = useQuery(transactionsQueryOptions({ accountId, ...params }));

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="h2" id={HEADING_ID}>
          Transactions
        </Typography>
        <LedgerSearchField query={params.q} onCommit={onSearch} />
      </Box>

      {/*
        Transactions summary
      */}
      <Box role="status" aria-live="polite" sx={{ minHeight: '1.25rem' }}>
        <Typography variant="body2" color="text.secondary">
          {transactions.data ? summarise(transactions.data.meta, params.q) : ''}
        </Typography>
      </Box>

      {transactions.isPending ? <LoadingState label="Loading transactions…" /> : null}

      {transactions.isError ? (
        <ErrorState
          title="We couldn't load these transactions"
          message={
            isApiError(transactions.error)
              ? transactions.error.message
              : 'We ran into an issue while loading this ledger. Please try again later.'
          }
          onRetry={() => {
            void transactions.refetch();
          }}
        />
      ) : null}

      {transactions.data ? (
        <LedgerResults
          data={transactions.data.data}
          meta={transactions.data.meta}
          currency={currency}
          params={params}
          busy={transactions.isFetching}
          onSortChange={onSortChange}
          onChange={change}
        />
      ) : null}
    </Stack>
  );
}

interface LedgerResultsProps {
  data: Transaction[];
  meta: ListMeta;
  currency: CurrencyCode;
  params: LedgerParams;
  busy: boolean;
  onSortChange: (sort: TransactionSort) => void;
  onChange: (patch: Partial<LedgerParams>) => void;
}

function LedgerResults({
  data,
  meta,
  currency,
  params,
  busy,
  onSortChange,
  onChange,
}: LedgerResultsProps) {
  return (
    <>
      {data.length === 0 ? (
        <NoRows total={meta.total} query={params.q} onClearSearch={() => onChange({ q: '' })} />
      ) : (
        <TransactionTable
          transactions={data}
          currency={currency}
          sort={params.sort}
          onSortChange={onSortChange}
          busy={busy}
          labelledBy={HEADING_ID}
        />
      )}

      {/*
        Kept whenever the ledger has rows at all, including when this particular
        page has none — that is what gets a hand-edited page number back.
      */}
      {meta.total > 0 ? (
        <TablePagination
          component="div"
          count={meta.total}
          // Clamped so a page past the end still renders a coherent control.
          page={Math.min(meta.page, meta.totalPages) - 1}
          rowsPerPage={meta.pageSize}
          rowsPerPageOptions={[...PAGE_SIZES]}
          labelRowsPerPage="Rows per page"
          onPageChange={(_event, zeroBasedPage) => onChange({ page: zeroBasedPage + 1 })}
          onRowsPerPageChange={(event) =>
            onChange({ pageSize: Number(event.target.value) as PageSize })
          }
        />
      ) : null}
    </>
  );
}

/**
 * Three different reasons for an empty table, told apart because users read the
 * middle one as a broken screen.
 */
function NoRows({
  total,
  query,
  onClearSearch,
}: {
  total: number;
  query: string;
  onClearSearch: () => void;
}) {
  if (total === 0 && query !== '') {
    return (
      <EmptyState
        title="No matching transactions"
        description={
          <>
            Nothing on this account matches "{query}"". Try a another search.
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" onClick={onClearSearch}>
                Clear search
              </Button>
            </Box>
          </>
        }
      />
    );
  }

  if (total === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Transactions on this account will appear here."
      />
    );
  }

  return (
    <EmptyState
      title="Nothing on this page"
      description="This page is past the end of the ledger. Use the pagination below to go back."
    />
  );
}

function summarise(meta: ListMeta, query: string): string {
  const matching = query === '' ? '' : ` matching “${query}”`;

  if (meta.total === 0) {
    return `No transactions${matching}.`;
  }

  if (meta.count === 0) {
    return `No transactions on this page. ${meta.total.toLocaleString()} in total${matching}.`;
  }

  const first = (meta.offset + 1).toLocaleString();
  const last = (meta.offset + meta.count).toLocaleString();

  return `Showing ${first}–${last} of ${meta.total.toLocaleString()} transactions${matching}.`;
}
