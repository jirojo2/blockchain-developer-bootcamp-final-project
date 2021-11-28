// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice An common interface for all game types suppoted by the casino
interface Game {
    function name() external pure returns (string memory);
    function isOpen() external view returns (bool);
    function isActive() external view returns (bool);
}