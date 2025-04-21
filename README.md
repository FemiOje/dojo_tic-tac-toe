## Dojo Tic-Tac-Toe
This is an implementation of the classic tic-tac-toe game, but using Dojo Engine as the backend/contract.

## Implementation
The board is implemented as a 2-dimensional (3 x 3) grid. In order to play, each player first has to join the game.
The first two players to join the game are assigned players X and O,respectively. No other player is then allowed to join.

A player cannot mark a cell on the grid if any of the following conditions is true:
1. The game has been won / is not active.
2. It is not the player's turn to mark a cell.
3. The cell being attemoted is already filled.

After every player move, the grid is updated and the game state is checked for winning conditions. There are 8 winning conditions classified into 3 categories: 
1. All 3 horizontals.
2. All 3 verticals.
3. All 2 diagonals.
The player who placed the last mark prior to the game state changing to "win" is assigned the winner of the round/ game.
