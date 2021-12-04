import React from 'react';
import ReactCell from './ReactCell';
import { BaseConvert, Cell } from '../backend';


/**
 * Cell represents the atomic element of a table
 */
export default class ReactHeaderCell extends React.Component {
  props : any;
  display : string;
  state : any;
  cell : Cell;

  constructor(props: any, ) {
    super(props);
    this.cell = props.cell;
    this.state = {
      editing: false,
      value: props.value,
    };

    if (props.y == -1 && props.x == -1) {
        this.display = '';
    }

    if (props.y == -1) {
        this.display = BaseConvert.encode(props.x);
    } else if (props.x == -1) {
        this.display = props.y;
    } else {
        this.display = 'Error!';
    }
  }

  //onChange = (e: any) => {
  //  this.setState({ value: e.target.value });
  //  this.display = this.setDisplay(
  //    { x: this.props.x, y: this.props.y },
  //    e.target.value
  //  );
  //};

  //onKeyPressOnInput = (e: any) => {
  //  if (e.key === 'Enter') {
  //    //this.parseFormula(e.target.value);
  //    this.hasNewValue(e.target.value);
  //  }
  //};

  //onBlur = (e: any) => {
  //  // where we want to add formula compatibility and shit
  //  //this.parseFormula(e.target.value);
  //  this.hasNewValue(e.target.value);
  //};

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

  onClick = (e: any) => {
    this.setState({ editing: true });
  };

  setDisplay = ({ x, y }: any, value: any) => {
    return value;
  };

  getCSS() {
    let css: any = {
      width: ReactCell.width + 'px',
    };
    return css;
  };

  render() {
    //const css = this.dynamicCss();
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
    //if (this.state.editing) {
    //  return (
    //    <input
    //      style={css}
    //      type='text'
    //      onBlur={this.onBlur}
    //      onKeyPress={this.onKeyPressOnInput}
    //      value={this.state.value}
    //      onChange={this.onChange}
    //      autoFocus
    //    />
    //  );
    //}
    return (
      <span onClick={(e) => this.onClick(e)} style={this.getCSS()} className={'headerCell'}>
        {this.display}
      </span>
    );
  }
}
