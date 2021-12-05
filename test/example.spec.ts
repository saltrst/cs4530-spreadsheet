import { expect } from 'chai';
//import SorterFactory from "../../src/SorterFactory";
import "../src/backend";
import { Cell, Parser } from '../src/backend';
//import { Cell } from '../src/backend';

/**
 * This is not a very good test, but is provided as an example of how
 * to implement a test on the sorter. Implement your task 1 tests here, and feel
 * free to replace this one.
 */
describe('backend tests', () => {
    //it("do something", () => {
    //    //let cell = new Cell();
    //    expect(Parser.parse('5 + (2 - 3)')).to.equal(4);
    //});

    //it('cell adjust column', () => {
    //    let cell = new Cell();
    //    cell.setRawValue('1 + REF(A1) + REF(B2)')
    //    cell.adjustForColumn(1);
    //    expect(cell.getRawValue()).to.equal('1 + REF(B1) + REF(C2)')
    //})

    //it('cell adjust row', () => {
    //    let cell = new Cell();
    //    cell.setRawValue('1 + REF(A1) + REF(B2)')
    //    cell.adjustForRow(1);
    //    expect(cell.getRawValue()).to.equal('1 + REF(A2) + REF(B3)')
    //})

    //it('cell adjust row', () => {
    //    let cell = new Cell();
    //    cell.setRawValue('REF(A1)')
    //    cell.adjustForRow(1);
    //    expect(cell.getRawValue()).to.equal('REF(A2)')
    //})
});

class Something {

    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }
}


