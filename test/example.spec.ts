import { expect } from 'chai';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';
//import SorterFactory from "../../src/SorterFactory";
import "../src/backend";
import { Cell, Spreadsheet, Document } from '../src/backend';
//import { Cell } from '../src/backend';

/**
 * This is not a very good test, but is provided as an example of how
 * to implement a test on the sorter. Implement your task 1 tests here, and feel
 * free to replace this one.
 */

 describe('Cell Basics', () => {

    it('build a cell', () => {
        let cell = new Cell();
        expect(cell.getRawValue()).to.equal('');
        expect(cell.getValue()).to.equal('');
     })

     it('update a cell numeric', async () => {
        let cell = new Cell();
        await cell.updateVal('5')
        expect(cell.getRawValue()).to.equal('5');
        expect(cell.getValue()).to.equal('5');
     })

     it('update a cell +', async () => {
        let cell = new Cell();
        await cell.updateVal('5 + 8')
        expect(cell.getRawValue()).to.equal('5 + 8');
        expect(cell.getValue()).to.equal('13');
     })

     it('update a cell -', async () => {
        let cell = new Cell();
        await cell.updateVal('5 - 8')
        expect(cell.getRawValue()).to.equal('5 - 8');
        expect(cell.getValue()).to.equal('-3');
     })

     it('update a cell *', async () => {
        let cell = new Cell();
        await cell.updateVal('5 * 8')
        expect(cell.getRawValue()).to.equal('5 * 8');
        expect(cell.getValue()).to.equal('40');
     })

     it('update a cell /', async () => {
        let cell = new Cell();
        await cell.updateVal('5 / 8')
        expect(cell.getRawValue()).to.equal('5 / 8');
        expect(cell.getValue()).to.equal('0.625');
     })

     it('update a cell ^', async () => {
        let cell = new Cell();
        await cell.updateVal('5^2')
        expect(cell.getRawValue()).to.equal('5^2');
        expect(cell.getValue()).to.equal('25');
     })

     it('update a cell ()', async () => {
        let cell = new Cell();
        await cell.updateVal('(5 + 2) * 12')
        expect(cell.getRawValue()).to.equal('(5 + 2) * 12');
        expect(cell.getValue()).to.equal('84');
     })

     it('update a cell string', async () => {
        let cell = new Cell();
        await cell.updateVal('hello')
        expect(cell.getRawValue()).to.equal('hello');
        expect(cell.getValue()).to.equal('hello');
     })

     it('update a cell string concat', async () => {
        let cell = new Cell();
        await cell.updateVal('"hello"+"goodbye"')
        expect(cell.getRawValue()).to.equal('"hello"+"goodbye"');
        expect(cell.getValue()).to.equal('hellogoodbye');
     })

     /*
     it('update a cell string concat spacing', async () => {
        let cell = new Cell();
        await cell.updateVal('"hello" + "goodbye"  ')
        expect(cell.getRawValue()).to.equal('"hello" + "goodbye"  ');
        expect(cell.getValue()).to.equal('hellogoodbye');
     })
     */

     it('update a cell ref', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("1")
        await cell.updateVal('REF(A0)')
        expect(cell.getRawValue()).to.equal('REF(A0)');
        expect(cell.getValue()).to.equal('1');
    })

    /*
    it('update a double cell ref', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("3")
        await cells[1][1].updateVal("5")
        await cell.updateVal('REF(A0) * REF(B1)')
        expect(cell.getRawValue()).to.equal('REF(A0) * REF(B1)');
        expect(cell.getValue()).to.equal('15');
    })
    */

    it('update a cell ref chained', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        let cell2 = cells[0][0];
        await cells[1][1].updateVal("56");
        await cell2.updateVal("REF(B1)")
        await cell.updateVal('REF(A0)')
        expect(cell.getRawValue()).to.equal('REF(A0)');
        expect(cell.getValue()).to.equal('56');
    })

    it('update a cell ref arithmatic', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("2")
        await cell.updateVal('REF(A0) * 4')
        expect(cell.getRawValue()).to.equal('REF(A0) * 4');
        expect(cell.getValue()).to.equal('8');
    })

    it('update a cell ref arithmatic bad', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("oops")
        await cell.updateVal('REF(A0) * 4')
        expect(cell.getRawValue()).to.equal('REF(A0) * 4');
        expect(cell.getValue()).to.equal('oops * 4');
    })
    

    it('update a cell ref with string', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("hello")
        await cell.updateVal('REF(A0)')
        expect(cell.getRawValue()).to.equal('REF(A0)');
        expect(cell.getValue()).to.equal('hello');
    })


    //WHAT HAPPENS
    // it('update a cell self ref', async () => {
    //     Document.resetSpreadsheet();
    //     let spread = Document.getSpreadsheet();
    //     let cells = spread.getCells();
    //     let cell = cells[3][3];
    //     await cell.updateVal('REF(D3)')
    //     expect(cell.getRawValue()).to.equal('REF(D3)');
    //     expect(cell.getValue()).to.equal('');
    // })

    
    it('update a cell sum', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("1")
        await cells[1][1].updateVal("1")
        await cells[0][2].updateVal("1")
        await cells[1][0].updateVal("1")
        await cells[0][1].updateVal("1")
        await cells[1][2].updateVal("1")
        await cell.updateVal('SUM(A0..B2)')
        expect(cell.getRawValue()).to.equal('SUM(A0..B2)');
        expect(cell.getValue()).to.equal('6');
    })

    it('update a cell average', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("1")
        await cells[1][1].updateVal("2")
        await cells[0][2].updateVal("6")
        await cells[1][0].updateVal("1")
        await cells[0][1].updateVal("2")
        await cells[1][2].updateVal("6")
        await cell.updateVal('AVERAGE(A0..B2)')
        expect(cell.getRawValue()).to.equal('AVERAGE(A0..B2)');
        expect(cell.getValue()).to.equal('3');
    })


    it('update a cell ref with observer pattern', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("1")
        await cell.updateVal('REF(A0)')
        expect(cell.getRawValue()).to.equal('REF(A0)');
        expect(cell.getValue()).to.equal('1');
        await cells[0][0].updateVal("cat")
        expect(cell.getRawValue()).to.equal('REF(A0)');
        expect(cell.getValue()).to.equal('cat');
    })

    it('update a cell average from observer pattern', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("1")
        await cells[1][1].updateVal("2")
        await cells[0][2].updateVal("6")
        await cells[1][0].updateVal("1")
        await cells[0][1].updateVal("2")
        await cells[1][2].updateVal("6")
        await cell.updateVal('AVERAGE(A0..B2)')
        expect(cell.getRawValue()).to.equal('AVERAGE(A0..B2)');
        expect(cell.getValue()).to.equal('3');
        await cells[1][0].updateVal("31")
        expect(cell.getRawValue()).to.equal('AVERAGE(A0..B2)');
        expect(cell.getValue()).to.equal('8');
    })
    
    it('update a cell sum', async () => {
        Document.resetSpreadsheet();
        let spread = Document.getSpreadsheet();
        let cells = spread.getCells();
        let cell = cells[3][3];
        await cells[0][0].updateVal("1")
        await cells[1][1].updateVal("1")
        await cells[0][2].updateVal("1")
        await cells[1][0].updateVal("1")
        await cells[0][1].updateVal("1")
        await cells[1][2].updateVal("1")
        await cell.updateVal('SUM(A0..B2)')
        expect(cell.getRawValue()).to.equal('SUM(A0..B2)');
        expect(cell.getValue()).to.equal('6');
        await cells[1][2].updateVal("100");
        expect(cell.getRawValue()).to.equal('SUM(A0..B2)');
        expect(cell.getValue()).to.equal('105');
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

     
    it('cell adjust row interleave negative', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(A2) + REF(B8)')
        cell.adjustForRow(-1, 4);
        expect(cell.getRawValue()).to.equal('1 + REF(A2) + REF(B7)')
     })

    it('cell adjust row interleave', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(A1) + REF(B8)')
        cell.adjustForRow(1, 4);
        expect(cell.getRawValue()).to.equal('1 + REF(A1) + REF(B9)')
     })

     it('cell adjust column interleave negative', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(A2) + REF(D12)')
        cell.adjustForColumn(-1, 3);
        expect(cell.getRawValue()).to.equal('1 + REF(A2) + REF(C12)')
     })

    it('cell adjust column interleave', () => {
        let cell = new Cell();
        cell.setRawValue('1 + REF(B2) + REF(D12)')
        cell.adjustForColumn(1, 3);
        expect(cell.getRawValue()).to.equal('1 + REF(B2) + REF(E12)')
     })

     /*
     it('avg adjust column', () => {
        let cell = new Cell();
        cell.setRawValue('1 + AVERAGE(C4..D5)')
        cell.adjustForColumn(1, 0);
        expect(cell.getRawValue()).to.equal('1 + AVERAGE(D5..E6)')
     })
 
     it('avg adjust row', () => {
        let cell = new Cell();
        cell.setRawValue('1 + AVERAGE(C4..D5)')
        cell.adjustForRow(1, 0);
        expect(cell.getRawValue()).to.equal('1 + AVERAGE(C5..D6)')
     })

     it('sum adjust column', () => {
        let cell = new Cell();
        cell.setRawValue('1 + SUM(C4..D5)')
        cell.adjustForColumn(1, 0);
        expect(cell.getRawValue()).to.equal('1 + SUM(D5..E6)')
     })
 
     it('sum adjust row', () => {
        let cell = new Cell();
        cell.setRawValue('1 + SUM(C4..D5)')
        cell.adjustForRow(1, 0);
        expect(cell.getRawValue()).to.equal('1 + SUM(C5..D6)')
     })
     */
     
});

