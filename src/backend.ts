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
      console.log('cyclical reference!');
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
        if (cellValue.getKind() === CellKind.Number) {
          value += cellValue.getNumber();
        } else {
          value += cellValue.getString();
        }
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
      this.cells[x].splice(index, 0, new Cell('New Row @ index : ' + index));
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y].adjustForRow(1, index);
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
        this.cells[x][y].adjustForRow(-1, index);
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
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y].adjustForColumn(1, index);
      }
    }
    this.cells.splice(index, 0, array);
    this.notify();
  }

  deleteColumn(index: number): void {
    this.width--;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y].adjustForColumn(-1, index);
      }
    }
    this.cells.splice(index, 1);
    this.notify();
  }
}

export class Cell extends Subject implements IObserver {
  private cacheValue: ICellValue;
  private rawValue: string;

  constructor(testVal?: string) {
    super();
    this.cacheValue = new CellString('');
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
    console.log('tucker: ', ticker);
    const url: string =
      'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' +
      ticker +
      '&apikey=4BUCZWKTB2069YPE';
    try {
      const response: any = await axios.get(url);
      console.log(response);
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
    this.cacheValue = new CellString(rawValue);
  }

  async updateVal(rawValue: string, ) {
    this.rawValue = rawValue;

    let noRefRaw: string = this.subSomeValue(rawValue, 'REF');
    noRefRaw = this.subSomeValue(noRefRaw, 'AVERAGE');
    noRefRaw = this.subSomeValue(noRefRaw, 'SUM');
    noRefRaw = await this.subStockTickerValue(noRefRaw, '$');

    let parsed = parser.parse(noRefRaw).result;
    let type = typeof parsed;
    if (parsed && type === 'number') {
      this.cacheValue = new CellString(parsed.toString());
    } else {
      this.cacheValue = new CellString(this.concatIfCan(noRefRaw));
    }

    this.notify();
  }

  concatIfCan(str: string): string {
    let strRef = str.split('+');
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

  getValue(): ICellValue {
    return this.cacheValue;
  }

  getDisplay(): string {
    if (this.cacheValue.getKind() === CellKind.Number) {
      return this.cacheValue.getNumber() + '';
    } else {
      return this.cacheValue.getString();
    }
  }

  getRawValue(): string {
    return this.rawValue;
  }

  adjustForColumn(amount: number, afterCol: number) {
    let functionRegex = /[A-Z]+\([A-Z]+\d+\)/g;
    let matches = this.rawValue.match(functionRegex);
    if (matches === null) return;
    for (let match of matches) {
      let exec = /\([A-Z]/g.exec(match);
      if (exec === null) continue;
      let oldVal = exec[0].substr(1);
      let colNum = BaseConvert.decode(oldVal);
      if (colNum < afterCol) {
        continue;
      }
      let newVal = BaseConvert.encode(colNum + amount);
      let newStr = match.replace(oldVal, newVal);

      this.rawValue = this.rawValue.replace(match, newStr);
    }
  }

  adjustForRow(amount: number, afterRow: number) {
    let functionRegex = /[A-Z]+\([A-Z]+\d+\)/g;
    let matches = this.rawValue.match(functionRegex);
    if (matches === null) return;
    console.log("matches");
    console.log(matches);
    for (let match of matches) {
      let exec = /\d+\)/g.exec(match);
      if (exec === null) continue;
      let oldVal = exec[0].substr(0, exec[0].length - 1);
      if (parseInt(oldVal) < afterRow) {
        continue;
      }
      let newVal = parseInt(oldVal) + amount + '';
      let newStr = match.replace(oldVal, newVal);

      this.rawValue = this.rawValue.replace(match, newStr);
    }
  }
}

export enum CellKind {
  String,
  Number,
}

export interface ICellValue {
  getKind(): CellKind;
  getNumber(): number;
  getString(): string;
}

export class CellString implements ICellValue {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  getKind(): CellKind {
    return CellKind.String;
  }

  getNumber(): number {
    return 0;
  }

  getString(): string {
    return this.value;
  }
}

export class CellNumber implements ICellValue {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  getKind(): CellKind {
    return CellKind.Number;
  }

  getNumber(): number {
    return this.value;
  }

  getString(): string {
    return '';
  }
}

export enum Operation {
  Add,
  Mult,
  Sub,
  Div,
}

export interface IExpression {
  eval(): ICellValue;
}

export class OperationExp implements IExpression {
  left: IExpression;
  right: IExpression;
  op: Operation;

  constructor(left: IExpression, right: IExpression, op: Operation) {
    this.left = left;
    this.right = right;
    this.op = op;
  }

  eval(): ICellValue {
    let value;
    switch (this.op) {
      case Operation.Add:
        value = this.left.eval().getNumber() + this.right.eval().getNumber();
        break;
      case Operation.Sub:
        value = this.left.eval().getNumber() - this.right.eval().getNumber();
        break;
      case Operation.Mult:
        value = this.left.eval().getNumber() * this.right.eval().getNumber();
        break;
      case Operation.Div:
        value = this.left.eval().getNumber() / this.right.eval().getNumber();
        break;
      default:
        throw new Error('Unknown operator ' + this.op);
    }
    return new CellNumber(value);
  }
}

export class CellReferenceExp implements IExpression {
  cell: Cell;

  constructor(cell: Cell) {
    this.cell = cell;
  }

  eval(): ICellValue {
    return this.cell.getValue();
  }
}

export class NumberExp implements IExpression {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  eval(): ICellValue {
    return new CellNumber(this.value);
  }
}

export enum RangeOperation {
  Sum,
  Avg,
  Max,
  Min,
}

export class RangeReferenceExp implements IExpression {
  cells: Cell[];
  op: RangeOperation;

  constructor(cells: Cell[], op: RangeOperation) {
    this.cells = cells;
    this.op = op;

    if (this.cells.length === 0) {
      throw new Error('Empty range reference');
    }
  }

  eval(): ICellValue {
    switch (this.op) {
      case RangeOperation.Avg:
        return this.doAvg();
      case RangeOperation.Sum:
        return this.doSum();
      case RangeOperation.Max:
        return this.doMax();
      case RangeOperation.Min:
        return this.doMin();
    }
  }

  doAvg(): ICellValue {
    let value = 0;
    for (let i = 0; i < this.cells.length; i++) {
      value += this.cells[i].getValue().getNumber();
    }
    value = value / this.cells.length;
    return new CellNumber(value);
  }

  doSum(): ICellValue {
    let value = 0;
    for (let i = 0; i < this.cells.length; i++) {
      value += this.cells[i].getValue().getNumber();
    }
    return new CellNumber(value);
  }

  doMax(): ICellValue {
    let value = this.cells[0].getValue().getNumber();
    for (let i = 0; i < this.cells.length; i++) {
      let next = this.cells[i].getValue().getNumber();
      if (next > value) {
        value = next;
      }
    }
    return new CellNumber(value);
  }

  doMin(): ICellValue {
    let value = this.cells[0].getValue().getNumber();
    for (let i = 0; i < this.cells.length; i++) {
      let next = this.cells[i].getValue().getNumber();
      if (next < value) {
        value = next;
      }
    }
    return new CellNumber(value);
  }
}

//export class APIExp implements IExpression {
//    URL : string
//    parameter : string
//    eval(): ICellValue {
//        //Todo
//        throw new Error("Method not implemented.");
//    }
//}

export class StringExp implements IExpression {
  value: string;

  constructor(value: string) {
    this.value = value;
  }

  eval(): ICellValue {
    return new CellString(this.value);
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
