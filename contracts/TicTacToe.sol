// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Game.sol';

contract TicTacToe is Game {

  event Registered(uint _id, uint _when, address _who);
  event PlayerXJoined(uint _id, address _who, uint _when);
  event PlayerOJoined(uint _id, address _who, uint _when);
  event FirstMove(uint _id, uint _when);
  event Move(uint _id, address _who, uint _turn, uint _pos, uint _when);
  event End(uint _id, uint _when, uint _turn, uint _balance, uint _pot);
  event Draw(uint _id, uint _when, uint _turn);
  event XWin(uint _id, address _who, uint _when, uint _turn);
  event OWin(uint _id, address _who, uint _when, uint _turn);
  event Transfer(uint _id, address _who, uint _value);

  struct Movement {
    address who;
    uint when;
    uint turn;
    uint pos;
  }

  uint minBet = 0.001 ether;
  address _owner = msg.sender; // casino that owns the game
  address public registrator; // player that registered the game in the first place

  // timestamps
  uint public registered = block.timestamp;
  uint public timeout = 1 hours;
  uint public started;
  uint public ended;

  // record movements
  Movement[] public moves;

  uint public id;
  uint private bet = 0;
  uint private tip = 0;

  address public playerX;
  address public playerO;

  uint[9] public board;
  uint public turn;

  modifier onlyPlayers() {
    require(msg.sender == playerX || msg.sender == playerO, "Only allowed for players of this game");
    _;
  }

  modifier onlyOwner() {
    require(msg.sender == _owner, "Only allowed for the onwer");
    _;
  }

  modifier activeGame() {
    require(!hasTimedOut(), "This game has already ended (reason: timeout)");
    require(!draw(), "This game has already ended (reason: draw)");
    require(winner() == address(0), "This game has already ended (reason: winner)");
    _;
  }

  modifier onlyClosedGame() {
    require(ended > 0 || hasTimedOut(), "This game has not ended yet!");
    _;
  }

  constructor(uint _id, address _registrator) {
    id = _id;
    registrator = _registrator;
    emit Registered(id, registered, _registrator);
  }

  function name() override external pure returns (string memory) {
    return "Tic Tac Toe";
  }

  function isActive() override external view returns (bool) {
    return ended == 0;
  }

  function isOpen() override external view returns (bool) {
    return started == 0 && (playerX == address(0) || playerO == address(0));
  }

  function hasTimedOut() public view returns (bool) {
    return started > 0 && block.timestamp > started + timeout;
  }

  function registerX(address player) external payable {
    require(playerX == address(0), "Player X is already registered");
    require(msg.sender == player || registrator == player, "Only the sender or the registrator can select players");
    require(playerO != player, "Player X cannot be the same as player O");
    require(msg.value > minBet && msg.value >= bet, "A bet is required to participate");
    if (bet > 0 && msg.value > bet) {
      // thanks for the tip to the casino
      tip += msg.value - bet;
    }
    if (bet == 0) {
      bet = msg.value;
    }
    playerX = player;
  }

  function registerO(address player) external payable {
    require(playerO == address(0), "Player O is already registered");
    require(msg.sender == player || registrator == player, "Only the sender or the registrator can select players");
    require(playerX != player, "Player O cannot be the same as player X");
    require(msg.value > minBet && msg.value >= bet, "A bet is required to participate");
    if (bet > 0 && msg.value > bet) {
      // thanks for the tip to the casino
      tip += msg.value - bet;
    }
    if (bet == 0) {
      bet = msg.value;
    }
    playerO = player;
  }

  function isEmpty(uint _pos) internal view returns (bool) {
    return board[_pos] == 0;
  }

  function mark(uint _pos, address _who) private {
    if (_who == playerX) {
      board[_pos] = 1;
    } else {
      board[_pos] = 2;
    }
  }

  function closeGame(address _winner) internal {
    ended = block.timestamp;
    emit End(id, block.timestamp, turn, address(this).balance, calculateEarnings());

    if (_winner == address(0)) {
      // Draw - split in half (minus fee)
      uint halfEarnings = calculateEarnings()/2;
      payable(playerX).transfer(halfEarnings);
      emit Transfer(id, playerX, halfEarnings);
      payable(playerO).transfer(halfEarnings);
      emit Transfer(id, playerO, halfEarnings);
    } else {
      uint earnings = calculateEarnings();
      payable(_winner).transfer(earnings);
      emit Transfer(id, _winner, earnings);
    }
    uint casinoFees = address(this).balance;
    payable(_owner).transfer(casinoFees);
    emit Transfer(id, _owner, casinoFees);
  }

  function move(uint _pos) external onlyPlayers activeGame {
    // check if we are in the correct turn
    if (turn % 2 == 0) {
      require(msg.sender == playerX, "Its player X's turn!");
    } else {
      require(msg.sender == playerO, "Its player O's turn!");
    }

    // check that the position is clear
    require(isEmpty(_pos), "That position is already played!");

    // mark the position
    mark(_pos, msg.sender);

    // register the movement
    emit Move(id, msg.sender, turn, _pos, block.timestamp);
    moves.push(Movement(msg.sender, block.timestamp, turn, _pos));

    // register the first movement
    if (turn == 0) {
      started = block.timestamp;
      emit FirstMove(id, block.timestamp);
    }

    // advance turn
    turn += 1;

    // check if the game has ended
    address _winner = winner();
    
    if (draw()) {
      emit Draw(id, block.timestamp, turn);
      closeGame(_winner);
    }
    else if (_winner == playerX) {
      emit XWin(id, _winner, block.timestamp, turn);
      closeGame(_winner);
    }
    else if (_winner == playerO) {
      emit OWin(id, _winner, block.timestamp, turn);
      closeGame(_winner);
    }
  }

  function calculateCasinoFee() public view returns (uint) {
    uint pot = bet * 2;
    return pot * 3/100;
  }

  function calculateEarnings() public view returns (uint) {
    uint pot = bet * 2;
    uint fee = calculateCasinoFee();
    return pot - fee;
  }

  function winner() public view returns (address) {
    bool win = false;
    for (uint p = 1; p <= 2; p++) {
      // check rows
      for (uint i = 0; i < 3; i++) {
        win = true;
        for (uint j = 0; j < 3; j++) {
          if (board[i * 3 + j] != p) {
            win = false;
            break;
          }
        }
        if (win) {
          return p == 1? playerX : playerO;
        }
      }
      // check columns
      for (uint i = 0; i < 3; i++) {
        win = true;
        for (uint j = 0; j < 3; j++) {
          if (board[j * 3 + i] != p) {
            win = false;
            break;
          }
        }
        if (win) {
          return p == 1? playerX : playerO;
        }
      }
      // check diagonals
      win = true;
      for (uint i = 0; i < 3; i++) {
        if (board[i * 3 + i] != p) {
          win = false;
          break;
        }
      }
      if (win) {
        return p == 1? playerX : playerO;
      }
    }
    return address(0);
  }

  function draw() public view returns (bool) {
    if (winner() == address(0)) {
      return false;
    }
    for (uint i = 0; i < 9; i++) {
      if (board[i] == 0) {
        return false;
      }
    }
    return true;
  }

  function claimFees() external onlyOwner onlyClosedGame {
    // TODO: make it fair - only claim cash that went unclaimed ... TODO: add a threshold? force claim by owner after a timeout?
    // What happens if it times out???
    // The winner should be whoever moved last? or draw?
    // Probably this will be the caller anyway, audited by the casino
    payable(_owner).transfer(address(this).balance);
  }
}
