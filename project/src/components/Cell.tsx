import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useSheetStore } from '../store/sheetStore';
import { getCellId } from '../utils/cellUtils';

interface CellProps {
  row: number;
  col: number;
}

const Cell: React.FC<CellProps> = ({ row, col }) => {
  const cellId = getCellId(row, col);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    data,
    selection,
    activeCell,
    editingCell,
    editValue,
    setCellValue,
    setSelection,
    setActiveCell,
    setEditingCell,
    setEditValue
  } = useSheetStore();
  
  const cell = data[cellId] || {
    id: cellId,
    value: null,
    formula: '',
    style: {},
    display: ''
  };
  
  const isSelected = selection && 
    row >= Math.min(selection.start.row, selection.end.row) &&
    row <= Math.max(selection.start.row, selection.end.row) &&
    col >= Math.min(selection.start.col, selection.end.col) &&
    col <= Math.max(selection.start.col, selection.end.col);
  
  const isActive = activeCell && activeCell.row === row && activeCell.col === col;
  const isEditing = editingCell === cellId;
  
  // Handle cell click
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && activeCell) {
      // Extend selection
      setSelection({
        start: activeCell,
        end: { row, col },
        active: activeCell
      });
    } else {
      // Start new selection
      setSelection({
        start: { row, col },
        end: { row, col }
      });
      setActiveCell({ row, col });
    }
  };
  
  // Handle double click to edit
  const handleDoubleClick = () => {
    setEditingCell(cellId);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Handle mouse down for drag selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    // Start selection
    setSelection({
      start: { row, col },
      end: { row, col }
    });
    setActiveCell({ row, col });
    
    // Add mouse move and mouse up handlers
    const handleMouseMove = (e: MouseEvent) => {
      // Get the element under the mouse
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element && element.getAttribute('data-cell-id')) {
        const targetCellId = element.getAttribute('data-cell-id') as string;
        const [colStr, rowStr] = targetCellId.match(/([A-Z]+)(\d+)/)?.slice(1) || [];
        
        if (colStr && rowStr) {
          const targetCol = colStr.charCodeAt(0) - 65;
          const targetRow = parseInt(rowStr) - 1;
          
          setSelection({
            start: { row, col },
            end: { row: targetRow, col: targetCol },
            active: { row, col }
          });
        }
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle key down in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Commit changes
      setCellValue(cellId, editValue);
      setEditingCell(null);
      
      // Move to the cell below
      setActiveCell({ row: row + 1, col });
    } else if (e.key === 'Escape') {
      // Cancel editing
      setEditingCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      // Commit changes
      setCellValue(cellId, editValue);
      setEditingCell(null);
      
      // Move to the next cell
      setActiveCell({ row, col: col + 1 });
    }
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  // Apply cell styles
  const cellStyle = {
    fontWeight: cell.style.bold ? 'bold' : 'normal',
    fontStyle: cell.style.italic ? 'italic' : 'normal',
    fontSize: cell.style.fontSize ? `${cell.style.fontSize}px` : undefined,
    color: cell.style.color || undefined,
    backgroundColor: cell.style.backgroundColor || undefined,
    textAlign: cell.style.textAlign || 'left'
  };
  
  return (
    <div
      className={classNames(
        'cell relative border border-gray-300 p-1 h-8 overflow-hidden whitespace-nowrap',
        {
          'bg-blue-100': isSelected && !isActive,
          'bg-blue-200 z-10': isActive,
          'border-blue-500': isActive || isSelected
        }
      )}
      style={cellStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      data-cell-id={cellId}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full outline-none bg-white"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setCellValue(cellId, editValue);
            setEditingCell(null);
          }}
        />
      ) : (
        <div className="w-full h-full overflow-hidden text-ellipsis">
          {cell.display || cell.value || ''}
        </div>
      )}
    </div>
  );
};

export default Cell;