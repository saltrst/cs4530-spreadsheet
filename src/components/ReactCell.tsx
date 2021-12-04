import React from 'react';
import { Cell } from '../backend';

/**
 * Cell represents the atomic element of a table
 */
export default class ReactCell extends React.Component {
  props : any;
  state : any;
  cell : Cell;

  public static width : number = 75;

  constructor(props: any) {
    super(props);
    this.cell = props.cell;
    this.state = {
      editing: false
    };
  }

  //onKeyPressOnInput = (e: any) => {
  //  if (e.key === 'Enter') {
  //    //this.parseFormula(e.target.value);
  //    this.hasNewValue(e.target.value);
  //  }
  //};

  onChange = (e: any) => {
    //this.setState({ value: e.target.value });
    //this.display = e.target.value;
      //{ x: this.props.x, y: this.props.y },
      //e.target.value
    console.log(e.target.value);
    this.cell.updateVal(e.target.value);
  };

  onBlur = (e: any) => {
    //this.hasNewValue(e.target.value);
    this.setState({ editing: false });
  };

  onClick = (e: any) => {
    this.setState({ editing: true });
  };

  hasNewValue = (value: any) => {
    this.props.onChangedValue(
      {
        x: this.props.x,
        y: this.props.y,
      },
      value
    );
    this.setState({ editing: false });
  };

  //onFocus = (e: any) => {
  //  this.setState({ editing: true });
  //};

  //setDisplay({ x, y }: any, value: any) {
  //  return value;
  //};

  dynamicCss = () => {
    let css: any = {
      width: ReactCell.width + 'px',
    };
    return css;
  };

  render() {
    const css = this.dynamicCss();
    // column 0
    //if (this.props.x === 0 && this.props.y > 0) {
    //  return <span style={css}>{this.props.y}</span>;
    //}
    // row 0
    //if (this.props.y === 0) {
    //  const abc = ' abcdefghijklmnopqrstuvwxyz'.split('');
    //  return <span style={css}>{abc[this.props.x]}</span>;
    //}
    //if (this.state.selected) {
    //  css.outlineColor = 'lightblue';
    //  css.outlineStyle = 'dotted';
    //}
    if (this.state.editing) {
      return (
        <input
          style={css}
          className={'cell'}
          type='text'
          onBlur={this.onBlur}
          //onKeyPress={this.onKeyPressOnInput}
          onChange={this.onChange}
          //onFocus={this.onFocus}
          autoFocus
        />
      );
    } else {
      return (
        <span onClick={(e) => this.onClick(e)} style={css} className={'cell'}>
          {this.cell.getDisplay()}
        </span>
      );
    }
  }

  //parseFormula(value: any) {
  //  if (value.includes('REF')) {
  //    console.log('REF Detected');
  //    return;
  //  }
  //  if (value.includes('SUM')) {
  //    console.log('SUM Detected');
  //    return;
  //  }
  //  if (value.includes('+')) {
  //    console.log('Addition Detected');
  //    return;
  //  }
  //  if (value.includes('AVERAGE')) {
  //    console.log('AVERAGE Detected');
  //    return;
  //  }
  //  if (value.includes('$') && value.length > 1) {
  //    console.log('Stock Ticker Detected');
  //    return;
  //  }
  //  if (!isNaN(value) && !isNaN(parseFloat(value))) {
  //    console.log('Number Detected');
  //  } else {
  //    console.log('String Detected');
  //  }
  //}

}
