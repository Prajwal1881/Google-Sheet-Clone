import { CellValue, SheetData } from '../types';
import { getCellId, getCellPosition, getCellReferences, getCellRange, isNumeric, toNumber } from './cellUtils';

// Mathematical functions
export const mathFunctions = {
  SUM: (args: CellValue[]): CellValue => {
    return args.reduce((sum, val) => sum + toNumber(val), 0);
  },
  
  AVERAGE: (args: CellValue[]): CellValue => {
    if (args.length === 0) return 0;
    const sum = mathFunctions.SUM(args) as number;
    return sum / args.length;
  },
  
  MAX: (args: CellValue[]): CellValue => {
    const numbers = args
      .filter(val => isNumeric(val))
      .map(val => toNumber(val));
    
    if (numbers.length === 0) return null;
    return Math.max(...numbers);
  },
  
  MIN: (args: CellValue[]): CellValue => {
    const numbers = args
      .filter(val => isNumeric(val))
      .map(val => toNumber(val));
    
    if (numbers.length === 0) return null;
    return Math.min(...numbers);
  },
  
  COUNT: (args: CellValue[]): CellValue => {
    return args.filter(val => isNumeric(val)).length;
  }
};

// Data quality functions
export const dataQualityFunctions = {
  TRIM: (args: CellValue[]): CellValue => {
    if (args.length === 0 || args[0] === null) return '';
    return args[0].toString().trim();
  },
  
  UPPER: (args: CellValue[]): CellValue => {
    if (args.length === 0 || args[0] === null) return '';
    return args[0].toString().toUpperCase();
  },
  
  LOWER: (args: CellValue[]): CellValue => {
    if (args.length === 0 || args[0] === null) return '';
    return args[0].toString().toLowerCase();
  }
};

// All available functions
export const allFunctions = {
  ...mathFunctions,
  ...dataQualityFunctions
};

// Parse and evaluate a formula
export const evaluateFormula = (formula: string, sheetData: SheetData): CellValue => {
  if (!formula.startsWith('=')) {
    return formula;
  }
  
  try {
    const expression = formula.substring(1).trim();
    
    // Check for function calls
    const functionMatch = expression.match(/^([A-Z_]+)\((.+)\)$/);
    if (functionMatch) {
      const [, functionName, argsString] = functionMatch;
      const func = allFunctions[functionName as keyof typeof allFunctions];
      
      if (!func) {
        return `#NAME? (Unknown function: ${functionName})`;
      }
      
      // Handle range references (e.g., A1:B3)
      if (argsString.includes(':')) {
        const cells = getCellRange(argsString, sheetData);
        const values = cells.map(cell => cell.value);
        return func(values);
      }
      
      // Handle comma-separated arguments
      const args = argsString.split(',').map(arg => {
        const trimmedArg = arg.trim();
        
        // Check if the argument is a cell reference
        if (/^[A-Z]+[0-9]+$/.test(trimmedArg)) {
          const cell = sheetData[trimmedArg];
          return cell ? cell.value : null;
        }
        
        // Check if the argument is a number
        if (!isNaN(Number(trimmedArg))) {
          return Number(trimmedArg);
        }
        
        // Otherwise, treat as string
        return trimmedArg;
      });
      
      return func(args);
    }
    
    // Handle cell references
    const cellRefs = getCellReferences(expression);
    let evaluatedExpression = expression;
    
    for (const ref of cellRefs) {
      const cell = sheetData[ref];
      const value = cell ? cell.value : null;
      
      // Replace the cell reference with its value
      evaluatedExpression = evaluatedExpression.replace(
        ref,
        value === null ? '0' : value.toString()
      );
    }
    
    // Evaluate the expression
    // Note: Using eval is not recommended for production code
    // A proper expression parser should be used instead
    return eval(evaluatedExpression);
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR!';
  }
};

// Find and replace text in a range of cells
export const findAndReplace = (
  sheetData: SheetData,
  selection: { start: { row: number; col: number }; end: { row: number; col: number } },
  findText: string,
  replaceText: string
): SheetData => {
  const newSheetData = { ...sheetData };
  
  const startRow = Math.min(selection.start.row, selection.end.row);
  const endRow = Math.max(selection.start.row, selection.end.row);
  const startCol = Math.min(selection.start.col, selection.end.col);
  const endCol = Math.max(selection.start.col, selection.end.col);
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = getCellId(row, col);
      const cell = newSheetData[cellId];
      
      if (cell && typeof cell.value === 'string' && cell.value.includes(findText)) {
        newSheetData[cellId] = {
          ...cell,
          value: cell.value.replaceAll(findText, replaceText)
        };
      }
    }
  }
  
  return newSheetData;
};

// Remove duplicate rows in a selection
export const removeDuplicates = (
  sheetData: SheetData,
  selection: { start: { row: number; col: number }; end: { row: number; col: number } }
): { newSheetData: SheetData; removedCount: number } => {
  const newSheetData = { ...sheetData };
  
  const startRow = Math.min(selection.start.row, selection.end.row);
  const endRow = Math.max(selection.start.row, selection.end.row);
  const startCol = Math.min(selection.start.col, selection.end.col);
  const endCol = Math.max(selection.start.col, selection.end.col);
  
  // Create a map of row signatures to detect duplicates
  const rowSignatures = new Map<string, number>();
  const duplicateRows = new Set<number>();
  
  // First pass: identify duplicate rows
  for (let row = startRow; row <= endRow; row++) {
    let rowSignature = '';
    
    // Create a signature for the row based on cell values
    for (let col = startCol; col <= endCol; col++) {
      const cellId = getCellId(row, col);
      const cell = newSheetData[cellId];
      rowSignature += `${cell?.value || ''}|`;
    }
    
    if (rowSignatures.has(rowSignature)) {
      duplicateRows.add(row);
    } else {
      rowSignatures.set(rowSignature, row);
    }
  }
  
  // Second pass: shift rows up to remove duplicates
  const rowsToShift = Array.from(duplicateRows).sort((a, b) => a - b);
  
  for (const duplicateRow of rowsToShift) {
    // For each row after the duplicate, shift cells up
    for (let row = duplicateRow; row < endRow; row++) {
      for (let col = 0; col <= endCol; col++) {
        const currentCellId = getCellId(row, col);
        const nextCellId = getCellId(row + 1, col);
        
        if (newSheetData[nextCellId]) {
          newSheetData[currentCellId] = { ...newSheetData[nextCellId] };
        } else {
          delete newSheetData[currentCellId];
        }
      }
    }
    
    // Clear the last row
    for (let col = 0; col <= endCol; col++) {
      delete newSheetData[getCellId(endRow, col)];
    }
  }
  
  return {
    newSheetData,
    removedCount: duplicateRows.size
  };
};