import { expect } from 'chai';
import "../src/backend";
import { BaseConvert, Cell, Spreadsheet, Subject } from '../src/backend';
import { IObserver } from '../src/backend';
import { Document } from '../src/backend';

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

describe('Subject', () => {

    it('notifies', () => {
        let subject = new TestSubject();
        let observer = new TestSubject();

        subject.attach(observer);
        subject.notify()

        expect(observer.getUpdateCount()).to.equal(1);
     })

     it('attaches', () => {
        let subject = new TestSubject();
        let observer = new TestSubject();

        subject.attach(observer);

        expect(subject.observers.length).to.equal(1);
     })

     it('detaches', () => {
        let subject = new TestSubject();
        let observer = new TestSubject();

        subject.attach(observer);
        subject.detach(observer);

        expect(subject.observers.length).to.equal(0);
     })

     it('checks self-reference', () => {
        let subAndObs = new Cell();

        expect(()=>{subAndObs.attach(subAndObs)}).to.throw(Error);
     })

     //it('checks cyclical', () => {
     //   let cellA = new Cell();
     //   let cellB = new Cell();
     //   let cellC = new Cell();

     //   cellA.attach(cellB);

     //   cellB.attach(cellC);

     //   expect(()=>{cellC.attach(cellA);}).to.throw(Error);
     //})
});

describe('Document', () => {
    
    it('singleton', () => {
        expect(Document.instance()).to.equal(Document.instance());
    })

})

describe('Spreadsheet', () => {
    it('constructs', () =>{
        let sheet = new Spreadsheet(20, 10);
        expect(sheet.getCells().length).to.equal(20);
        expect(sheet.getCells()[0].length).to.equal(10);
    })

    it('find cell val', () => {
        let sheet = new Spreadsheet(20, 10);
        sheet.getCells()[5][5].updateVal('hello').then(() => {
            expect(sheet.findCellVal(5, 5)).to.equal('hello');
        })
    })

    it('find cell val null', () => {
        let sheet = new Spreadsheet(20, 10);
        sheet.getCells()[5][5].updateVal('hello').then(() => {
            expect(sheet.findCellVal(5, 6)).to.equal('');
        })
    })

    // not sure how to test this
    //it('find and attach to cell', () => {
    //    let sheet = new Spreadsheet(20, 10);
    //    let cell = new Cell();
    //    sheet.findAndAttachToCell(cell, 5, 5);
    //})

    it('sum cells', async () => {
        let sheet = new Spreadsheet(10, 10);

        for (let i = 0; i < 5; i ++) {
            await sheet.getCells()[0][i].updateVal('5');
        }

        expect(sheet.sumCellVals([[0,0], [0,1], [0,2], [0,3], [0,4]])).to.equal('25');
    })

    it('avg cells', async () => {
        let sheet = new Spreadsheet(10, 10);

        for (let i = 0; i < 5; i ++) {
            await sheet.getCells()[0][i].updateVal((i + 1) + '');
        }

        expect(sheet.avgCellVals([[0,0], [0,1], [0,2], [0,3], [0,4]])).to.equal('3');
    })

    it('get csv', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        console.log(sheet.getCSV());
        expect(sheet.getCSV()).to.equal("1,2,3,\n2,3,4,\n3,4,5,\n");
    })

    it('insert row', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.insertRow(1)
        expect(sheet.getCells()[0][0].getDisplay()).to.equal('1');
        expect(sheet.getCells()[0][1].getDisplay()).to.equal('');
    })

    it('delete row', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.deleteRow(1)
        expect(sheet.getCells()[0][0].getDisplay()).to.equal('1');
        expect(sheet.getCells()[0][1].getDisplay()).to.equal('3');
    })

    it('insert column', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.insertColumn(1)
        expect(sheet.getCells()[0][0].getDisplay()).to.equal('1');
        expect(sheet.getCells()[1][0].getDisplay()).to.equal('');
    })

    it('delete column', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.deleteColumn(1)
        expect(sheet.getCells()[0][0].getDisplay()).to.equal('1');
        expect(sheet.getCells()[1][0].getDisplay()).to.equal('3');
    })
})

describe('BaseConvert', () => {
    it('encodes values', () => {
        expect(BaseConvert.encode(9)).to.equal('J');
    })

    it('decodes values', () => {
        expect(BaseConvert.decode('B')).to.equal(1);
    })

    it('fuzz', () => {
        for (let i = 0; i < 100; i++) {
            let num = Math.floor(Math.random() * 100000);
            expect(BaseConvert.decode(BaseConvert.encode(num))).to.equal(num);
        }
    })
})

class TestSubject extends Subject implements IObserver {
    count: number = 0;

    constructor() {
        super();
    }

    update() {
        this.count++
    }

    getUpdateCount(): number {
        return this.count;
    }
}