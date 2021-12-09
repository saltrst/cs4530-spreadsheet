# CS4530 Spreadsheet Project Overview

This application is a spreadsheet that allows for a user to store numeric constants, string constants, cell references, range expressions, formulas, string concatenation, and stock ticker references within different cells in a table.

### Installation Instructions

1. Download the release from this repository containing the "final-submission" tag
2. Unpack the zip file
3. Install all project dependencies by running

```jsx
npm install
```

1. Launch the project by running

```jsx
npm start
```

1. Run the project tests by running

```jsx
npm test
```

### Types of Cells

- A cell reference (e.g. REF(B2) refers to the value contained in another cell in the sheet.
- A range expression is an expression that refers to a range of values in the sheet (e.g., SUM(B2..D5), AVERAGE(B2..D5) ) refers to the sum or average of the values contained in the specified range).
- A formula is an arithmetic expression using common operators (addition, subtraction, multiplication, division, exponentiation).
- String concatenations (e.g. "zip" + "zap") are denoted by wrapping terms in double quotations with an addition operator between them
- Stock ticker references (e.g. $(TSLA))

### Core Functionality

**String / Numeric Constants**

```jsx
// User types one of the following into a cell:
Hello, World! || 43
```

The spreadsheet allows for a user to enter either string or numerical values into a cell in the spreadsheet. The user must click on a cell in order to begin editing the cell, and can save the entered information either by pressing the 'Enter' button or by clicking outside of the cell.

**Cell References**

```jsx
// User types the following into a cell:
REF(B3);
```

The spreadsheet allows for a user to enter a cell reference by entering the cell reference key term ('REF') followed by an open parenthesis, a reference to another existing cell on the spreadsheet, and a closing parenthesis. If a user entered the value '9' into cell B3, and then entered the value 'REF(B3)' into cell B4, the cell B4 would read as '9'. Reference cells can also be used within formula expressions.

**Range Expressions**

```jsx
// User types one of the following into a cell:
SUM(B2..D5) || AVERAGE(B2..D5)
```

The spreadsheet allows for a user to evaluate a cell range expression by entering the cell reference key term ('SUM', or 'AVERAGE') followed by an open parenthesis, a reference to a cell on the spreadsheet, two periods, a second reference to a cell on the spreadsheet, and a closing parenthesis. Based upon the provided keyword, the expression will either sum or average the values of the cells within the provided range. Range expressions function solely with numerical constant cells, formulas, stock tickers, as well as cell references to any of those types of cells.

**Arithmetic Formulas**

```jsx
// User types the following into a cell:
(7 + 45 / 5) ^ (2 * 10);
// Evaluates to 817
```

The spreadsheet allows for a user to evaluate a formula by entering arithmetic (e.g. 6 + 7) into a cell on the spreadsheet. The formula may contain cell references, range expressions, and stock ticker references in addition to numeric constants (e.g. 6 \* REF(C2)). The usual operator precedence rules are respected, and formulas can contain parentheses.

**String Concatenation**

```jsx
// User types the following into a cell:
'zip' + 'zap';
// Evaluates to zipzap
```

The spreadsheet allows for a user to concatenate strings by using the addition operator with two terms, each surrounded by double quotations. Only two strings may be concatenated to each other at once within a cell.

### Cell, Row, and Column Management

**Clearing a Cell**

A user can clear a cell simply by clicking on a cell containing a value. Upon clicking on the cell, the contents of the cell will be highlighted indicating selection, and can be easily cleared by pressing the 'Delete' or 'Backspace' button.

**Adding a Row**

A user can add a row to the spreadsheet by clicking on a cell in the left-hand-side numerical header column. Clicking on a row header will add a row immediately below the row that has been clicked. If a user clicks on the header of row '4', a new, empty row is added immediately below row '4' (in position '5'), and the spreadsheet height increases by 1. When a new row is added, any cells with cell references or range expressions are accordingly updated to account for the change in cells. (ie. A Cell’s raw value is SUM(C3..C5). A user adds a row at index 0. The Cell’s raw value now reads SUM(C4..C6)).

**Removing a Row**

A user can remove a row from the spreadsheet by right-clicking on a cell in the left-hand-side numerical header column. Right-clicking on a row header will remove the row that the clicked cell is in. If a user right-clicks on the header of row '4', all cells in row '4' are removed from the spreadsheet, and the spreadsheet height decreases by 1. When a row is removed, any cells with cell references or range expressions are accordingly updated to account for the change in cells. (ie. A Cell’s raw value is SUM(C3..C5). A user removes a row at index 0. The Cell’s raw value now reads SUM(C2..C4)).

**Adding a Column**

A user can add a column to the spreadsheet by clicking on a cell in the alphabetical header row at the top of the spreadsheet. Clicking on a column header will add a column immediately to the right of the row that has been clicked. If a user clicks on the header of column '4', a new, empty column will be added immediately to the right of row '4' (in position '5'), and the spreadsheet width increases by 1. When a column is added, any cells with cell references or range expressions are accordingly updated to account for the change in cells. (ie. A Cell’s raw value is SUM(C3..E3). A user adds a column at index 0. The Cell’s raw value now reads SUM(D3..F3)).

**Removing a Column**

A user can remove a column from the spreadsheet by right-clicking on a cell in the alphabetical header row at the top of the spreadsheet. Right-clicking on a column header will remove the column that the clicked cell is in. If a user right-clicks on the header of column '4', all cells in column '4' are removed from the spreadsheet, and the spreadsheet width decreases by 1. When a column is removed, any cells with cell references or range expressions are accordingly updated to account for the change in cells. (ie. A Cell’s raw value is SUM(C3..E3). A user removes a column at index 0. The Cell’s raw value now reads SUM(B3..D3)).

### Additional Functionality

**Stock Ticker Price Reference**

```jsx
// User types the following into a cell:
$(AAPL);
// Evaluates to ~161.84
```

In order to allow the user to dynamically interact with events in their environment, a user can query the price of a given stock ticker from the most recent trading day's market close. A user can do so by entering the '$' symbol, followed by an open parenthesis, a valid stock ticker, and a closing parenthesis into a cell. The application is currently limited to 5 stock ticker queries within a minute. _IMPORTANT NOTE: Any additional query past 5 within a minute will result in an 'Error!' cell evaluation._

**Saving The Spreadsheet as a CSV**

In order to allow the user to save the work they create in this spreadsheet, a user can save the spreadsheet as a CSV file to their local computer by pressing and holding the 'control' key on their keyboard while pressing the 'S' letter key. A CSV file representation of the spreadsheet is immediately downloaded to the local computer from the browser.

**Highlighting/Un-highlighting a Cell**

In order to supply a user with additional functionality regarding the display of the information within the spreadsheet, a user may highlight and un-highlight given cells. A user can highlight a cell by holding the 'control' or 'shift' key and clicking on a non-highlighted cell. A user can un-highlight a cell by holding the 'control' or 'shift' key and clicking on on a highlighted cell.

### Tech Stack

- ReactJS
- Typescript
