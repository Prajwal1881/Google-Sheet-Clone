import React from 'react';
import Cell from './Cell';
import { useSheetStore } from '../store/sheetStore';
import { getCellId } from '../utils/cellUtils';

const Grid: React.FC = () => {
  const { dimensions } = useSheetStore();
  const { rows, cols } = dimensions;
  
  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: cols }, (_, i) => 
    String.fromCharCode(65 + i)
  );
  
  return (
    <div className="grid-container overflow-auto flex-1">
      <div className="grid relative">
        {/* Top-left empty cell */}
        <div className="absolute top-0 left-0 w-10 h-8 bg-gray-200 border border-gray-300 z-10"></div>
        
        {/* Column headers */}
        <div className="column-headers absolute top-0 left-10 flex z-10">
          {columnHeaders.map((header, col) => (
            <div
              key={`col-${col}`}
              className="h-8 w-24 bg-gray-200 border border-gray-300 flex items-center justify-center font-semibold"
            >
              {header}
            </div>
          ))}
        </div>
        
        {/* Row headers */}
        <div className="row-headers absolute top-8 left-0 z-10">
          {Array.from({ length: rows }, (_, row) => (
            <div
              key={`row-${row}`}
              className="w-10 h-8 bg-gray-200 border border-gray-300 flex items-center justify-center font-semibold"
            >
              {row + 1}
            </div>
          ))}
        </div>
        
        {/* Grid cells */}
        <div
          className="grid-cells absolute top-8 left-10"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 6rem)`,
            gridTemplateRows: `repeat(${rows}, 2rem)`
          }}
        >
          {Array.from({ length: rows * cols }, (_, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            return <Cell key={getCellId(row, col)} row={row} col={col} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Grid;