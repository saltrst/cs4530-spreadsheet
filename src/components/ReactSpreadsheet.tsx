import React from 'react';
import ReactCell from './ReactCell';
import ReactHeaderCell from './ReactHeaderCell';
import { IObserver, Document, Cell, Spreadsheet } from '../backend';
import { v4 as uuidv4 } from 'uuid';

export default class ReactSpreadsheet
  extends React.Component
  implements IObserver {
  state: any;
  props: any;
  //cells: Cell[][];

  constructor(props: any) {
    super(props);
    Document.getSpreadsheet().attach(this);
    //this.cells = Document.getSpreadsheet().getCells();
    this.state = {
      data: {},
    };
  }

  update(): void {
    //this.cells = Document.getSpreadsheet().getCells();
    this.forceUpdate();
  }

  public static download(filename: string, data: string) {
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8, ' + encodeURIComponent(data)
    );
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  keyDown(e: any) {
    if (e.code == 'KeyS' && e.ctrlKey) {
      e.preventDefault();
      ReactSpreadsheet.download(
        'document.csv',
        Document.getSpreadsheet().getCSV()
      );
    }
  }

  componentDidMount() {
    let asdf: any = window;
    asdf.asdf = Document.getSpreadsheet();

    document.addEventListener('keydown', this.keyDown, true);
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
    let width = cellWidth * (Document.getSpreadsheet().getWidth() + 1);
    let css: any = {
      width: width + 'px',
    };
    return css;
  }

  render() {
    let data = [];
    ReactCell.detachAll();
    //Document.getSpreadsheet().getCells().forEach((arr: Cell[]) => {
    //  arr.forEach((c: Cell) => {
    //    console.log(c.observers.length);
    //  });
    //});
    for (let y = -1; y < Document.getSpreadsheet().getCells()[0].length; y++) {
      for (let x = -1; x < Document.getSpreadsheet().getCells().length; x++) {
        if (x === -1 || y === -1) {
          data.push(<ReactHeaderCell key={`${x}-${y}`} y={y} x={x} value='' />);
        } else {
          data.push(
            <ReactCell
              key={uuidv4()}
              y={y}
              x={x}
              onChangedValue={this.handleChangedCell}
              updateCells={this.updateCells}
              value={Document.getSpreadsheet().getCells()[x][y].getValue()}
              cell={Document.getSpreadsheet().getCells()[x][y]}
            />
          );
        }
      }
    }
    return <div style={this.getCSS()}>{data}</div>;
  }
}
