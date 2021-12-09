import { Cell } from './Cell';
import { Spreadsheet } from './Spreadsheet';

const DEFAULT_WIDTH = 10;
const DEFAULT_HEIGHT = 20;

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
