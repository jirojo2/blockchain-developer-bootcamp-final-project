// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Game.sol';
import './TicTacToe.sol';

/// @title A decentralized casino with a bet-to-pay list of games to offer
/// @author jirojo2@gmail.com
/// @notice This contract is part of an educational POC. Each game deploys its own smart contract, and each player has to pay that contract the bet when joining.
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

    /// @notice Useful for navigating the list of games registered.
    /// @return the length of the games list
    function gamesCount() public view returns (uint) {
        return games.length;
    }

    /// @notice filters the games array to provide only those games which accept new players
    /// @return the filtered array
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

    /// @notice filters the games array to provide only those games which are happening (either accept new players or have not finalized yet)
    /// @return the filtered array
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

    /// @notice filters the games array to provide only those games that are ongoing (being played) at the moment.
    /// @return the filtered array
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

    /// @notice deploys a new game of type TicTacToe (see the TicTacToe contract for more details)
    /// @param registrator the address of the player that requested the game in the first place. He will be the first player
    /// @param isX whether the registrator player is X (otherwise O)
    /// @return the id of the deployed game within the games array.
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