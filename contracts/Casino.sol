// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Game.sol';
import './TicTacToe.sol';

contract Casino {
    constructor() {

    }

    address[] public games;

    enum SupportedGame { TicTacToe }

    event NewGame(uint id, address registrator);
    event NewTicTacToeGame(uint id, address registrator, bool isX);

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

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

    function activeGamesList() public view returns (address[] memory) {
        uint resultCount = 0;
        for (uint i = 0; i < games.length; i++) {
            if (Game(games[i]).isActive()) {
                resultCount++;
            }
        }

        address[] memory results = new address[](resultCount);
        uint j = 0;
        for (uint i = 0; i < games.length; i++) {
            if (Game(games[i]).isActive()) {
                results[j] = games[i];
                j++;
            }
        }
        return results;
    }

    function ongoingGamesList() public view returns (address[] memory) {
        uint resultCount = 0;
        for (uint i = 0; i < games.length; i++) {
            if (!Game(games[i]).isOpen() && Game(games[i]).isActive()) {
                resultCount++;
            }
        }

        address[] memory results = new address[](resultCount);
        uint j = 0;
        for (uint i = 0; i < games.length; i++) {
            if (!Game(games[i]).isOpen() && Game(games[i]).isActive()) {
                results[j] = games[i];
                j++;
            }
        }
        return results;
    }

    function newTicTacToeGame(address registrator, bool isX) payable external returns(uint) {
        uint id = games.length;
        TicTacToe g = new TicTacToe(id, registrator);
        games.push(address(g));
        if (isX) {
            g.registerX{ value: msg.value }(msg.sender);
        } else {
            g.registerO{ value: msg.value }(msg.sender);
        }
        emit NewTicTacToeGame(id, registrator, isX);
        emit NewGame(id, registrator);
        return id;
    }
}