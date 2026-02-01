export type Filters = Partial<{
  id: string;
  types: string[];
  capacityFrom: number;
  capacityTo: number;
  sizeFrom: number;
  sizeTo: number;
}>;
