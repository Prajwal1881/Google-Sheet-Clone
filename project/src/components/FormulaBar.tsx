import React from 'react';
import { useSheetStore } from '../store/sheetStore';
import { getCellId } from '../utils/cellUtils';

const FormulaBar: React.FC = () => {
  const {
    activeCell,
    editValue,
    setEditValue,
    setCellValue,
    setEditingCell
  } = useSheetStore();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activeCell) {
      const cellId = getCellId(activeCell.row, activeCell.col);
      setCellValue(cellId, editValue);
    }
  };
  
  const handleFocus = () => {
    if (activeCell) {
      const cellId = getCellId(activeCell.row, activeCell.col);
      setEditingCell(cellId);
    }
  };
  
  return (
    <div className="formula-bar flex items-center h-10 border-b border-gray-300 px-2">
      <div className="cell-reference w-10 h-8 bg-gray-200 border border-gray-300 flex items-center justify-center mr-2">
        {activeCell ? getCellId(activeCell.row, activeCell.col) : ''}
      </div>
      <div className="flex-1">
        <input
          type="text"
          className="w-full h-8 px-2 border border-gray-300"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Enter a value or formula (e.g., =SUM(A1:A5))"
          disabled={!activeCell}
        />
      </div>
    </div>
  );
};

export default FormulaBar;