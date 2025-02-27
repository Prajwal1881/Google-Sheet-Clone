import React from 'react';
import Spreadsheet from './components/Spreadsheet';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 flex items-center">
        <div className="flex items-center">
          <div className="mr-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2" />
              <line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth="2" />
              <line x1="3" y1="15" x2="21" y2="15" stroke="white" strokeWidth="2" />
              <line x1="9" y1="3" x2="9" y2="21" stroke="white" strokeWidth="2" />
              <line x1="15" y1="3" x2="15" y2="21" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">React Sheets</h1>
        </div>
        <div className="ml-auto text-sm">
          A Google Sheets Clone
        </div>
      </header>
      <main>
        <Spreadsheet />
      </main>
    </div>
  );
}

export default App;