import { forEachChild } from 'typescript';
const FormulaParser = require('hot-formula-parser').Parser;
const parser = new FormulaParser();

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 20;

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

  getSpreadsheet(): Spreadsheet {
    return this.spreadsheet;
  }
}

//export class Document {
//    //private spreadsheets : Spreadsheet[]
//    private spreadsheet : Spreadsheet;
//
//    constructor() {
//        this.spreadsheet = new Spreadsheet(10, 20);
//    }
//
//    //newSpreadsheet() : void {
//    //    //Todo
//    //}
//
//    //removeSpreadsheet(index : number) : void {
//    //    //Todo
//    //}
//}

export class Spreadsheet {
  private width: number;
  private height: number;
  private cells: Cell[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.cells = new Array(width);
    for (let x = 0; x < this.width; x++) {
      this.cells[x] = new Array(height);
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y] = new Cell(this);
      }
    }
  }

  findCellVal(x: number, y: number): string {
    return this.cells[x][y].getDisplay();
  }

  sumCellVals(arr: number[][]): string {
    let value = 0;
    for (let a of arr) {
      console.log(a);
      value += parseInt(this.findCellVal(a[0], a[1]));
    }
    return value.toString();
  }

  avgCellVals(arr: number[][]): string {
    let value = 0;
    for (let a of arr) {
      console.log(a);
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

  updateCell(x: number, y: number, input: string): void {
    //let exp = Parser.parse(input);
    this.cells[x][y].updateVal(input);
  }

  export(): void {
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
    console.log(data);
  }

  insertRow(index: number): void {
    this.height++;
    for (let x = 0; x < this.width; x++) {
      this.cells[x].splice(index, 0, new Cell(this));
    }
  }

  deleteRow(index: number): void {
    //Todo
  }

  insertColumn(index: number): void {
    this.width++;
    let array = [];
    for (let i = 0; i < this.height; i++) {
      array.push(new Cell(this));
    }
    this.cells.splice(index, 0, array);
  }

  deleteColumn(index: number): void {
    //Todo
  }
}

export interface IObserver {
  update(): void;
}

export abstract class Subject {
  observers: IObserver[];

  constructor() {
    this.observers = new Array();
  }

  notify(): void {
    this.observers.forEach((observer) => {
      observer.update();
    });
  }

  attach(obs: IObserver): void {
    this.observers.push(obs);
  }

  detach(obs: IObserver): void {
    let index = this.observers.indexOf(obs);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
}

export class Parser {
  public static parse(str: string): IExpression {
    let pos = -1;
    let ch = '';

    let nextChar = () => {
      ch = (++pos < str.length ? str.charAt(pos) : -1) + '';
    };

    let eat = (charToEat: string) => {
      while (ch === ' ') nextChar();
      if (ch === charToEat) {
        nextChar();
        return true;
      }
      return false;
    };

    let parse = () => {
      nextChar();
      let x = parseExpression();
      if (pos < str.length) throw new Error('Unexpected: ' + ch);
      return x;
    };

    let parseExpression: any = () => {
      let x = parseTerm();
      for (;;) {
        if (eat('+')) x += parseTerm();
        // addition
        else if (eat('-')) x -= parseTerm();
        // subtraction
        else return x;
      }
    };

    let parseTerm = () => {
      let x = parseFactor();
      for (;;) {
        if (eat('*')) x *= parseFactor();
        // multiplication
        else if (eat('/')) x /= parseFactor();
        // division
        else return x;
      }
    };

    let parseFactor: any = () => {
      if (eat('+')) return parseFactor(); // unary plus
      if (eat('-')) return -parseFactor(); // unary minus

      let x;
      let startPos = pos;
      if (eat('(')) {
        // parentheses
        x = parseExpression();
        eat(')');
      } else if ((ch >= '0' && ch <= '9') || ch === '.') {
        // numbers
        while ((ch >= '0' && ch <= '9') || ch === '.') nextChar();
        x = parseFloat(str.substring(startPos, pos));
        //} else if (ch >= 'a' && ch <= 'z') { // functions
        //    while (ch >= 'a' && ch <= 'z') nextChar();
        //    String func = str.substring(startPos, this.pos);
        //    x = parseFactor();
        //    if (func.equals("sqrt")) x = Math.sqrt(x);
        //    else if (func.equals("sin")) x = Math.sin(Math.toRadians(x));
        //    else if (func.equals("cos")) x = Math.cos(Math.toRadians(x));
        //    else if (func.equals("tan")) x = Math.tan(Math.toRadians(x));
        //    else throw new RuntimeException("Unknown function: " + func);
      } else {
        throw new Error('Unexpected: ' + ch);
      }

      if (eat('^')) x = Math.pow(x, parseFactor()); // exponentiation

      return x;
    };

    return parse();
  }

  public static reverse(exp: IExpression): string {
    //Todo
    throw new Error('Method not implemented.');
  }
}

// export class WillParse {
//   public static parse(str: string): IExpression {
//     let parse = () => {
//       if (!isNaN(parseFloat(str))) {
//         if (parseFloat(str).toString().length === str.length) {
//           return new NumberExp(parseInt(str));
//         }
//         return new StringExp(str);
//       }
//       if (str[0] === '=') {
//         let strNoEquals = str.replace('=', '');
//         if (strNoEquals.includes('+')) {
//           let opArr = strNoEquals.split('+');
//           console.log(strNoEquals);
//           console.log(opArr);
//           if (opArr.length === 2) {
//             return new OperationExp(
//               new NumberExp(parseInt(opArr[0])),
//               new NumberExp(parseInt(opArr[1])),
//               Operation.Add
//             );
//           }
//         }
//       }
//       return new StringExp(str);
//     };
//     return parse();
//   }
// }

export class Cell extends Subject implements IObserver {
  private expression: IExpression;
  private cacheValue: ICellValue;
  private rawValue: string;
  private spread: Spreadsheet;

  constructor(spread: Spreadsheet) {
    super();
    this.spread = spread;
    this.expression = new StringExp('');
    this.cacheValue = new CellString('');
    this.rawValue = '';
  }

  update(): void {
    this.cacheValue = this.expression.eval();
    this.notify();
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
        if (term === 'SUM') {
          refCellVal = this.spread.sumCellVals(allCells);
        } else {
          refCellVal = this.spread.avgCellVals(allCells);
        }
      } else {
        let lett = found.split(/[0-9]/)[0];
        let num = found.substring(lett.length);
        refCellVal = this.spread.findCellVal(
          this.findRowIndex(lett),
          parseInt(num)
        );
      }
      updatedRaw = rawVal.replace(term + '(' + found + ')', refCellVal);
    }
    return updatedRaw;
  }

  findRowIndex(str: string): number {
    return this.alphabet.indexOf(str[0].toLowerCase()) + 26 * (str.length - 1);
  }

  private alphabet = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

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
    let letter = this.alphabet[num % 26].toUpperCase();

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

  updateVal(rawValue: string): void {
    this.rawValue = rawValue;

    let noRefRaw = this.subSomeValue(rawValue, 'REF');
    noRefRaw = this.subSomeValue(noRefRaw, 'AVERAGE');
    noRefRaw = this.subSomeValue(noRefRaw, 'SUM');

    if (parser.parse(noRefRaw).result) {
      this.cacheValue = new CellString(
        parser.parse(noRefRaw).result.toString()
      );
    } else {
      this.cacheValue = new CellString(rawValue);
    }

    // this.expression = WillParse.parse(rawValue);
    // this.expression = Parser.parse(rawValue);
    // console.log(this.expression);
    // this.cacheValue = this.expression.eval();
    // this.notify()
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
