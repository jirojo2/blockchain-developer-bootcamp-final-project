# ethCasino POC

`ethCasino` is a hub that allows users to launch `Game`s from the casino offering.

For this POC I have implemented a `TicTacToe` 2-player game (that doesnt rely on randomness).

The idea is that players can bet some ether, which is frozen during the game, and gets released to the winner, or splitted in case of a draw.
Each game is a new smart contract deployed by the `Casino` smart contract the UI connects to.

The `Casino` contract keeps track of the active games and redirects the users to the actual game's smart contract address.

It is also funny to see the drastic effect of the gas fees on bets under 10 ether, but it is annecdotical for this POC.


## Public ethereum account

0x7659610a697EF7901D9Cbdb95e67835FA5546E60


## Screen cast

https://youtu.be/rqnjJKxbbHY

## Frontend

http://jirojo2.github.io/blockchain-developer-bootcamp-final-project

## TODO

* Claim funds for idle games
* Prevent players from never ending the game or abusing the timeout against other players
* Proxy contract for `Casino` to allow updates

## Folder structure

```
client/ react frontend
contracts/ solidity smart contracts code
migrations/ truffle migrations
test/ truffle tests
```

## How to run locally

1. Ganache UI on port 7575
2. `npm install` && `truffle migrate --reset --network development`
3. `cd client` && `npm install` && `npm start`
4. Open one browser with Metamask on http://localhost:3000 (Account 1)
5. Open another browser with Metamask on http://localhost:3000 (Account 2)

