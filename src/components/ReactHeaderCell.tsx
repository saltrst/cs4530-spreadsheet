import React from 'react';
import ReactCell from './ReactCell';
import { Document, BaseConvert, Cell } from '../backend';

/**
 * Cell represents the atomic element of a table
 */
export default class ReactHeaderCell extends React.Component {
  props: any;
  display: string;
  state: any;
  cell: Cell;

  constructor(props: any) {
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

  onClick = (e: any) => {
    if (this.props.y == -1 && this.props.x == -1) {
      return;
    }

    if (this.props.y == -1) {
      Document.instance().getSpreadsheet().insertColumn(this.props.y);
    } else if (this.props.x == -1) {
      Document.instance().getSpreadsheet().insertRow(this.props.x);
    } 
  };

  getCSS() {
    let css: any = {
      width: ReactCell.width + 'px',
    };
    return css;
  }

  render() {
    return (
      <span
        onClick={(e) => this.onClick(e)}
        style={this.getCSS()}
        className={'headerCell'}
      >
        {this.display}
      </span>
    );
  }
}
