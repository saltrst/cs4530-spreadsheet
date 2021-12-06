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
        await cell.updateVal('AVG(A0..B2)')
        expect(cell.getRawValue()).to.equal('AVG(A0..B2)');
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
        await cell.updateVal('AVG(A0..B2)')
        expect(cell.getRawValue()).to.equal('AVG(A0..B2)');
        expect(cell.getValue()).to.equal('3');
        await cells[1][0].updateVal("31")
        expect(cell.getRawValue()).to.equal('AVG(A0..B2)');
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
        expect(sheet.getCells()[0][0].getValue()).to.equal('1');
        expect(sheet.getCells()[0][1].getValue()).to.equal('');
    })

    it('delete row', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.deleteRow(1)
        expect(sheet.getCells()[0][0].getValue()).to.equal('1');
        expect(sheet.getCells()[0][1].getValue()).to.equal('3');
    })

    it('insert column', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.insertColumn(1)
        expect(sheet.getCells()[0][0].getValue()).to.equal('1');
        expect(sheet.getCells()[1][0].getValue()).to.equal('');
    })

    it('delete column', async () => {
        let sheet = new Spreadsheet(3,3);
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                await sheet.getCells()[x][y].updateVal((x + y + 1) + '');
            }
        }
        sheet.deleteColumn(1)
        expect(sheet.getCells()[0][0].getValue()).to.equal('1');
        expect(sheet.getCells()[1][0].getValue()).to.equal('3');
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

describe('New Parser', () => {
    it('get function name', () => {
        let cell = new Cell();
        expect(cell.getFunctionName('REF(A1)')).to.equal('REF');
    })

    it('get coords', () => {
        let cell = new Cell();
        expect(cell.getCoords('REF(A1)')).to.equal('A1');
    })

    it('get x', () => {
        let cell = new Cell();
        expect(cell.getX('B4')).to.equal(1);
    })

    it('get y', () => {
        let cell = new Cell();
        expect(cell.getY('B4')).to.equal(4);
    })

    // test better
    //it('find avg', () => {
    //    new Cell().findAvg(0, 5, 0, 0);
    //})
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