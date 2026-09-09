import { Box, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import type { AccountWithBalance } from '@/domain/accounts';
import type { AccountType, IsoDate } from '@/domain/api-types';
import { formatCalendarDate } from '@/domain/date';
import { formatMoney } from '@/domain/money';
import { summarizeAccountBalance } from './accountBalanceSummary';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Chequing',
  savings: 'Savings',
  credit_card: 'Credit card',
  cash: 'Cash',
  investment: 'Investment',
};

interface AccountsListProps {
  accounts: AccountWithBalance[];
  asOf: IsoDate;
}

export function AccountsList({ accounts, asOf }: AccountsListProps) {
  return (
    <Stack spacing={2}>
      <Typography color="text.secondary">Balances as of {formatCalendarDate(asOf)}</Typography>

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        }}
      >
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </Box>
    </Stack>
  );
}

function AccountCard({ account }: { account: AccountWithBalance }) {
  const { balance, currency } = account;
  const summary = summarizeAccountBalance(account);
  const nameId = `account-name-${account.id}`;

  return (
    <Card component="li" variant="outlined">
      <CardActionArea
        component={RouterLink}
        to={`/accounts`}
        aria-labelledby={nameId}
        sx={{ display: 'block', height: '100%', p: 2 }}
      >
        <Stack spacing={1}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}
          >
            <Typography id={nameId} variant="subtitle1" component="h3">
              {account.name}
            </Typography>
            <Chip label={currency} size="small" />
          </Box>

          <Typography variant="body2" color="text.secondary">
            {ACCOUNT_TYPE_LABELS[account.type]}
            {account.institution ? ` · ${account.institution}` : ''}
          </Typography>

          <Box>
            <Typography variant="body2" color="text.secondary" component="p">
              {summary.primaryLabel}
            </Typography>
            <Typography
              variant="h5"
              component="p"
              sx={{ color: summary.primaryAmount < 0 ? 'error.main' : 'text.primary' }}
            >
              {formatMoney(summary.primaryAmount, currency)}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {formatMoney(summary.postedAmount, currency)} posted
            {summary.pendingAmount === 0
              ? ''
              : ` · ${formatMoney(summary.pendingAmount, currency)} pending`}
          </Typography>

          {balance.availableCredit === null ? null : (
            <Typography variant="body2" color="text.secondary">
              {formatMoney(balance.availableCredit, currency)} available credit
            </Typography>
          )}
        </Stack>
      </CardActionArea>
    </Card>
  );
}
