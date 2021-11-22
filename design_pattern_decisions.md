# Design pattern decisions

This document describes the different design pattern decisions considered in this project.

The minimum requirement is to consider at least two from the list provided in the course.

## Inter-Contract Execution

Our `Casino` contract will interact with `Game` type contracts, and deploy new contracts that inherit from `Game`, for now only `TicTacToe` contracts.

Also, the `TicTacToe` contract will send the `fees` to the owner `Casino`.

## Inheritance and Interfaces

As described before, our `Casino` contract will interact with `Game` type contracts, and deploy new contracts that inherit from `Game`, for now only `TicTacToe` contracts.

## Access Control Design Patterns

TBD

## Upgradable Contracts

