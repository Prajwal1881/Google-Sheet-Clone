import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Cell, CellPosition, CellStyle, CellValue, Selection, SheetData, SheetDimensions } from '../types';
import { getCellId, formatCellValue } from '../utils/cellUtils';
import { evaluateFormula, findAndReplace, removeDuplicates } from '../utils/formulaUtils';

interface SheetState {
  data: SheetData;
  dimensions: SheetDimensions;
  selection: Selection | null;
  activeCell: CellPosition | null;
  editingCell: string | null;
  editValue: string;
  undoStack: SheetData[];
  redoStack: SheetData[];
  
  // Actions
  initializeSheet: (rows: number, cols: number) => void;
  setCellValue: (cellId: string, value: string) => void;
  setCellFormula: (cellId: string, formula: string) => void;
  setCellStyle: (cellId: string, style: Partial<CellStyle>) => void;
  setSelection: (selection: Selection | null) => void;
  setActiveCell: (position: CellPosition | null) => void;
  setEditingCell: (cellId: string | null) => void;
  setEditValue: (value: string) => void;
  addRow: (afterRow: number) => void;
  deleteRow: (row: number) => void;
  addColumn: (afterCol: number) => void;
  deleteColumn: (col: number) => void;
  resizeRow: (row: number, height: number) => void;
  resizeColumn: (col: number, width: number) => void;
  findAndReplaceInSelection: (findText: string, replaceText: string) => void;
  removeDuplicatesInSelection: () => { removedCount: number };
  undo: () => void;
  redo: () => void;
}

