import axios from 'axios';
import { IObserver } from './IObserver';
import { Subject } from './Subject';
import { Document } from './Document';
import { BaseConvert } from './BaseConvert';

const FormulaParser = require('hot-formula-parser').Parser;
const parser = new FormulaParser();

/*
This class is used to represet a single cell, extends subject to update reactCell and other cell observers. 
Also implements IObserver so it can be updated if it refers to another cell.
Params: 
chacheValue: The evaluated input, stored in a cache for presenting on screen
rawValue: Direct user input, appears when editing the cell, evaluated to find cacheVal 
*/
export class Cell extends Subject implements IObserver {
  private cacheValue: string;
  private rawValue: string;

  constructor() {
    super();
    this.cacheValue = '';
    this.rawValue = '';
  }

  /*
  This method prompts the cell to re-evaluate its rawValue and notify it's observers.
  */
  update(): void {
    this.clear();
    this.updateVal(this.rawValue);
    this.notify();
  }

  /*
  This method directly sets the raw value, used for testing
  */
  setRawValue(val: string) {
    this.rawValue = val;
  }

  /*
  This method converts a string containing reference to stock ticker API, to a string containing
   the value of the ticker in place of the reference.
  input: 
  rawVal: the string that contains the ticker
  term: the term representing the placement of a ticker
  */
  async subStockTickerValue(rawVal: string, term: string): Promise<any> {
    let updatedRaw = rawVal;
    while (updatedRaw.includes(term + '(')) {
      let start = updatedRaw.indexOf(term + '(');
      let finish = updatedRaw.indexOf(')', start);
      let found = updatedRaw.substring(start + term.length + 1, finish);
      let refCellVal = '';
      refCellVal = (await this.returnStockPrice(found)).toString();
      updatedRaw = rawVal.replace(term + '(' + found + ')', refCellVal);
    }
    return updatedRaw;
  }

  /*
  This method acesses the stock ticking api and returns an async response.
  input: 
  ticker: The name of the stock that is being searched.
  */
  async returnStockPrice(ticker: string): Promise<string> {
    const url: string =
      'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' +
      ticker +
      '&apikey=4BUCZWKTB2069YPE';
    try {
      const response: any = await axios.get(url);
      const lastData: any = Object.values(response.data['Time Series (Daily)']);
      const amt = parseFloat(lastData[0]['4. close']).toString();
      return amt;
    } catch (exception) {
      return 'ERROR: ';
    }
  }

  /*
  This method converts a cell range reference to a couple of strings representing the starting and ending reference.
  input: 
  found: the formatted range reference IE C8..D12
  */
  parseCellArray(found: string): string[] {
    let arr = [];
    let v = found.split('..');
    let v1 = v[0];
    let v2 = v[1];
    arr.push(v1);
    arr.push(v2);
    return arr;
  }

  /*
  This method updates this rawValue and CacheValue, with basic a basic string value, used for improper cycle messages
  */
  safeUpdateVal(rawValue: string) {
    this.rawValue = rawValue;
    this.cacheValue = rawValue;
  }

  /*
  This method passes and updates the raw value, updates the cache and notifies it's obervers of the change
  arr: the cell range reference IE. C6..D12
  */
  async updateVal(rawValue: string) {
    this.rawValue = rawValue;

    let value = this.parseFunctions(rawValue);
    value = await this.parseStocks(value);
    let parsed = parser.parse(value).result;
    if (value == 'Error!') {
      this.rawValue = value;
    }
    if (parsed && typeof parsed === 'number') {
      this.cacheValue = parsed.toString();
    } else {
      this.cacheValue = this.concatIfCan(value);
    }

    this.notify();
  }

  /*
  This method converts a string containing reference to stock ticker API, to a string containing
   the value of the ticker in place of the reference.
  input: 
  str: the string that contains the ticker
  */
  async parseStocks(str: string): Promise<string> {
    let regex = /\$\([A-Z]+\)/g;
    let matches = str.match(regex);

    if (matches === null) return str;
    for (let token of matches) {
      let symbol = this.getSymbol(token);
      let newValue = await this.returnStockPrice(symbol);
      str = str.replace(token, newValue);
    }
    return str;
  }

