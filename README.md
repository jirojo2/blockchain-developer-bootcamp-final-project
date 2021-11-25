# ethCasino POC

`ethCasino` is a hub that allows users to launch `Game`s from the casino offering.

For this POC I have implemented a `TicTacToe` 2-player game.

The idea is that players can bet some ether, which is frozen during the game, and gets released to the winner, or splitted in case of a draw.
Each game is a new smart contract deployed by the `Casino` smart contract the UI connects to.

The `Casino` contract keeps track of the active games and redirects the users to the actual game's smart contract address.

It is also funny to see the drastic effect of the gas fees on bets under 10 ether, but it is annecdotical for this POC.

## Public ethereum account

0x7659610a697EF7901D9Cbdb95e67835FA5546E60


## TODO

* Proper UI during the game
* Menu and UI enhancements
* UI: Gas and Balance info per turn
* UI: Gas and Balance overview per account
* UI: Login process with metamask?
* Claim funds for idle games
* Proxy contract for `Casino` to allow updates
* Deploy in Rinkeby and update `deployed_address.txt`


## How to run locally

1. Ganache UI on port 7575
2. `truffle deploy`
3. cd client && npm install && npm start
4. Open one browser with Metamask on http://localhost:3000 (Account 1)
5. Open another browser with Metamask on http://localhost:3000 (Account 2)

