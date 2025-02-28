# Google-Sheet-Clone

A Google Sheets clone built with React, TypeScript.

## Features

1. Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and cell structure
- Cell selection and editing
- Drag functionality for selections
- Cell dependencies with formula support
- Basic cell formatting (bold, italics, text alignment)
- Add, delete, and resize rows and columns

2. Mathematical Functions
- `SUM`: Calculates the sum of a range of cells
- `AVERAGE`: Calculates the average of a range of cells
- `MAX`: Returns the maximum value from a range of cells
- `MIN`: Returns the minimum value from a range of cells
- `COUNT`: Counts the number of cells containing numerical values in a range

3. Data Quality Functions
- `TRIM`: Removes leading and trailing whitespace from a cell
- `UPPER`: Converts the text in a cell to uppercase
- `LOWER`: Converts the text in a cell to lowercase
- `REMOVE_DUPLICATES`: Removes duplicate rows from a selected range
- `FIND_AND_REPLACE`: Allows users to find and replace specific text within a range of cells

4. Data Entry and Validation
- Support for various data types (numbers, text)
- Basic data validation
- Formula evaluation

5. Additional Features
- Undo/Redo functionality
- Save and load spreadsheets
- Keyboard navigation

### Getting Started ###

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Prajwal1881/Google-Sheet-Clone
cd project
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

# Usage 

## Basic Operations
- Click on a cell to select it
- Double-click on a cell to edit it
- Use the formula bar to enter values or formulas
- Use the toolbar to format cells
- Click and drag to select multiple cells

## Using Formulas
- Start with an equals sign (`=`)
- Example: `=SUM(A1:A5)` to sum values in cells A1 through A5
- Example: `=AVERAGE(B1:B10)` to calculate the average of values in cells B1 through B10

## Keyboard Shortcuts
- Arrow keys: Navigate between cells
- Enter: Confirm cell edit and move down
- Tab: Confirm cell edit and move right
- Escape: Cancel cell edit



## Project Structure

src/
├── components/         # React components
│   ├── Cell.tsx        # Individual cell component
│   ├── FormulaBar.tsx  # Formula input bar
│   ├── FunctionHelp.tsx # Function help panel
│   ├── Grid.tsx        # Main grid component
│   ├── Spreadsheet.tsx # Main spreadsheet component
│   └── Toolbar.tsx     # Toolbar with formatting options
├── store/              # State management
│   └── sheetStore.ts   # Zustand store for spreadsheet data
├── types/              # TypeScript type definitions
│   └── index.ts        # Type definitions
├── utils/              # Utility functions
│   ├── cellUtils.ts    # Cell-related utilities
│   └── formulaUtils.ts # Formula evaluation utilities
├── App.tsx             # Main application component
└── main.tsx            # Application entry point


### Technologies Used

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Immer](https://immerjs.github.io/immer/) - Immutable state updates
- [Lucide React](https://lucide.dev/) - Icons


### Future Enhancements

- Support for more complex formulas
- Cell references (relative and absolute)
- Data visualization (charts, graphs)
- Collaborative editing
- More formatting options
- Cell comments
- Protected ranges
- Conditional formatting

### Acknowledgments

- Inspired by Google Sheets
- Built with modern React practices and TypeScript
