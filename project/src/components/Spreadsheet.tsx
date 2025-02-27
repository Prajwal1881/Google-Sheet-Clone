import React, { useEffect } from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';
import FunctionHelp from './FunctionHelp';
import { useSheetStore } from '../store/sheetStore';
import { getCellId } from '../utils/cellUtils';

const Spreadsheet: React.FC = () => {
  const { 
    initializeSheet, 
    setCellValue, 
    activeCell, 
    setEditValue, 
    setEditingCell, 
    setActiveCell 
  } = useSheetStore();
  
  // Initialize the sheet with 50 rows and 26 columns (A-Z)
  useEffect(() => {
    initializeSheet(50, 26);
    
    // Add some sample data
    setCellValue('A1', 'Product');
    setCellValue('B1', 'Quantity');
    setCellValue('C1', 'Price');
    setCellValue('D1', 'Total');
    
    setCellValue('A2', 'Apples');
    setCellValue('B2', '10');
    setCellValue('C2', '1.5');
    setCellValue('D2', '=B2*C2');
    
    setCellValue('A3', 'Bananas');
    setCellValue('B3', '5');
    setCellValue('C3', '0.75');
    setCellValue('D3', '=B3*C3');
    
    setCellValue('A4', 'Oranges');
    setCellValue('B4', '8');
    setCellValue('C4', '1.2');
    setCellValue('D4', '=B4*C4');
    
    setCellValue('D5', '=SUM(D2:D4)');
    setCellValue('B5', '=SUM(B2:B4)');
    setCellValue('B6', '=AVERAGE(B2:B4)');
    setCellValue('C6', '=AVERAGE(C2:C4)');
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return;
      
      const { row, col } = activeCell;
      
      switch (e.key) {
        case 'ArrowUp':
          if (row > 0) {
            e.preventDefault();
            setActiveCell({ row: row - 1, col });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveCell({ row: row + 1, col });
          break;
        case 'ArrowLeft':
          if (col > 0) {
            e.preventDefault();
            setActiveCell({ row, col: col - 1 });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          setActiveCell({ row, col: col + 1 });
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCell]);
  
  // Handle function insertion
  const handleInsertFunction = (functionName: string) => {
    if (!activeCell) return;
    
    const cellId = getCellId(activeCell.row, activeCell.col);
    setEditValue(`=${functionName}()`);
    setEditingCell(cellId);
  };
  
  return (
    <div className="spreadsheet flex flex-col h-screen">
      <Toolbar />
      <div className="flex items-center px-2 py-1 border-b border-gray-300">
        <FormulaBar />
        <div className="ml-2">
          <FunctionHelp onInsertFunction={handleInsertFunction} />
        </div>
      </div>
      <Grid />
    </div>
  );
};

export default Spreadsheet;