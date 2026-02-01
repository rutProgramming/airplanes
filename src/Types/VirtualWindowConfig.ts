export type VirtualWindowConfig = {
  total: number;
  rowHeight: number;
  initial: number;
  windowSize: number;
  step: number;
  containerRef: React.RefObject<HTMLElement|null>;
};