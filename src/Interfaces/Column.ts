import type { Data } from "./Data";

export interface Column {
  id: keyof Data;
  label: string;
  minWidth?: number;
  align?: 'right';
}