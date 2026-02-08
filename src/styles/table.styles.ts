import type { SxProps, Theme } from "@mui/material";

export const paperStyle: SxProps<Theme> = {
  height: '60vh',
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
  minWidth: 100, 

};

export const chipStyle: SxProps<Theme> = {
  ml: 1,
};
