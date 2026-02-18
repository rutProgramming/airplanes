import type { Airplane } from "./airplane";

export type Column= {
  id: keyof Airplane;
  label: string;
  width: number;
}