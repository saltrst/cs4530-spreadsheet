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
      this.cell.updateVal(e.target.value);
      this.setState({ editing: false });
    }
  };

  onBlur = (e: any) => {
    this.cell.updateVal(e.target.value);
    this.setState({ editing: false });
  };

  onClick = (e: any) => {
    console.log(e);
    if (e.ctrlKey) {
      this.isHighlighted = !this.isHighlighted;
      this.forceUpdate();
    } else {
      this.setState({ editing: true });
    }
  };

  onFocus(e: any) {
    e.target.select();
  }

  dynamicCss = () => {
    let css: any = {
      width: ReactCell.width + 'px',
    };
    if (this.isHighlighted) {
      console.log('higlighted');
      css.backgroundColor = '#e7f78f';
    }
    return css;
  };

  render() {
    const css = this.dynamicCss();
    if (this.state.editing) {
      return (
        <input
          style={css}
          className={'cell'}
          type='text'
          onBlur={this.onBlur}
          onKeyPress={this.onKeyPressOnInput}
          onFocus={(e) => this.onFocus(e)}
          autoFocus
          defaultValue={this.cell.getRawValue()}
        />
      );
    } else {
      return (
        <span onClick={this.onClick} style={css} className={'cell'}>
          {this.cell.getValue()}
        </span>
      );
    }
  }
}
