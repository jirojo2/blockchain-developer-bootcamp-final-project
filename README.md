# ethCasino POC

`ethCasino` is a hub that allows users to launch `Game`s from the casino offering.

For this POC I have implemented a `TicTacToe` 2-player game.

The idea is that players can bet some ether, which is frozen during the game, and gets released to the winner, or splitted in case of a draw.
Each game is a new smart contract deployed by the `Casino` smart contract the UI connects to.

The `Casino` contract keeps track of the active games and redirects the users to the actual game's smart contract address.

It is also funny to see the drastic effect of the gas fees on bets under 10 ether, but it is annecdotical for this POC.


## How to run locally

1. Ganache UI on port 7575
2. `truffle deploy`
3. cd client && npm install && npm start
4. Open one browser with Metamask on http://localhost:3000 (Account 1)
5. Open another browser with Metamask on http://localhost:3000 (Account 2)

