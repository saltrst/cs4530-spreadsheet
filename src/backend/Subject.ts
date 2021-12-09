import { Unique } from './Unique';
import { IObserver } from './IObserver';
import { Cell } from './Cell';

/*
This class is used to represet a subject in the observer design pattern, this is critical for quick cell referencing and 
visual updating. 
//Params: 
observers: All of the observers which view this subject and must be notified on updates.
*/
export abstract class Subject extends Unique {
  observers: IObserver[];
  subjects: Subject[];

  constructor() {
    super();
    this.observers = new Array();
    this.subjects = new Array();
  }

  /*
    This method calls update on all of it's observers
    */
  notify(): void {
    this.observers.forEach((observer) => {
      observer.update();
    });
  }

  /*
    This method attaches an observer
    //inputs: 
    obs: the observer to attach
    */
  attach(obs: IObserver): void {
    if (this.isCyclical(obs)) {
      this.detach(obs);
      throw new Error('Cyclical reference!');
    }
    this.observers.push(obs);
    if (obs instanceof Subject) {
      obs.subjects.push(this);
    }
  }

  /*
    This method detaches an observer
    //inputs: 
    obs: the observer to detach
    */
  detach(obs: IObserver): void {
    let index = this.observers.indexOf(obs);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  clear() {
    if (this instanceof Cell) {
      for (let subject of this.subjects) {
        subject.detach(this);
      }
    }
    this.subjects = new Array();
  }

  /*
    This method computes wether this object is a Cell that is already an observer of the passed observer
    //inputs: 
    obs: the observer which may or may not be cyclically ahead of this
    */
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

    if (obs instanceof Cell) {
      let cell: Cell = obs;
      for (let o of cell.observers) {
        if (o instanceof Cell) {
          let c: Cell = o;
          if (c.getId() == this.getId()) {
            return true;
          }
          if (this instanceof Cell) {
            if (this.isCyclical(c)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}
