import React from 'react';
import ReactCell from './ReactCell';
import ReactHeaderCell from './ReactHeaderCell';
import { Document, Cell, Spreadsheet } from '../backend';

export default class ReactSpreadsheet extends React.Component {
  state: any;
  props: any;
  cells: Cell[][];

  constructor(props: any) {
    super(props);
    //this.cells = new Array();
    this.cells = Document.getSpreadsheet().getCells();
    // console.log(this.cells);
    this.state = {
      data: {},
    };
  }

  public static download(filename: string, textInput: string) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  keyDown(e: any) {
    console.log(e);
    if (e.code == "KeyS" && e.ctrlKey) {
      e.preventDefault()
      ReactSpreadsheet.download("document.csv", Document.getSpreadsheet().getCSV());
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyDown, true);
  }

  public setCells(cells: Cell[][]) {
    this.cells = cells;
  }

  //componentDidMount() {
  //  this.scope.keyDown = (args) => {
  //    let keyCode = args.event.which || args.event.keyCode;
  //    let isCtrlKey = (args.event.ctrlKey || args.event.metaKey) ? true : ((keyCode === 17) ? true : false);
  //    let isAltKey = args.event.altKey ? args.event.altKey : ((keyCode === 18) ? true : false);
  //    // 83 is the character code for 'S'
  //    if (isCtrlKey && !isAltKey && keyCode === 83) {
  //      //To prevent default save operation, set the isHandled property to true
  //      args.isHandled = true;
  //      //Download the document in docx format.
  //      this.documentEditor.save('sample', 'Docx');
  //      args.event.preventDefault();
  //    }
  //    else if (isCtrlKey && isAltKey && keyCode === 83) {
  //      //Download the document in sfdt format.
  //      this.documentEditor.save('sample', 'Sfdt');
  //    }
  //  };
  //}

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
    for (let y = -1; y < Document.getSpreadsheet().getHeight(); y++) {
      for (let x = -1; x < Document.getSpreadsheet().getWidth(); x++) {
        if (x === -1 || y === -1) {
          data.push(<ReactHeaderCell key={`${x}-${y}`} y={y} x={x} value='' />);
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
    return <div style={this.getCSS()}>{data}</div>;
  }
}
