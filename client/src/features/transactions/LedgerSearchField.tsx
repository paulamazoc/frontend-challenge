import { useEffect, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';

const DEBOUNCE_MS = 300;

interface LedgerSearchFieldProps {
  query: string;
  onCommit: (query: string) => void;
}

export function LedgerSearchField({ query, onCommit }: LedgerSearchFieldProps) {
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    if (query !== draft.trim()) {
      setDraft(query);
    }
  }, [query]);

  useEffect(() => {
    if (draft.trim() === query) return;

    const timer = window.setTimeout(() => onCommit(draft.trim()), DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draft, query, onCommit]);

  return (
    <TextField
      type="search"
      size="small"
      label="Search transactions"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      placeholder="Search by description"
      sx={{
        width: { xs: '100%', sm: 320 },
        '& input[type="search"]::-webkit-search-cancel-button': {
          display: 'none',
        },
      }}
      slotProps={{
        input: {
          endAdornment:
            draft === '' ? undefined : (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Clear search"
                  size="small"
                  edge="end"
                  onClick={() => {
                    setDraft('');
                    onCommit('');
                  }}
                >
                  <span aria-hidden style={{ fontSize: '1rem', lineHeight: 1 }}>
                    ✕
                  </span>
                </IconButton>
              </InputAdornment>
            ),
        },
      }}
    />
  );
}
