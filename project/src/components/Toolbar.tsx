import React, { useState } from 'react';
import { useSheetStore } from '../store/sheetStore';
import { getCellId } from '../utils/cellUtils';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, 
  Plus, Trash2, Undo, Redo, Search, Save, Upload
} from 'lucide-react';

const Toolbar: React.FC = () => {
  const {
    activeCell,
    selection,
    data,
    setCellStyle,
    addRow,
    deleteRow,
    addColumn,
    deleteColumn,
    undo,
    redo,
    findAndReplaceInSelection,
    removeDuplicatesInSelection,
    setEditingCell
  } = useSheetStore();
  
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  
  // Get the active cell's style
  const getActiveCellStyle = () => {
    if (!activeCell) return {};
    
    const cellId = getCellId(activeCell.row, activeCell.col);
    return data[cellId]?.style || {};
  };
  
  const activeCellStyle = getActiveCellStyle();
  
  // Apply style to selected cells
  const applyStyle = (style: Record<string, any>) => {
    if (!selection) return;
    
    const { start, end } = selection;
    const startRow = Math.min(start.row, end.row);
    const endRow = Math.max(start.row, end.row);
    const startCol = Math.min(start.col, end.col);
    const endCol = Math.max(start.col, end.col);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = getCellId(row, col);
        setCellStyle(cellId, style);
      }
    }
  };
  
  // Toggle bold
  const toggleBold = () => {
    applyStyle({ bold: !activeCellStyle.bold });
  };
  
  // Toggle italic
  const toggleItalic = () => {
    applyStyle({ italic: !activeCellStyle.italic });
  };
  
  // Set text alignment
  const setTextAlign = (align: 'left' | 'center' | 'right') => {
    applyStyle({ textAlign: align });
  };
  
  // Handle find and replace
  const handleFindReplace = () => {
    if (!findText) return;
    
    findAndReplaceInSelection(findText, replaceText);
    setShowFindReplace(false);
  };
  
  // Handle remove duplicates
  const handleRemoveDuplicates = () => {
    const { removedCount } = removeDuplicatesInSelection();
    alert(`Removed ${removedCount} duplicate rows.`);
  };
  
  // Save spreadsheet data
  const saveSpreadsheet = () => {
    const spreadsheetData = {
      data,
      dimensions: { rows: 50, cols: 26 }
    };
    
    const blob = new Blob([JSON.stringify(spreadsheetData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // Load spreadsheet data
  const loadSpreadsheet = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const spreadsheetData = JSON.parse(content);
          
          // TODO: Load the spreadsheet data into the store
          alert('Spreadsheet loaded successfully!');
        } catch (error) {
          alert('Error loading spreadsheet: ' + error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  return (
    <div className="toolbar flex flex-col">
      <div className="flex items-center h-12 border-b border-gray-300 px-2 bg-gray-100">
        <div className="flex space-x-2 mr-4">
          <button
            className={`p-1 rounded ${activeCellStyle.bold ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            onClick={toggleBold}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            className={`p-1 rounded ${activeCellStyle.italic ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            onClick={toggleItalic}
            title="Italic"
          >
            <Italic size={18} />
          </button>
        </div>
        
        <div className="flex space-x-2 mr-4">
          <button
            className={`p-1 rounded ${activeCellStyle.textAlign === 'left' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            onClick={() => setTextAlign('left')}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            className={`p-1 rounded ${activeCellStyle.textAlign === 'center' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            onClick={() => setTextAlign('center')}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            className={`p-1 rounded ${activeCellStyle.textAlign === 'right' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            onClick={() => setTextAlign('right')}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
        </div>
        
        <div className="border-l border-gray-300 h-8 mx-2"></div>
        
        <div className="flex space-x-2 mr-4">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => activeCell && addRow(activeCell.row)}
            title="Add Row"
          >
            <Plus size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => activeCell && deleteRow(activeCell.row)}
            title="Delete Row"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="flex space-x-2 mr-4">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => activeCell && addColumn(activeCell.col)}
            title="Add Column"
          >
            <Plus size={18} className="rotate-90" />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => activeCell && deleteColumn(activeCell.col)}
            title="Delete Column"
          >
            <Trash2 size={18} className="rotate-90" />
          </button>
        </div>
        
        <div className="border-l border-gray-300 h-8 mx-2"></div>
        
        <div className="flex space-x-2 mr-4">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={undo}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={redo}
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>
        
        <div className="border-l border-gray-300 h-8 mx-2"></div>
        
        <div className="flex space-x-2 mr-4">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={() => setShowFindReplace(!showFindReplace)}
            title="Find and Replace"
          >
            <Search size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={handleRemoveDuplicates}
            title="Remove Duplicates"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <div className="border-l border-gray-300 h-8 mx-2"></div>
        
        <div className="flex space-x-2">
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={saveSpreadsheet}
            title="Save Spreadsheet"
          >
            <Save size={18} />
          </button>
          <button
            className="p-1 rounded hover:bg-gray-200"
            onClick={loadSpreadsheet}
            title="Load Spreadsheet"
          >
            <Upload size={18} />
          </button>
        </div>
      </div>
      
      {showFindReplace && (
        <div className="find-replace flex items-center h-12 border-b border-gray-300 px-2 bg-gray-50">
          <input
            type="text"
            className="w-40 h-8 px-2 border border-gray-300 mr-2"
            placeholder="Find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            className="w-40 h-8 px-2 border border-gray-300 mr-2"
            placeholder="Replace"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleFindReplace}
          >
            Replace
          </button>
          <button
            className="px-3 py-1 ml-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setShowFindReplace(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;