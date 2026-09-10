import { Box, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import { ACCOUNT_TYPE_LABELS, type AccountWithBalance } from '@/domain/accounts';
import type { IsoDate } from '@/domain/api-types';
import { formatCalendarDate } from '@/domain/date';
import { formatMoney } from '@/domain/money';
import { summarizeAccountBalance } from './accountBalanceSummary';

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
    <Card component="li">
      <CardActionArea
        component={RouterLink}
        to={`/accounts/${account.id}`}
        aria-labelledby={nameId}
        sx={{ display: 'block', height: '100%', p: 2 }}
      >
        <Stack spacing={1}>
          <Typography id={nameId} variant="subtitle1" component="h3">
            {account.name}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}
          >
            <Chip label={ACCOUNT_TYPE_LABELS[account.type]} size="small" />
            <Chip label={currency} size="small" variant="outlined" />
            {account.institution ? (
              <Typography variant="body2" color="text.secondary">
                {account.institution}
              </Typography>
            ) : null}
          </Stack>

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
