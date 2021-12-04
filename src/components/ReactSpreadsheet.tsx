import React from 'react';
import ReactCell from './ReactCell';
import ReactHeaderCell from './ReactHeaderCell';
import { Document, Cell, Spreadsheet } from '../backend';

export default class ReactSpreadsheet extends React.Component {
  state : any;
  props : any;
  cells : Cell[][];
  spreadsheet : Spreadsheet;

  constructor(props: any) {
    super(props);
    this.spreadsheet = Document.instance().getSpreadsheet();
    //this.cells = new Array();
    this.cells = Document.instance().getSpreadsheet().getCells();
    console.log(this.cells);
    this.state = {
      data: {},
    };
  }

  public setCells(cells : Cell[][]) {
    this.cells = cells
  }

  handleChangedCell = ({ x, y }: any, value: any) => {
    const modifiedData = Object.assign({}, this.state.data);
    if (!modifiedData[y]) modifiedData[y] = {};
    modifiedData[y][x] = value;
    this.setState({ data: modifiedData });
  };

  updateCells = () => {
    this.forceUpdate();
  };

  getCSS() {
    let cellWidth = ReactCell.width;
    let width = cellWidth * (this.spreadsheet.getWidth() + 1);
    let css : any = {
      width: width + 'px'
    }
    return css;
  }

  render() {
    //const cells = [];
    let data = [];
    for (let y = -1; y < this.spreadsheet.getHeight(); y++) {
      for (let x = -1; x < this.spreadsheet.getWidth(); x++) {
        if (x == -1 || y == -1) {
          data.push(
            <ReactHeaderCell
              key={`${x}-${y}`}
              y={y}
              x={x}
              value=''
            />
          );
        } else {
          data.push(
            <ReactCell
              key={`${x}-${y}`}
              y={y}
              x={x}
              onChangedValue={this.handleChangedCell}
              updateCells={this.updateCells}
              value=''
              cell={this.cells[x][y]}
            />
          );
        }
      }
    }
    return <div style={this.getCSS()}>{data}</div>
    //for (let y = 0; y < this.props.y + 1; y += 1) {
    //  const rowData = this.state.data[y] || {};
    //  rows.push(
    //    <Row
    //      handleChangedCell={this.handleChangedCell}
    //      updateCells={this.updateCells}
    //      key={y}
    //      y={y}
    //      x={this.props.x + 1}
    //      rowData={rowData}
    //    />
    //  );
    //}
    //return <div>{rows}</div>;
  }
}
