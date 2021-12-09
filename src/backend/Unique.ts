import { v4 as uuidv4 } from 'uuid';

/*
This class is used to represet a unique Identifier for any object which extends this class, 
Used to check equality without needing types.
//Params: 
id: The string representing the ID for a particular Instance
*/
export abstract class Unique {
  private id: string;

  constructor() {
    this.id = uuidv4();
  }

  /*
  This method returns the Id assigned to this object
  */
  getId(): string {
    return this.id;
  }
}
