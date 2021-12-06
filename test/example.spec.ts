import { expect } from 'chai';
//import SorterFactory from "../../src/SorterFactory";
import "../src/backend";
import { Cell } from '../src/backend';
//import { Cell } from '../src/backend';

/**
 * This is not a very good test, but is provided as an example of how
 * to implement a test on the sorter. Implement your task 1 tests here, and feel
 * free to replace this one.
 */

 describe('Cell Basics', () => {

    it('build a cell', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(A1) + REF(B2)')
        cell.adjustForColumn(1, 0);
        expect(cell.getRawValue()).to.equal('1 + REF(B1) + REF(C2)')
     })


});

describe('Row adjustments', () => {

    it('cell adjust column', () => {
       let cell = new Cell();
       cell.setRawValue('1 + REF(A1) + REF(B2)')
       cell.adjustForColumn(1, 0);
       expect(cell.getRawValue()).to.equal('1 + REF(B1) + REF(C2)')
    })

    it('cell adjust row', () => {
       let cell = new Cell();
       cell.setRawValue('1 + REF(A1) + REF(B2)')
       cell.adjustForRow(1, 0);
       expect(cell.getRawValue()).to.equal('1 + REF(A2) + REF(B3)')
    })

    it('cell adjust row', () => {
       let cell = new Cell();
       cell.setRawValue('REF(A1)')
       cell.adjustForRow(1, 0);
       expect(cell.getRawValue()).to.equal('REF(A2)')
    })

    it('cell adjust row negative', () => {
        let cell = new Cell();
        cell.setRawValue('REF(A3)')
        cell.adjustForRow(-1, 0);
        expect(cell.getRawValue()).to.equal('REF(A2)')
     })

     /*
    it('cell adjust row interleave negative', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(A2) + REF(B8)')
        cell.adjustForRow(-1, 4);
        expect(cell.getRawValue()).to.equal('1 + REF(A1) + REF(B7)')
     })

    it('cell adjust row interleave', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(A1) + REF(B8)')
        cell.adjustForRow(1, 4);
        expect(cell.getRawValue()).to.equal('1 + REF(A1) + REF(B9)')
     })
     */
});

