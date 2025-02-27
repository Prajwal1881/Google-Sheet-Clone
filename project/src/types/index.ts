export type CellValue = string | number | null;

export type CellStyle = {
  bold?: boolean;
  italic?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
};

export type Cell = {
  id: string;
  value: CellValue;
  formula: string;
  style: CellStyle;
  display?: string;
};

export type SheetData = {
  [key: string]: Cell;
};

export type SheetDimensions = {
  rows: number;
  cols: number;
};

export type Selection = {
  start: { row: number; col: number };
  end: { row: number; col: number };
  active?: { row: number; col: number };
};

export type CellPosition = {
  row: number;
  col: number;
};

export type FunctionType = 'math' | 'dataQuality';

export type SheetFunction = {
  name: string;
  type: FunctionType;
  description: string;
  execute: (args: CellValue[]) => CellValue;
};