  /*
  This method converts a string containing reference formulas to a string containing
  the value of those formulas in place of the formulas.
  input: 
  str: the string that contains the formulas
  */
  parseFunctions(str: string): string {
    let regex = /[A-Z]+\([A-Z]+\d+(\.\.[A-Z]+\d+)?\)/g;
    let matches = str.match(regex);

    if (matches === null) return str;
    for (let token of matches) {
      let funcName = this.getFunctionName(token);
      let newValue: string = token;
      switch (funcName) {
        case 'REF':
          let coords = this.getCoords(token);
          let x = this.getX(coords);
          let y = this.getY(coords);
          let cell = Document.getCell(x, y);
          newValue = cell.getValue();
          try {
            cell.attach(this);
          } catch (Error) {
            newValue = 'Error!';
          }
          break;
        case 'AVG':
          var first = this.getCoords1(token);
          var last = this.getCoords2(token);
          var x1 = this.getX(first);
          var y1 = this.getY(first);
          var x2 = this.getX(last);
          var y2 = this.getY(last);
          newValue = this.findAvg(x1, y1, x2, y2).toString();
          if (this.attachRange(x1, y1, x2, y2)) {
            newValue = 'Error!';
          }
          break;
        case 'SUM':
          var first = this.getCoords1(token);
          var last = this.getCoords2(token);
          var x1 = this.getX(first);
          var y1 = this.getY(first);
          var x2 = this.getX(last);
          var y2 = this.getY(last);
          newValue = this.findSum(x1, y1, x2, y2).toString();
          if (this.attachRange(x1, y1, x2, y2)) {
            newValue = 'Error!';
          }
          break;
      }
      str = str.replace(token, newValue);
    }
    return str;
  }

  /*
  Attaches each cell in range as a subject. Returns true if there is an error
  input: 
  x1: x coord of cell 1
  y1: y coord of cell 1
  x2: x coord of cell 2
  y2: x coord of cell 2
  */
  attachRange(x1: number, y1: number, x2: number, y2: number): boolean {
    if (x1 > x2) {
      let t = x2;
      x2 = x1;
      x1 = t;
    }
    if (y1 > y2) {
      let t = y2;
      y2 = y1;
      y1 = t;
    }
    let sum = 0;
    let count = 0;
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        let cell = Document.getCell(x, y);
        try {
          cell.attach(this);
        } catch (Error) {
          return true;
        }
      }
    }
    return false;
  }

  /*
  This method avgs values within a range of cells
  input: 
  x1: x coord of cell 1
  y1: y coord of cell 1
  x2: x coord of cell 2
  y2: x coord of cell 2
  */
  findAvg(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 > x2) {
      let t = x2;
      x2 = x1;
      x1 = t;
    }
    if (y1 > y2) {
      let t = y2;
      y2 = y1;
      y1 = t;
    }
    let sum = 0;
    let count = 0;
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        let cell = Document.getCell(x, y);
        sum += parseFloat(cell.getValue());
        count++;
      }
    }
    return sum / count;
  }

  /*
  This method sums values within a range of cells
  input: 
  x1: x coord of cell 1
  y1: y coord of cell 1
  x2: x coord of cell 2
  y2: x coord of cell 2
  */
  findSum(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 > x2) {
      let t = x2;
      x2 = x1;
      x1 = t;
    }
    if (y1 > y2) {
      let t = y2;
      y2 = y1;
      y1 = t;
    }
    let sum = 0;
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        let cell = Document.getCell(x, y);
        sum += parseFloat(cell.getValue());
      }
    }
    return sum;
  }

  /*
  This method uses regex to discover the symbol name when a stock ticker is discovered
  input: full function token
  token: The stock string
  */
  getSymbol(token: string): string {
    let regex = /(?<=\()[A-Z]+(?=\))/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method gets the coordinates for first cell in range
  input: full function token
  token: The string containing the cell reference
  */
  getCoords1(token: string): string {
    let regex = /(?<=\()[A-Z]+\d+/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method gets the coordinates for last cell in range
  input: full function token
  token: The string containing the cell reference
  */
  getCoords2(token: string): string {
    let regex = /[A-Z]+\d+(?=\))/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method uses regex to discover the formula name when a formula is discovered
  input: full function token
  token:The string containing the formula
  */
  getFunctionName(token: string): string {
    let regex = /[A-Z]+/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method uses regex to discover the coords of a referencing formula
  input: full function token
  token: The string containing the formula
  */
  getCoords(token: string): string {
    let regex = /(?<=\()[A-Z]+\d+(?=\))/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method gets the x coordinate for first cell reference
  input: Cell coordinate string
  coords: The string containing the cell reference
  */
  getX(coords: string): number {
    let regex = /[A-Z]+/;
    let result = regex.exec(coords);
    if (result === null) return 0;
    return BaseConvert.decode(result[0]);
  }

  /*
  This method gets the y coordinate for first cell reference
  input: Cell coordinate string
  coords:The string containing the cell reference
  */
  getY(coords: string): number {
    let regex = /\d+/;
    let result = regex.exec(coords);
    if (result === null) return 0;
    return parseInt(result[0]);
  }

  /*
  This method concatenates a string if the input string is of valid concatenation format IE "hi" + "hello"
  input: 
  str: the input string to potentially be concatenated
  */
  concatIfCan(str: string): string {
    let strRef = str.replace(/\s/g, '').split('+');
    let cleanStrings = [];

    for (let bound of strRef) {
      if (!this.isBoundedByQuotes(bound)) {
        return str;
      } else {
        let clean = bound.split('"').join('');
        cleanStrings.push(clean);
      }
    }
    return cleanStrings.join('');
  }

  /*
  This method returns a boolean expressing if a srting is bounded by quotes
  input: 
  str: the input string to be evaluated
  */
  isBoundedByQuotes(str: string): boolean {
    return str[0] === '"' && str[str.length - 1] === '"';
  }

  /*
  This method passes along the cache value for displaying and testing 
  */
  getValue(): string {
    return this.cacheValue;
  }

  /*
  This method passes along the raw value in the cell
  */
  getRawValue(): string {
    return this.rawValue;
  }

  /*
  This method adjusts cell references in the raw value when a particular index of collumn is added or removed
  input: 
  amount: The number of cells incresed (1 = 1 column added, -1 = 1 column removed)
  afterCol: The index of the column change
  */
  adjustForColumn(amount: number, afterCol: number): boolean {
    let regex = /[A-Z]+\([A-Z]+\d+(\.\.[A-Z]+\d+)?\)/g;
    let matches = this.rawValue.match(regex);
    let changed = false;
    if (matches === null) return false;
    for (let token of matches) {
      let coords = token.match(/[A-Z]+\d+/g);
      if (coords === null) continue;
      for (let coord of coords) {
        let x = new Cell().getX(coord);
        let y = new Cell().getY(coord);
        if (x < afterCol) {
          continue;
        }
        let newVal = BaseConvert.encode(x + amount) + y;
        this.rawValue = this.rawValue.replace(coord, newVal);
        changed = true;
      }
    }
    return changed;
  }

  /*
  This method adjusts cell references in the raw value when a particular index of row is added or removed
  input: 
  amount: The number of cells incresed (1 = 1 row added, -1 = 1 row removed)
  afterRow: The index of the row change
  */
  adjustForRow(amount: number, afterRow: number): boolean {
    let regex = /[A-Z]+\([A-Z]+\d+(\.\.[A-Z]+\d+)?\)/g;
    let matches = this.rawValue.match(regex);
    let changed = false;
    if (matches === null) return false;
    for (let token of matches) {
      let coords = token.match(/[A-Z]+\d+/g);
      if (coords === null) continue;
      for (let coord of coords) {
        let x = new Cell().getX(coord);
        let y = new Cell().getY(coord);
        if (y < afterRow) {
          continue;
        }
        let newVal = BaseConvert.encode(x) + (y + amount);
        this.rawValue = this.rawValue.replace(coord, newVal);
        changed = true;
      }
    }
    return changed;
  }
}
