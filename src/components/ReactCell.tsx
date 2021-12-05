import React from 'react';
import { Cell } from '../backend';
import { IObserver } from '../backend';

/**
 * Cell represents the atomic element of a table
 */
export default class ReactCell extends React.Component implements IObserver {
  props: any;
  state: any;
  cell: Cell;
  isHighlighted: boolean;

  public static width: number = 75;

  private static allReactCells: ReactCell[] = new Array();

  public static detachAll() {
    if (this.allReactCells === undefined) return;

    this.allReactCells.forEach((reactCell: ReactCell) => {
      reactCell.cell.detach(reactCell);
    });
  }

  constructor(props: any) {
    super(props);
    this.isHighlighted = false;
    this.cell = props.cell;
    this.state = {
      editing: false,
    };
    this.cell.attach(this);
    ReactCell.allReactCells.push(this);
  }

  update(): void {
    this.setState({ editing: false });
  }

  onKeyPressOnInput = (e: any) => {
    if (e.key === 'Enter') {
      //  this.hasNewValue(e.target.value);
      this.cell.updateVal(e.target.value);
      this.setState({ editing: false });
    }
  };

  onChange = (e: any) => {
    //this.setState({ value: e.target.value });
    //this.display = e.target.value;
    //{ x: this.props.x, y: this.props.y },
    //e.target.value
    // console.log(e.target.value);
    //this.cell.updateVal(e.target.value);
  };

  onBlur = (e: any) => {
    //this.hasNewValue(e.target.value);
    this.cell.updateVal(e.target.value);
    this.setState({ editing: false });
  };

  onClick = (e: any) => {
    if (e.ctrlKey) {
      this.isHighlighted = !this.isHighlighted;
      this.forceUpdate();
    } else {
      this.setState({ editing: true });
    }
  };

  //hasNewValue = (value: any) => {
  //  console.log("ReactCell at " + this.props.x + ":" + this.props.y);
  //  console.log(this);
  //  this.props.onChangedValue(
  //    {
  //      x: this.props.x,
  //      y: this.props.y,
  //    },
  //    value
  //  );
  //  this.setState({ editing: false });
  //};

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
    if (this.isHighlighted) {
      console.log('higlighted')
      css.backgroundColor = '#e7f78f';
    }
    return css;
  };

  render() {
    const css = this.dynamicCss();
    if (this.props.x == 0) {
      //console.log("react cell " + this.props.x + ":" + this.props.y);
      //console.log(this);
    }

    if (this.state.editing) {
      return (
        <input
          style={css}
          className={'cell'}
          type='text'
          onBlur={this.onBlur}
          onKeyPress={this.onKeyPressOnInput}
          onChange={this.onChange}
          //onFocus={this.onFocus}
          autoFocus
          defaultValue={this.cell.getRawValue()}
        />
      );
    } else {
      return (
        <span onClick={this.onClick} style={css} className={'cell'}>
          {this.cell.getDisplay()}
        </span>
      );
    }
  }
}
