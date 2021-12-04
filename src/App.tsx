import React from 'react';
import './App.css';
import Spreadsheet from './components/Spreadsheet';

function App() {
  return (
    <div className='App'>
      <Spreadsheet x={6} y={20}></Spreadsheet>
    </div>
  );
}

export default App;
