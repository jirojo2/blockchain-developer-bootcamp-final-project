// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Game.sol';
import './TicTacToe.sol';

contract Casino {
    constructor() {

    }

    address[] public games;

    enum SupportedGame { TicTacToe }

    function gamesCount() public view returns (uint) {
        return games.length;
    }

    function openGamesList() public view returns (address[] memory) {
        uint resultCount = 0;
        for (uint i = 0; i < games.length; i++) {
            if (Game(games[i]).isOpen()) {
                resultCount++;
            }
        }

        address[] memory results = new address[](resultCount);
        uint j = 0;
        for (uint i = 0; i < games.length; i++) {
            if (Game(games[i]).isOpen()) {
                results[j] = games[i];
                j++;
            }
        }
        return results;
    }

    function newTicTacToeGame(address registrator, bool isX) external returns(uint) {
        TicTacToe g = new TicTacToe(registrator, isX);
        games.push(address(g));
        uint id = games.length -1;
        return id;
    }
}