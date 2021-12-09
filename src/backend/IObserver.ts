/*
This class is used to represet an observer, which is implemented in subject classes which can simply call update
on instances of observer.
*/
export interface IObserver {
  /*
    This method updates the observer, in the way of the observer instance
    */
  update(): void;
}
