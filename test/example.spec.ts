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

class Something {

    private value: number;

    constructor(value: number) {
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }
}


