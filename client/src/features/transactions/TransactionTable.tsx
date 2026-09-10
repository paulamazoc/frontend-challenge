import type { ReactNode } from 'react';
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import type { TransactionSort } from '@/api/transactions';
import type { CurrencyCode, Transaction } from '@/domain/api-types';
import { formatCalendarDate } from '@/domain/date';
import { formatMoney } from '@/domain/money';
import { transactionAmountDirection } from './transactionAmount';

interface TransactionTableProps {
  transactions: Transaction[];
  currency: CurrencyCode;
  sort: TransactionSort;
  onSortChange: (sort: TransactionSort) => void;
  /** A newer page is in flight while the previous one stays on screen. */
  busy: boolean;
  labelledBy: string;
}

export function TransactionTable({
  transactions,
  currency,
  sort,
  onSortChange,
  busy,
  labelledBy,
}: TransactionTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" aria-busy={busy}>
      <Table
        aria-labelledby={labelledBy}
        sx={{ opacity: busy ? 0.5 : 1, transition: 'opacity 150ms' }}
      >
        <TableHead>
          <TableRow>
            <SortableHeader field="date" sort={sort} onSortChange={onSortChange}>
              Date
            </SortableHeader>

            <TableCell>Description</TableCell>

            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Category</TableCell>

            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>

            <SortableHeader field="amount" sort={sort} onSortChange={onSortChange} align="right">
              Amount ({currency})
            </SortableHeader>
          </TableRow>
        </TableHead>

        <TableBody>
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { amount, category, currency, date, description, merchant, status } = transaction;
  const categoryName = category?.name ?? null;

  return (
    <TableRow hover>
      <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>
        <time dateTime={date}>{formatCalendarDate(date)}</time>
      </TableCell>

      <TableCell sx={{ verticalAlign: 'top' }}>
        <Typography variant="body2" component="span" sx={{ display: 'block' }}>
          {description}
        </Typography>

        {merchant !== null && merchant !== description ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {merchant}
          </Typography>
        ) : null}

        {/* Where the hidden Category and Status columns reappear. */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {categoryName ?? 'Uncategorised'}
        </Typography>

        {status === 'pending' ? (
          <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.5 }}>
            <PendingChip />
          </Box>
        ) : null}
      </TableCell>

      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, verticalAlign: 'top' }}>
        {categoryName === null ? (
          <Typography variant="body2" color="text.disabled">
            Uncategorised
          </Typography>
        ) : (
          <Typography variant="body2">{categoryName}</Typography>
        )}
      </TableCell>

      {/*
        Only pending rows carry a chip.
      */}
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, verticalAlign: 'top' }}>
        {status === 'pending' ? <PendingChip /> : null}
      </TableCell>

      <TableCell
        align="right"
        sx={{
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
          fontVariantNumeric: 'tabular-nums',
          // The sign carries the direction; colour only reinforces the arriving
          // side.
          color: transactionAmountDirection(amount) === 'inflow' ? 'success.main' : 'text.primary',
        }}
      >
        {formatMoney(amount, currency)}
      </TableCell>
    </TableRow>
  );
}

function PendingChip() {
  return <Chip label="Pending" size="small" color="warning" />;
}

interface SortableHeaderProps {
  field: 'date' | 'amount';
  sort: TransactionSort;
  onSortChange: (sort: TransactionSort) => void;
  align?: 'right';
  children: ReactNode;
}

function SortableHeader({ field, sort, onSortChange, align, children }: SortableHeaderProps) {
  const active = sort === field || sort === `-${field}`;
  const direction = sort.startsWith('-') ? 'desc' : 'asc';

  return (
    <TableCell align={align} sortDirection={active ? direction : false}>
      <TableSortLabel
        active={active}
        direction={active ? direction : 'desc'}
        onClick={() => onSortChange(nextSort(field, sort))}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );
}

function nextSort(field: 'date' | 'amount', current: TransactionSort): TransactionSort {
  if (current === `-${field}`) return field;

  return `-${field}`;
}