export const useSheetStore = create<SheetState>()(
  immer((set, get) => ({
    data: {},
    dimensions: { rows: 0, cols: 0 },
    selection: null,
    activeCell: null,
    editingCell: null,
    editValue: '',
    undoStack: [],
    redoStack: [],
    
    initializeSheet: (rows, cols) => {
      set(state => {
        state.dimensions = { rows, cols };
        state.data = {};
        
        // Initialize cells with empty values
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const cellId = getCellId(row, col);
            state.data[cellId] = {
              id: cellId,
              value: null,
              formula: '',
              style: {},
              display: ''
            };
          }
        }
      });
    },
    
    setCellValue: (cellId, value) => {
      const { data } = get();
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      set(state => {
        if (!state.data[cellId]) {
          const { row, col } = getCellPosition(cellId);
          state.data[cellId] = {
            id: cellId,
            value: null,
            formula: '',
            style: {},
            display: ''
          };
        }
        
        // Check if the value is a formula
        if (value.startsWith('=')) {
          state.data[cellId].formula = value;
          const result = evaluateFormula(value, state.data);
          state.data[cellId].value = result;
        } else {
          // Try to convert to number if possible
          const numValue = Number(value);
          state.data[cellId].value = !isNaN(numValue) ? numValue : value;
          state.data[cellId].formula = '';
        }
        
        // Update display value
        state.data[cellId].display = formatCellValue(state.data[cellId]);
        
        // Update dependent cells
        // TODO: Implement dependency tracking and updates
      });
    },
    
    setCellFormula: (cellId, formula) => {
      set(state => {
        if (!state.data[cellId]) {
          const { row, col } = getCellPosition(cellId);
          state.data[cellId] = {
            id: cellId,
            value: null,
            formula: '',
            style: {},
            display: ''
          };
        }
        
        state.data[cellId].formula = formula;
        const result = evaluateFormula(formula, state.data);
        state.data[cellId].value = result;
        state.data[cellId].display = formatCellValue(state.data[cellId]);
      });
    },
    
    setCellStyle: (cellId, style) => {
      set(state => {
        if (!state.data[cellId]) {
          const { row, col } = getCellPosition(cellId);
          state.data[cellId] = {
            id: cellId,
            value: null,
            formula: '',
            style: {},
            display: ''
          };
        }
        
        state.data[cellId].style = {
          ...state.data[cellId].style,
          ...style
        };
      });
    },
    
    setSelection: (selection) => {
      set(state => {
        state.selection = selection;
      });
    },
    
    setActiveCell: (position) => {
      set(state => {
        state.activeCell = position;
        if (position) {
          const cellId = getCellId(position.row, position.col);
          state.editingCell = null;
          state.editValue = state.data[cellId]?.formula || state.data[cellId]?.value?.toString() || '';
        }
      });
    },
    
    setEditingCell: (cellId) => {
      set(state => {
        state.editingCell = cellId;
        if (cellId) {
          state.editValue = state.data[cellId]?.formula || state.data[cellId]?.value?.toString() || '';
        } else {
          state.editValue = '';
        }
      });
    },
    
    setEditValue: (value) => {
      set(state => {
        state.editValue = value;
      });
    },
    
    addRow: (afterRow) => {
      const { dimensions, data } = get();
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      set(state => {
        // Shift all rows below the insertion point down by one
        for (let row = dimensions.rows - 1; row > afterRow; row--) {
          for (let col = 0; col < dimensions.cols; col++) {
            const currentCellId = getCellId(row, col);
            const newCellId = getCellId(row + 1, col);
            
            if (state.data[currentCellId]) {
              state.data[newCellId] = { ...state.data[currentCellId], id: newCellId };
            }
          }
        }
        
        // Initialize the new row with empty cells
        for (let col = 0; col < dimensions.cols; col++) {
          const cellId = getCellId(afterRow + 1, col);
          state.data[cellId] = {
            id: cellId,
            value: null,
            formula: '',
            style: {},
            display: ''
          };
        }
        
        // Update dimensions
        state.dimensions.rows += 1;
      });
    },
    
    deleteRow: (row) => {
      const { dimensions, data } = get();
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      set(state => {
        // Shift all rows below the deleted row up by one
        for (let r = row; r < dimensions.rows - 1; r++) {
          for (let col = 0; col < dimensions.cols; col++) {
            const currentCellId = getCellId(r + 1, col);
            const newCellId = getCellId(r, col);
            
            if (state.data[currentCellId]) {
              state.data[newCellId] = { ...state.data[currentCellId], id: newCellId };
            } else {
              state.data[newCellId] = {
                id: newCellId,
                value: null,
                formula: '',
                style: {},
                display: ''
              };
            }
          }
        }
        
        // Delete the last row
        for (let col = 0; col < dimensions.cols; col++) {
          delete state.data[getCellId(dimensions.rows - 1, col)];
        }
        
        // Update dimensions
        state.dimensions.rows -= 1;
      });
    },
    
    addColumn: (afterCol) => {
      const { dimensions, data } = get();
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      set(state => {
        // Shift all columns to the right of the insertion point right by one
        for (let col = dimensions.cols - 1; col > afterCol; col--) {
          for (let row = 0; row < dimensions.rows; row++) {
            const currentCellId = getCellId(row, col);
            const newCellId = getCellId(row, col + 1);
            
            if (state.data[currentCellId]) {
              state.data[newCellId] = { ...state.data[currentCellId], id: newCellId };
            }
          }
        }
        
        // Initialize the new column with empty cells
        for (let row = 0; row < dimensions.rows; row++) {
          const cellId = getCellId(row, afterCol + 1);
          state.data[cellId] = {
            id: cellId,
            value: null,
            formula: '',
            style: {},
            display: ''
          };
        }
        
        // Update dimensions
        state.dimensions.cols += 1;
      });
    },
    
    deleteColumn: (col) => {
      const { dimensions, data } = get();
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      set(state => {
        // Shift all columns to the right of the deleted column left by one
        for (let c = col; c < dimensions.cols - 1; c++) {
          for (let row = 0; row < dimensions.rows; row++) {
            const currentCellId = getCellId(row, c + 1);
            const newCellId = getCellId(row, c);
            
            if (state.data[currentCellId]) {
              state.data[newCellId] = { ...state.data[currentCellId], id: newCellId };
            } else {
              state.data[newCellId] = {
                id: newCellId,
                value: null,
                formula: '',
                style: {},
                display: ''
              };
            }
          }
        }
        
        // Delete the last column
        for (let row = 0; row < dimensions.rows; row++) {
          delete state.data[getCellId(row, dimensions.cols - 1)];
        }
        
        // Update dimensions
        state.dimensions.cols -= 1;
      });
    },
    
    resizeRow: (row, height) => {
      // This would be implemented with a separate rowHeights state
      // For simplicity, we're not implementing this in the current version
    },
    
    resizeColumn: (col, width) => {
      // This would be implemented with a separate colWidths state
      // For simplicity, we're not implementing this in the current version
    },
    
    findAndReplaceInSelection: (findText, replaceText) => {
      const { data, selection } = get();
      
      if (!selection) return;
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      const newData = findAndReplace(data, selection, findText, replaceText);
      
      set(state => {
        state.data = newData;
      });
    },
    
    removeDuplicatesInSelection: () => {
      const { data, selection } = get();
      
      if (!selection) return { removedCount: 0 };
      
      // Save current state for undo
      set(state => {
        state.undoStack.push(JSON.parse(JSON.stringify(data)));
        state.redoStack = [];
      });
      
      const { newSheetData, removedCount } = removeDuplicates(data, selection);
      
      set(state => {
        state.data = newSheetData;
      });
      
      return { removedCount };
    },
    
    undo: () => {
      const { undoStack } = get();
      
      if (undoStack.length === 0) return;
      
      set(state => {
        const previousState = state.undoStack.pop();
        if (previousState) {
          state.redoStack.push(JSON.parse(JSON.stringify(state.data)));
          state.data = previousState;
        }
      });
    },
    
    redo: () => {
      const { redoStack } = get();
      
      if (redoStack.length === 0) return;
      
      set(state => {
        const nextState = state.redoStack.pop();
        if (nextState) {
          state.undoStack.push(JSON.parse(JSON.stringify(state.data)));
          state.data = nextState;
        }
      });
    }
  }))
);