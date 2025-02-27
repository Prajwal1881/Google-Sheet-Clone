import { Cell, CellPosition, CellValue, Selection, SheetData } from '../types';

// Convert row and column indices to cell ID (e.g., A1, B2)
export const getCellId = (row: number, col: number): string => {
  const colLabel = String.fromCharCode(65 + col);
  return `${colLabel}${row + 1}`;
};

// Convert cell ID to row and column indices
export const getCellPosition = (cellId: string): CellPosition => {
  const colLabel = cellId.charAt(0);
  const col = colLabel.charCodeAt(0) - 65;
  const row = parseInt(cellId.substring(1)) - 1;
  return { row, col };
};

// Get all cells in a selection
export const getCellsInSelection = (
  selection: Selection,
  sheetData: SheetData
): Cell[] => {
  const cells: Cell[] = [];
  const { start, end } = selection;
  
  const startRow = Math.min(start.row, end.row);
  const endRow = Math.max(start.row, end.row);
  const startCol = Math.min(start.col, end.col);
  const endCol = Math.max(start.col, end.col);
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = getCellId(row, col);
      if (sheetData[cellId]) {
        cells.push(sheetData[cellId]);
      }
    }
  }
  
  return cells;
};

// Get cell references from a formula
export const getCellReferences = (formula: string): string[] => {
  // Match cell references like A1, B2, etc.
  const cellRefRegex = /[A-Z]+[0-9]+/g;
  return formula.match(cellRefRegex) || [];
};

// Check if a value is numeric
export const isNumeric = (value: CellValue): boolean => {
  if (value === null) return false;
  if (typeof value === 'number') return true;
  return !isNaN(Number(value));
};

// Convert cell value to number if possible
export const toNumber = (value: CellValue): number => {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Get the range of cells from a range reference (e.g., A1:B3)
export const getCellRange = (range: string, sheetData: SheetData): Cell[] => {
  const [start, end] = range.split(':');
  if (!start || !end) return [];
  
  const startPos = getCellPosition(start);
  const endPos = getCellPosition(end);
  
  return getCellsInSelection(
    { start: startPos, end: endPos },
    sheetData
  );
};

// Format a cell value for display
export const formatCellValue = (cell: Cell): string => {
  if (cell.value === null) return '';
  if (typeof cell.value === 'number') {
    // Format numbers with up to 2 decimal places
    return cell.value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  return cell.value.toString();
};

// Check if a cell is in a selection
export const isCellInSelection = (
  row: number,
  col: number,
  selection: Selection | null
): boolean => {
  if (!selection) return false;
  
  const { start, end } = selection;
  const startRow = Math.min(start.row, end.row);
  const endRow = Math.max(start.row, end.row);
  const startCol = Math.min(start.col, end.col);
  const endCol = Math.max(start.col, end.col);
  
  return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
};

// Get the value of a cell, resolving formulas if needed
export const getCellValue = (
  cellId: string,
  sheetData: SheetData,
  visited: Set<string> = new Set()
): CellValue => {
  const cell = sheetData[cellId];
  if (!cell) return null;
  
  // If the cell has no formula, return its value
  if (!cell.formula || cell.formula === '') {
    return cell.value;
  }
  
  // Prevent circular references
  if (visited.has(cellId)) {
    return '#CIRCULAR!';
  }
  
  visited.add(cellId);
  
  // TODO: Implement formula evaluation
  // For now, just return the cell value
  return cell.value;
};