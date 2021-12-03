import React from 'react';
import './App.css';
// import { MenuBar } from './components/MenuBar';
// import { FormulaInput } from './components/FormulaInput';
// import Cell from './components/Cell';
import Spreadsheet from './components/Spreadsheet';

function App() {
  // const [input, setFormulaInput] = useState('');
  // const [value, setCellValue] = useState({});

  // function updateInput(input: string) {
  //   setFormulaInput(input);
  // }

  // useEffect(() => {
  //   const cellValue = input;
  //   if (cellValue) {
  //     setCellValue(cellValue);
  //   }
  // }, [input]);

  return (
    <div className='App'>
      {/* <MenuBar></MenuBar> */}
      {/* <FormulaInput updateInput={updateInput}></FormulaInput> */}
      <Spreadsheet x={6} y={20}></Spreadsheet>
    </div>
  );
}

export default App;
