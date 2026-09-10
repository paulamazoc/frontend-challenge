import { Button, Stack, TextField } from '@mui/material';
import type { IsoDate } from '@/domain/api-types';
import { isCalendarDate } from '@/domain/date';

interface AsOfDateControlProps {
  value?: IsoDate;
  onChange: (next: IsoDate | undefined) => void;
}

export function AsOfDateControl({ value, onChange }: AsOfDateControlProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <TextField
        type="date"
        size="small"
        label="As of"
        value={value ?? ''}
        onChange={(event) => {
          const next = event.target.value;
          if (next === '') {
            onChange(undefined);
            return;
          }
          if (isCalendarDate(next)) {
            onChange(next);
          }
        }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Button variant="outlined" size="small" disabled={value === undefined} onClick={() => onChange(undefined)}>
        Today
      </Button>
    </Stack>
  );
}
