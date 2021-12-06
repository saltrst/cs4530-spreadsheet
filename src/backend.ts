import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const FormulaParser = require('hot-formula-parser').Parser;
const parser = new FormulaParser();

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 20;

export abstract class Unique {
  private id: string;

  constructor() {
    this.id = uuidv4();
  }

  getId(): string {
    return this.id
  }
}

export interface IObserver {
  update(): void;
}

export abstract class Subject extends Unique {
  observers: IObserver[];

  constructor() {
    super();
    this.observers = new Array();
  }

  notify(): void {
    this.observers.forEach((observer) => {
      observer.update();
    });
  }

  attach(obs: IObserver): void {
    if (this.isCyclical(obs)) {
      this.detach(obs);
      throw new Error("Cyclical reference!");
    }
    this.observers.push(obs);
  }

  detach(obs: IObserver): void {
    let index = this.observers.indexOf(obs);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

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

    if (obs instanceof Cell) {
      let cell: Cell = obs;
      for (let o of cell.observers) {
        if (o instanceof Cell) {
          let c: Cell = o;
          if (c.getId() == this.getId()) {
            return true;
          }
          if (this instanceof Cell) {
            if (this.isCyclical(c)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}

export class Document {
  private spreadsheet: Spreadsheet;

  private static singleton: Document;
  private constructor() {
    this.spreadsheet = new Spreadsheet(DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }

  public static instance(): Document {
    if (this.singleton === undefined) {
      this.singleton = new Document();
    }
    return this.singleton;
  }

  public static getSpreadsheet(): Spreadsheet {
    return Document.instance().getSpreadsheet();
  }

  public static getCell(x: number, y: number): Cell {
    return Document.instance().getSpreadsheet().getCells()[x][y];
  }

  public static resetSpreadsheet(): void {
    this.singleton = new Document();
  }

  getSpreadsheet(): Spreadsheet {
    return this.spreadsheet;
  }
}

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

  findCellVal(x: number, y: number): string {
    return this.cells[x][y].getDisplay();
  }

  findAndAttachToCell(c: Cell, x: number, y: number): void {
    this.cells[x][y].detach(c);
    try {
      this.cells[x][y].attach(c);
    } catch (Error) {
      c.safeUpdateVal("Error!");
      this.cells[x][y].safeUpdateVal('Error!');
    }
  }

  sumCellVals(arr: number[][]): string {
    let value = 0;
    for (let a of arr) {
      value += parseInt(this.findCellVal(a[0], a[1]));
    }
    return value.toString();
  }

  avgCellVals(arr: number[][]): string {
    let value = 0;
    for (let a of arr) {
      value += parseInt(this.findCellVal(a[0], a[1]));
    }
    return (value / arr.length).toString();
  }

  getCells(): Cell[][] {
    return this.cells;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

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

  drawEverything() {
    for (let cellArr of this.cells) {
      for (let cell of cellArr) {
        cell.notify();
      }
    }
  }

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

export class Cell extends Subject implements IObserver {
  private cacheValue: string;
  private rawValue: string;

  constructor(testVal?: string) {
    super();
    this.cacheValue = '';
    this.rawValue = testVal || '';
  }

  update(): void {
    this.updateVal(this.rawValue);
    this.notify();
  }

  setRawValue(val: string) {
    this.rawValue = val;
  }

  subSomeValue(rawVal: string, term: string): string {
    let updatedRaw = rawVal;
    while (updatedRaw.includes(term + '(')) {
      let start = updatedRaw.indexOf(term + '(');
      let finish = updatedRaw.indexOf(')', start);
      let found = updatedRaw.substring(start + term.length + 1, finish);
      let refCellVal = '';
      if (term === 'SUM' || term === 'AVERAGE') {
        let cellRange = this.parseCellArray(found);
        let allCells = this.fillCellArray(cellRange);
        for (let a of allCells) {
          Document.getSpreadsheet().findAndAttachToCell(this, a[0], a[1]);
        }
        if (term === 'SUM') {
          refCellVal = Document.getSpreadsheet().sumCellVals(allCells);
        } else {
          refCellVal = Document.getSpreadsheet().avgCellVals(allCells);
        }
      } else if (term === 'REF') {
        let lett = found.split(/[0-9]/)[0];
        let num = found.substring(lett.length);

        Document.getSpreadsheet().findAndAttachToCell(
          this,
          this.findRowIndex(lett),
          parseInt(num)
        );
        refCellVal = Document.getSpreadsheet().findCellVal(
          this.findRowIndex(lett),
          parseInt(num)
        );
      }
      updatedRaw = rawVal.replace(term + '(' + found + ')', refCellVal);
    }
    return updatedRaw;
  }

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

  findRowIndex(str: string): number {
    return BaseConvert.decode(str);
  }

  fillCellArray(arr: string[]): Array<number[]> {
    let a = [];
    let lett1 = arr[0].split(/[0-9]/)[0];
    let lett2 = arr[1].split(/[0-9]/)[0];
    let num1 = parseInt(arr[0].substring(lett1.length));
    let num2 = parseInt(arr[1].substring(lett2.length));

    let sortedLetts = [lett1, lett2].sort(function (a, b) {
      return a.length - b.length || a.localeCompare(b);
    });

    let colStart = this.findRowIndex(sortedLetts[0]);
    let colEnd = this.findRowIndex(sortedLetts[1]);
    let rowStart = Math.min(num1, num2);
    let rowEnd = Math.max(num1, num2);

    for (let i = colStart; i <= colEnd; i++) {
      for (let j = rowStart; j <= rowEnd; j++) {
        a.push([i, j]);
      }
    }

    return a;
  }

  colIndexToColName(num: number): string {
    let name = '';
    let repititions = Math.floor(num / 26) + 1;
    let letter = BaseConvert.encode(num);

    for (let i = 0; i < repititions; i++) {
      name += letter;
    }

    return name;
  }

  parseCellArray(found: string): string[] {
    let arr = [];
    let v = found.split('..');
    let v1 = v[0];
    let v2 = v[1];
    arr.push(v1);
    arr.push(v2);
    return arr;
  }

  safeUpdateVal(rawValue: string) {
    this.rawValue = rawValue;
    this.cacheValue = rawValue;
  }

  async updateVal(rawValue: string, ) {
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

    //let noRefRaw: string = this.subSomeValue(rawValue, 'REF');
    //noRefRaw = this.subSomeValue(noRefRaw, 'AVERAGE');
    //noRefRaw = this.subSomeValue(noRefRaw, 'SUM');
    //noRefRaw = await this.subStockTickerValue(noRefRaw, '$');

    //let parsed = parser.parse(noRefRaw).result;
    //let type = typeof parsed;
    //if (parsed && type === 'number') {
    //  this.cacheValue = parsed.toString();
    //} else {
    //  this.cacheValue = this.concatIfCan(noRefRaw);
    //}

    this.notify();
  }

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
          newValue = cell.getValue();
          try {
            cell.attach(this);
          } catch (Error) {
            newValue = "Error!";
          }
          break;
        case "AVG":
          var first = this.getCoords1(token);
          var last = this.getCoords2(token);
          var x1 = this.getX(first);
          var y1 = this.getY(first);
          var x2 = this.getX(last);
          var y2 = this.getY(last);
          newValue = this.findAvg(x1, y1, x2, y2).toString();
          if (this.attachRange(x1, y1, x2, y2)) {
            newValue = "Error!";
          }
          break;
        case "SUM":
          var first = this.getCoords1(token);
          var last = this.getCoords2(token);
          var x1 = this.getX(first);
          var y1 = this.getY(first);
          var x2 = this.getX(last);
          var y2 = this.getY(last);
          newValue = this.findSum(x1, y1, x2, y2).toString();
          if (this.attachRange(x1, y1, x2, y2)) {
            newValue = "Error!";
          }
          break;
      }
      str = str.replace(token, newValue);
    }
    return str;
  }

  // returns true if there is an error
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
    for(let x = x1; x <= x2; x++) {
      for(let y = y1; y <= y2; y++) {
        let cell = Document.getCell(x, y);
        try {
          cell.attach(this);
        } catch (Error) {
          return true
        }
      }
    }
    return false
  }

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
        //cell.attach(this);
        count++;
      }
    }
    return sum / count;
  }

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
        //cell.attach(this);
      }
    }
    return sum;
  }

  getSymbol(token: string): string {
    let regex = /(?<=\()[A-Z]+(?=\))/
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  // gets the coordidinates for first cell in range
  getCoords1(token: string): string {
    let regex = /(?<=\()[A-Z]+\d+/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  // gets the coordidinates for last cell in range
  getCoords2(token: string): string {
    let regex = /[A-Z]+\d+(?=\))/;
    let result = regex.exec(token);
    if (result === null) return '';
    return result[0];
  }

  getFunctionName(token: string): string {
    let regex = /[A-Z]+/;
    let result = regex.exec(token)
    if (result === null) return '';
    return result[0]
  }

  getCoords(token: string): string {
    let regex = /(?<=\()[A-Z]+\d+(?=\))/
    let result = regex.exec(token)
    if (result === null) return '';
    return result[0]
  }

  getX(coords: string): number {
    let regex = /[A-Z]+/
    let result = regex.exec(coords)
    if (result === null) return 0;
    return BaseConvert.decode(result[0]);
  }

  getY(coords: string): number {
    let regex = /\d+/
    let result = regex.exec(coords)
    if (result === null) return 0;
    return parseInt(result[0]);
  }

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

  isBoundedByQuotes(str: string) {
    return str[0] === '"' && str[str.length - 1] === '"';
  }

  clear(): void {
    this.updateVal('');
    this.notify();
  }

  getValue(): string {
    return this.cacheValue;
  }

  //TODO DELETE THIS
  getDisplay(): string {
    return this.cacheValue;
  }

  getRawValue(): string {
    return this.rawValue;
  }

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

  adjustForRow(amount: number, afterRow: number): boolean {
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

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const BASE_COUNT = CHARSET.length;
export class BaseConvert {
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
