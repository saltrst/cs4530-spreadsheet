import { expect } from 'chai';
//import SorterFactory from "../../src/SorterFactory";
import "../src/backend";
import { Parser } from '../src/backend';
//import { Cell } from '../src/backend';

/**
 * This is not a very good test, but is provided as an example of how
 * to implement a test on the sorter. Implement your task 1 tests here, and feel
 * free to replace this one.
 */
describe("blackbox tests for sorter", () => {
    it("do something", () => {
        //let cell = new Cell();
        expect(Parser.parse('5 + (2 - 3)')).to.equal(4);
    });
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


