import type { Data } from "./Data";

export type Column= {
  id: keyof Data;
  label: string;
  width: number;
}