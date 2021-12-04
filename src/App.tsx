import React from 'react';
import './App.css';
// import { MenuBar } from './components/MenuBar';
// import { FormulaInput } from './components/FormulaInput';
// import Cell from './components/Cell';
import ReactSpreadsheet from './components/ReactSpreadsheet';

function App() {
  return (
    <div className='App'>
      {/* <MenuBar></MenuBar> */}
      {/* <FormulaInput updateInput={updateInput}></FormulaInput> */}
      <ReactSpreadsheet></ReactSpreadsheet>
    </div>
  );
}

export default App;
