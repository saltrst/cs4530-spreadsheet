import { Cell } from './Cell';
import { Subject } from './Subject';

/*
This class is used to represet a spreadsheet of cells, extends subject so observer react components are updated
on changes.
Input: 
width : sets width param
height : sets height param
Params: 
width : The width of the spreadsheet in number of cells
height : The hieght of the spreadsheet in number of cells
cells : The cells of the spreadsheet in an array of array of cells
*/
export class Spreadsheet extends Subject {
  private width: number;
  private height: number;
  private cells: Cell[][];

  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (let x = 0; x < this.width; x++) {
      this.cells[x] = new Array(height);
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y] = new Cell();
      }
    }
  }

  /*
    This method looks up a cells value in the spreadsheet
    //inputs: 
    x: x coord of the cell
    y: y coord of the cell
    */
  findCellVal(x: number, y: number): string {
    return this.cells[x][y].getValue();
  }

  /*
    This method sums the value of many cells
    //inputs: 
    arr: contains the coords of the cells in couples
    */
  sumCellVals(arr: number[][]): string {
    let value = 0;
    for (let a of arr) {
      value += parseInt(this.findCellVal(a[0], a[1]));
    }
    return value.toString();
  }

  /*
    This method averages the value of many cells
    //inputs: 
    arr: contains the coords of the cells in couples
    */
  avgCellVals(arr: number[][]): string {
    let value = 0;
    for (let a of arr) {
      value += parseInt(this.findCellVal(a[0], a[1]));
    }
    return (value / arr.length).toString();
  }

  /*
    This method passes along the cells of the spreadsheet
    */
  getCells(): Cell[][] {
    return this.cells;
  }

  /*
    This method passes along the width of the spreadsheet
    */
  getWidth(): number {
    return this.width;
  }

  /*
    This method passes along the height of the spreadsheet
    */
  getHeight(): number {
    return this.height;
  }

  /*
    This method computes and passes along a CSV format of the cells of the spreadsheet
    */
  getCSV(): string {
    let data = '';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let value = '';
        let cellValue = this.cells[x][y].getValue();
        value += cellValue;
        data += value + ',';
      }
      data += '\n';
    }
    return data;
  }

  /* 
    This method tells program to redraw all cells
    */
  drawEverything() {
    for (let cellArr of this.cells) {
      for (let cell of cellArr) {
        cell.notify();
      }
    }
  }

  /*
    This method inserts new cells creating a row
    input: 
    index: The index for the new row
    */
  insertRow(index: number): void {
    this.height++;
    for (let x = 0; x < this.width; x++) {
      this.cells[x].splice(index, 0, new Cell());
    }

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x][y].adjustForRow(1, index)) {
          this.cells[x][y].update();
        }
      }
    }
    this.notify();
    this.drawEverything();
  }

  /*
    This method removes cells, removing a row
    input: 
    index: The index for the row being removed
    */
  deleteRow(index: number): void {
    this.height--;
    for (let x = 0; x < this.width; x++) {
      this.cells[x].splice(index, 1);
    }

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x][y].adjustForRow(-1, index)) {
          this.cells[x][y].update();
        }
      }
    }
    this.notify();
  }

  /*
    This method inserts new cells creating a column
    input: 
    index: The index for the new column
    */
  insertColumn(index: number): void {
    this.width++;
    let array = [];
    for (let i = 0; i < this.height; i++) {
      array.push(new Cell());
    }
    this.cells.splice(index, 0, array);

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x][y].adjustForColumn(1, index)) {
          this.cells[x][y].update();
        }
      }
    }
    this.notify();
  }

  /*
    This method removes cells, removing a column
    input: 
    index: The index for the column being removed
    */
  deleteColumn(index: number): void {
    this.width--;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.cells[x][y].adjustForColumn(-1, index)) {
          this.cells[x][y].update();
        }
      }
    }
    this.cells.splice(index, 1);
    this.notify();
  }
}
