# Design pattern decisions

This document describes the different design pattern decisions considered in this project.

The minimum requirement is to consider at least two from the list provided in the course.

## Inter-Contract Execution

Our `Casino` contract will interact with `Game` type contracts, and deploy new contracts that inherit from `Game`, for now only `TicTacToe` contracts.

Also, the `TicTacToe` contract will send the `fees` to the owner `Casino`.

## Inheritance and Interfaces

As described before, our `Casino` contract will interact with `Game` type contracts, and deploy new contracts that inherit from `Game`, for now only `TicTacToe` contracts.

## Access Control Design Patterns

Each game controls the access based on an ownable pattern (the owner is the casino contract that deploys the game contract), and is conscious of who are the players and which player can do what and when.

## Upgradable Contracts

TODO: the idea would be to have a proxy contract that points to the latest casino contract.
The casino contract will deploy the games contracts, and by upgrading the casino contract, the game contracts can be upgraded, and new games can be supported.
