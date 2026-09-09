import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { ACCOUNT_TYPE_LABELS, type AccountWithBalance } from '@/domain/accounts';
import type { Minor } from '@/domain/api-types';
import { formatCalendarDate } from '@/domain/date';
import { formatMoney } from '@/domain/money';
import { summarizeAccountBalance } from './accountBalanceSummary';

/**
 * The account context above the ledger: what this account is, and what it is
 * worth right now.
 */
export function AccountSummary({ account }: { account: AccountWithBalance }) {
  const { balance, currency } = account;
  const summary = summarizeAccountBalance(account);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5" component="h1">
            {account.name}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
          >
            <Chip label={ACCOUNT_TYPE_LABELS[account.type]} size="small" />
            <Chip label={currency} size="small" variant="outlined" />
            {account.institution ? (
              <Typography variant="body2" color="text.secondary">
                {account.institution}
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="body2" color="text.secondary" component="p">
            {summary.primaryLabel}
          </Typography>
          <Typography
            variant="h4"
            component="p"
            sx={{
              color: summary.primaryAmount < 0 ? 'error.main' : 'text.primary',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatMoney(summary.primaryAmount, currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            as of {formatCalendarDate(balance.asOf)}
          </Typography>
        </Box>

        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          <BalanceFigure label="Posted" amount={summary.postedAmount} currency={currency} />
          <BalanceFigure label="Pending" amount={summary.pendingAmount} currency={currency} />
          {balance.availableCredit === null ? null : (
            <BalanceFigure
              label="Available credit"
              amount={balance.availableCredit}
              currency={currency}
            />
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

interface BalanceFigureProps {
  label: string;
  amount: Minor;
  currency: AccountWithBalance['currency'];
}

function BalanceFigure({ label, amount, currency }: BalanceFigureProps) {
  return (
    <Box>
      <Typography component="dt" variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="subtitle1" sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}>
        {formatMoney(amount, currency)}
      </Typography>
    </Box>
  );
}
