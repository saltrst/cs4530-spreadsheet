import React from 'react';

export function FormulaInput(props: any) {
  return (
    <div>
      <label>Enter f(x):</label>
      <input
        name='cellFormula'
        defaultValue=''
        onBlur={(e) => props.updateInput(e.target.value)}
      ></input>
    </div>
  );
}
