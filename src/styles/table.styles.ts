import type { SxProps, Theme } from "@mui/material";

export const paperStyle: SxProps<Theme> = {
  minHeight: '60vh',
  width: '100%',
  overflow: 'hidden',
};

export const tableContainerStyle: SxProps<Theme> = {
  maxHeight: 440,
  overflowY: 'auto',
};

export const columnsTextStyle: SxProps<Theme> = {
  cursor: 'pointer',
  fontWeight: 600,
  userSelect: 'none',
};

export const chipStyle: SxProps<Theme> = {
  ml: 1,
};
