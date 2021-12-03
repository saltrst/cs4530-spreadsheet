import React from 'react';
/**
 * Cell represents the atomic element of a table
 */
export default class Cell extends React.Component {
  props: any;
  display: any;
  state: any;
  constructor(props: any) {
    super(props);
    this.state = {
      editing: false,
      value: props.value,
    };
    this.display = this.setDisplay({ x: props.x, y: props.y }, props.value);
  }

  onChange = (e: any) => {
    this.setState({ value: e.target.value });
    this.display = this.setDisplay(
      { x: this.props.x, y: this.props.y },
      e.target.value
    );
  };

  onKeyPressOnInput = (e: any) => {
    if (e.key === 'Enter') {
      this.parseFormula(e.target.value);
      this.hasNewValue(e.target.value);
    }
  };

  onBlur = (e: any) => {
    // where we want to add formula compatibility and shit
    this.parseFormula(e.target.value);
    this.hasNewValue(e.target.value);
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

  onClick = (e: any) => {
    this.setState({ editing: true });
  };

  setDisplay = ({ x, y }: any, value: any) => {
    return value;
  };

  dynamicCss = () => {
    let css: any = {
      width: '100px',
      padding: '4px',
      margin: '0',
      height: '25px',
      boxSizing: 'border-box',
      position: 'relative',
      display: 'inline-block',
      color: 'black',
      border: '1px solid #cacaca',
      textAlign: 'left',
      verticalAlign: 'top',
      fontSize: '14px',
      lineHeight: '15px',
      overflow: 'hidden',
    };

    if (this.props.x === 0 || this.props.y === 0) {
      css.textAlign = 'center';
      css.backgroundColor = '#f0f0f0';
      css.fontWeight = 'bold';
    }
    return css;
  };

  parseFormula(value: any) {
    if (value.includes('REF')) {
      console.log('REF Detected');
      return;
    }
    if (value.includes('SUM')) {
      console.log('SUM Detected');
      return;
    }
    if (value.includes('+')) {
      console.log('Addition Detected');
      return;
    }
    if (value.includes('AVERAGE')) {
      console.log('AVERAGE Detected');
      return;
    }
    if (value.includes('$') && value.length > 1) {
      console.log('Stock Ticker Detected');
      return;
    }
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      console.log('Number Detected');
    } else {
      console.log('String Detected');
    }
  }

  render() {
    const css = this.dynamicCss();
    // column 0
    if (this.props.x === 0 && this.props.y > 0) {
      return <span style={css}>{this.props.y}</span>;
    }
    // row 0
    if (this.props.y === 0) {
      const abc = ' abcdefghijklmnopqrstuvwxyz'.split('');
      return <span style={css}>{abc[this.props.x]}</span>;
    }
    if (this.state.selected) {
      css.outlineColor = 'lightblue';
      css.outlineStyle = 'dotted';
    }
    if (this.state.editing) {
      return (
        <input
          style={css}
          type='text'
          onBlur={this.onBlur}
          onKeyPress={this.onKeyPressOnInput}
          value={this.state.value}
          onChange={this.onChange}
          autoFocus
        />
      );
    }
    return (
      <span onClick={(e) => this.onClick(e)} style={css}>
        {this.display}
      </span>
    );
  }
}
