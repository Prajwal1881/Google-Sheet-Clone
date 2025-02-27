import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FunctionHelpProps {
  onInsertFunction: (functionName: string) => void;
}

const FunctionHelp: React.FC<FunctionHelpProps> = ({ onInsertFunction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'math' | 'dataQuality'>('math');
  
  const mathFunctions = [
    {
      name: 'SUM',
      description: 'Calculates the sum of a range of cells.',
      example: '=SUM(A1:A5)',
      syntax: '=SUM(range)'
    },
    {
      name: 'AVERAGE',
      description: 'Calculates the average of a range of cells.',
      example: '=AVERAGE(B1:B10)',
      syntax: '=AVERAGE(range)'
    },
    {
      name: 'MAX',
      description: 'Returns the maximum value from a range of cells.',
      example: '=MAX(C1:C20)',
      syntax: '=MAX(range)'
    },
    {
      name: 'MIN',
      description: 'Returns the minimum value from a range of cells.',
      example: '=MIN(D1:D20)',
      syntax: '=MIN(range)'
    },
    {
      name: 'COUNT',
      description: 'Counts the number of cells containing numerical values in a range.',
      example: '=COUNT(E1:E10)',
      syntax: '=COUNT(range)'
    }
  ];
  
  const dataQualityFunctions = [
    {
      name: 'TRIM',
      description: 'Removes leading and trailing whitespace from a cell.',
      example: '=TRIM(A1)',
      syntax: '=TRIM(cell)'
    },
    {
      name: 'UPPER',
      description: 'Converts the text in a cell to uppercase.',
      example: '=UPPER(B1)',
      syntax: '=UPPER(cell)'
    },
    {
      name: 'LOWER',
      description: 'Converts the text in a cell to lowercase.',
      example: '=LOWER(C1)',
      syntax: '=LOWER(cell)'
    },
    {
      name: 'REMOVE_DUPLICATES',
      description: 'Removes duplicate rows from a selected range.',
      example: 'Select range and use toolbar button',
      syntax: 'N/A (Use toolbar)'
    },
    {
      name: 'FIND_AND_REPLACE',
      description: 'Allows users to find and replace specific text within a range of cells.',
      example: 'Select range and use toolbar button',
      syntax: 'N/A (Use toolbar)'
    }
  ];
  
  const handleInsertFunction = (functionName: string) => {
    onInsertFunction(functionName);
    setIsOpen(false);
  };
  
  return (
    <div className="function-help relative">
      <button
        className="flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <HelpCircle size={16} className="mr-1" />
        Functions
        {isOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-white border border-gray-300 rounded shadow-lg z-50">
          <div className="flex border-b border-gray-300">
            <button
              className={`flex-1 py-2 ${activeTab === 'math' ? 'bg-blue-100 font-semibold' : ''}`}
              onClick={() => setActiveTab('math')}
            >
              Mathematical Functions
            </button>
            <button
              className={`flex-1 py-2 ${activeTab === 'dataQuality' ? 'bg-blue-100 font-semibold' : ''}`}
              onClick={() => setActiveTab('dataQuality')}
            >
              Data Quality Functions
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto p-2">
            {activeTab === 'math' ? (
              <div>
                {mathFunctions.map((func) => (
                  <div key={func.name} className="mb-4 p-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">{func.name}</h3>
                      <button
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleInsertFunction(func.name)}
                      >
                        Insert
                      </button>
                    </div>
                    <p className="text-sm my-1">{func.description}</p>
                    <p className="text-xs text-gray-600">Syntax: {func.syntax}</p>
                    <p className="text-xs text-gray-600">Example: {func.example}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {dataQualityFunctions.map((func) => (
                  <div key={func.name} className="mb-4 p-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">{func.name}</h3>
                      {func.syntax !== 'N/A (Use toolbar)' && (
                        <button
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleInsertFunction(func.name)}
                        >
                          Insert
                        </button>
                      )}
                    </div>
                    <p className="text-sm my-1">{func.description}</p>
                    <p className="text-xs text-gray-600">Syntax: {func.syntax}</p>
                    <p className="text-xs text-gray-600">Example: {func.example}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionHelp;