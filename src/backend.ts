import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const FormulaParser = require('hot-formula-parser').Parser;
const parser = new FormulaParser();

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 20;

/*
This class is used to represet a unique Identifier for any object which extends this class, 
Used to check equality without needing types.
//Params: 
id: The string representing the ID for a particular Instance
*/
export abstract class Unique {
  private id: string;

  constructor() {
    this.id = uuidv4();
  }

  /*
  This method returns the Id assigned to this object
  */
  getId(): string {
    return this.id
  }
}

/*
This class is used to represet an observer, which is implemented in subject classes which can simply call update
on instances of observer.
*/
export interface IObserver {
  /*
  This method updates the observer, in the way of the observer instance
  */
  update(): void;
}

/*
This class is used to represet a subject in the observer design pattern, this is critical for quick cell referencing and 
visual updating. 
//Params: 
observers: All of the observers which view this subject and must be notified on updates.
*/
export abstract class Subject extends Unique {
  observers: IObserver[];

  constructor() {
    super();
    this.observers = new Array();
  }

  /*
  This method calls update on all of it's observers
  */
  notify(): void {
    this.observers.forEach((observer) => {
      observer.update();
    });
  }

  /*
  This method attaches an observer
  //inputs: 
  obs: the observer to attach
  */
  attach(obs: IObserver): void {
    if (this.isCyclical(obs)) {
      this.detach(obs);
      if(this instanceof Cell) {
        this.updateVal("")
      }
      return;
    }
    this.observers.push(obs);
  }

  /*
  This method detaches an observer
  //inputs: 
  obs: the observer to detach
  */
  detach(obs: IObserver): void {
    let index = this.observers.indexOf(obs);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /*
  This method computes wether this object is a Cell that is already an observer of the passed observer
  //inputs: 
  obs: the observer which may or may not be cyclically ahead of this
  */
  isCyclical(obs: IObserver): boolean {
    let cell: Cell;
    if (obs instanceof Cell) {
      cell = obs;
    } else {
      return false;
    }

    if (cell.getId() == this.getId()) {
      return true;
    }

    return false;
  }
}

/*
This class is used to represent the program constants, this is an implementation of the singleton design pattern, 
which allows the program to maintain exactly 1 spreadsheet.
//Params: 
spreadsheet: The one spreadsheet for the program, ensured to only have 1.
*/
export class Document {
  private spreadsheet: Spreadsheet;

  private static singleton: Document;
  private constructor() {
    this.spreadsheet = new Spreadsheet(DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }

  /*
  This method builds the document and ensures only 1 copy of document is present
  */
  public static instance(): Document {
    if (this.singleton === undefined) {
      this.singleton = new Document();
    }
    return this.singleton;
  }

  /*
  This method passes the one spreadsheet held by the document
  */
  public static getSpreadsheet(): Spreadsheet {
    return Document.instance().getSpreadsheet();
  }

  /*
  This method looks up a cell in the one spreadsheet of this document
  inputs: 
  x : x coord of the cell
  y : y coord of the cell
  */
  public static getCell(x: number, y: number): Cell {
    return Document.instance().getSpreadsheet().getCells()[x][y];
  }

  /*
  This method resets the spreadsheet, clearing off the spreadsheet.
  */
  public static resetSpreadsheet(): void {
    this.singleton = new Document();
  }

  /*
  This method passes the one spreadsheet held by the document
  */
  getSpreadsheet(): Spreadsheet {
    return this.spreadsheet;
  }
}

/*
This class is used to represet a spreadsheet of cells, extends subject so observer react components are updated
on backend.ts changes.
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
        if(this.cells[x][y].adjustForRow(1, index)) {
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
        if(this.cells[x][y].adjustForRow(-1, index)) {
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
        if(this.cells[x][y].adjustForColumn(1, index)) {
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
        if(this.cells[x][y].adjustForColumn(-1, index)) {
          this.cells[x][y].update();
        }
      }
    }
    this.cells.splice(index, 1);
    this.notify();
  }
}

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
  async updateVal(rawValue: string, ) {
    this.rawValue = rawValue;

    let value = this.parseFunctions(rawValue);
    value = await this.parseStocks(value);
    let parsed = parser.parse(value).result;
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
    for(let token of matches) {
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
    for(let token of matches) {
      let funcName = this.getFunctionName(token);
      let newValue: string = token;
      switch (funcName) {
        case "REF":
          let coords = this.getCoords(token);
          let x = this.getX(coords);
          let y = this.getY(coords);
          let cell = Document.getCell(x, y);
          cell.attach(this);
          newValue = cell.getValue();
          break;
        case "AVG":
          var first = this.getCoords1(token);
          var last = this.getCoords2(token);
          var x1 = this.getX(first);
          var y1 = this.getY(first);
          var x2 = this.getX(last);
          var y2 = this.getY(last);
          newValue = this.findAvg(x1, y1, x2, y2).toString();
          break;
        case "SUM":
          var first = this.getCoords1(token);
          var last = this.getCoords2(token);
          var x1 = this.getX(first);
          var y1 = this.getY(first);
          var x2 = this.getX(last);
          var y2 = this.getY(last);
          newValue = this.findSum(x1, y1, x2, y2).toString();
          break;
      }
      str = str.replace(token, newValue);
    }

    return str;
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
    for(let x = x1; x <= x2; x++) {
      for(let y = y1; y <= y2; y++) {
        let cell = Document.getCell(x, y);
        sum += parseFloat(cell.getValue());
        cell.attach(this);
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
    for(let x = x1; x <= x2; x++) {
      for(let y = y1; y <= y2; y++) {
        let cell = Document.getCell(x, y);
        sum += parseFloat(cell.getValue());
        cell.attach(this);
      }
    }
    return sum;
  }


  /*
  This method uses regex to discover the symbol name when a stock ticker is discovered
  input: 
  token:The stock string
  */
  getSymbol(token: string): string {
    let regex = /(?<=\()[A-Z]+(?=\))/
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }


  /*
  This method gets the coordinates for first cell in range
  input: 
  token:The string containing the cell reference
  */
  getCoords1(token: string): string {
    let regex = /(?<=\()[A-Z]+\d+/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method gets the coordinates for last cell in range
  input: 
  token:The string containing the cell reference
  */
  getCoords2(token: string): string {
    let regex = /[A-Z]+\d+(?=\))/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  /*
  This method uses regex to discover the formula name when a formula is discovered
  input: 
  token:The string containing the formula
  */
  getFunctionName(token: string): string {
    let regex = /[A-Z]+/;
    let result = regex.exec(token)
    if (result === null) return '';
    return result[0]
  }

  /*
  This method uses regex to discover the coords of a referencing formula
  input: 
  token:The string containing the formula
  */
  getCoords(token: string): string {
    let regex = /(?<=\()[A-Z]+\d+(?=\))/
    let result = regex.exec(token)
    if (result === null) return '';
    return result[0]
  }

  /*
  This method gets the x coordinate for first cell reference
  input: 
  coords:The string containing the cell reference
  */
  getX(coords: string): number {
    let regex = /[A-Z]+/
    let result = regex.exec(coords)
    if (result === null) return 0;
    return BaseConvert.decode(result[0]);
  }

  /*
  This method gets the y coordinate for first cell reference
  input: 
  coords:The string containing the cell reference
  */
  getY(coords: string): number {
    let regex = /\d+/
    let result = regex.exec(coords)
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
  isBoundedByQuotes(str: string) : boolean {
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
    //let functionRegex = /[A-Z]+\([A-Z]+\d+\)/g;
    let regex = /[A-Z]+\([A-Z]+\d+(\.\.[A-Z]+\d+)?\)/g;
    let matches = this.rawValue.match(regex);
    let changed = false;
    if (matches === null) return false;
    for (let token of matches) {
      let coords = token.match(/[A-Z]+\d+/g)
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
      console.log('asdf')
      console.log(token);
      let coords = token.match(/[A-Z]+\d+/g)
      if (coords === null) continue;
      console.log(coords);
      for (let coord of coords) {
        console.log(coord);
        let x = new Cell().getX(coord);
        let y = new Cell().getY(coord);
        if (y < afterRow) {
          console.log('skipped');
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

//All Characters + length
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const BASE_COUNT = CHARSET.length;

//Utility class for converting cell references to respective coordinate values
export class BaseConvert {

  /*
  This method encodes a number as the valid character that it represents
  input: 
  num: The number encoding of the string value
  */
  public static encode(num: number): string {
    let ret = '';

    if (num < 0) {
      return '';
    }

    if (num === 0) {
      return CHARSET[0];
    }

    while (num >= BASE_COUNT) {
      let mod = num % BASE_COUNT;
      ret = CHARSET[mod] + ret;
      num = Math.floor(num / BASE_COUNT);
    }

    if (num > 0) {
      ret = CHARSET[num] + ret;
    }

    return ret;
  }


  /*
  This method encodes a string as the valid number that it represents
  input: 
  s: The string encoding of the number value
  */
  public static decode(s: string): number {
    let decoded = 0;
    let multi = 1;
    let rev = s.split('').reverse();

    rev.forEach((char) => {
      decoded += multi * CHARSET.indexOf(char);
      multi = multi * BASE_COUNT;
    });

    return decoded;
  }
}
