// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Game.sol';

/// @notice represents a TicTacToe game within the casino. 
///         TicTacTow is a traditional two player game.
///         Players pay the bet to the contract when joining, the last move triggers payments, including casino fees and tips.
contract TicTacToe is Game {

  // events - these should be self-explainatory.

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
  uint public bet = 0;
  uint public tip = 0;

  address public playerX;
  address public playerO;

  uint[9] public board;
  uint public turn;

  /// @notice this modifier restricts the contract call to active players of the game
  modifier onlyPlayers() {
    require(msg.sender == playerX || msg.sender == playerO, "Only allowed for players of this game");
    _;
  }

  /// @notice this modifier restricts the contract call to the owner (the casino that deployed this contract)
  modifier onlyOwner() {
    require(msg.sender == _owner, "Only allowed for the onwer");
    _;
  }

  /// @notice this modifier ensures the game is still active
  modifier activeGame() {
    require(!hasTimedOut(), "This game has already ended (reason: timeout)");
    require(!draw(), "This game has already ended (reason: draw)");
    require(winner() == address(0), "This game has already ended (reason: winner)");
    _;
  }

  /// @notice this modifier ensures the game has ended
  modifier onlyClosedGame() {
    require(ended > 0 || hasTimedOut(), "This game has not ended yet!");
    _;
  }

  /// @param _id the game id, supplied by the casino
  /// @param _registrator the first player's address
  constructor(uint _id, address _registrator) {
    id = _id;
    registrator = _registrator;
    emit Registered(id, registered, _registrator);
  }

  /// @return the name of the game we are playing
  function name() override external pure returns (string memory) {
    return "Tic Tac Toe";
  }

  /// @return whether the game is active or not
  function isActive() override external view returns (bool) {
    return ended == 0;
  }

  /// @return whether the game is open for new players or not
  function isOpen() override external view returns (bool) {
    return started == 0 && (playerX == address(0) || playerO == address(0));
  }

  /// @return whether the game has timed out or not (to prevent malicious players from finishing the game)
  function hasTimedOut() public view returns (bool) {
    return started > 0 && block.timestamp > started + timeout;
  }

  /// @notice Register the player as X. It includes the bet to play, which has to match the original bet or be greater than the minimum defined.
  /// @param player who is registering, either msg.sender or the registrator.
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
    emit PlayerXJoined(id, player, block.timestamp);
  }

  /// @notice Register the player as O. It includes the bet to play, which has to match the original bet or be greater than the minimum defined.
  /// @param player who is registering, either msg.sender or the registrator.
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
    emit PlayerOJoined(id, player, block.timestamp);
  }

  /// @notice checks whether board position `_pos` is empty
  /// @param _pos position (0-8) in the board to check. First row is (0,1,2), second row is (3,4,5) and third row is (6, 7, 8)
  function isEmpty(uint _pos) internal view returns (bool) {
    return board[_pos] == 0;
  }

  /// @notice marks a position with a player stamp (1 for X, 2 for O). This is a private function.
  /// @param _pos position (0-8) within the board
  /// @param _who player address
  function mark(uint _pos, address _who) private {
    if (_who == playerX) {
      board[_pos] = 1;
    } else {
      board[_pos] = 2;
    }
  }

  /// @notice closes the game with a given winner. Triggers the pot payment and the casino fees.
  /// @param _winner address of the winner player
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

  /// @notice makes a move, checking the turn is correct and the caller is the correct player. If the move closes the gamer, closeGame() internal function will be called.
  /// @param _pos position (0-8) in the board to make the move.
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

  /// @notice calculates the fee for the casino (3%)
  /// @return the 3% fee for the casino
  function calculateCasinoFee() public view returns (uint) {
    uint pot = bet * 2;
    return pot * 3/100;
  }

  /// @notice calculates the earnings for the winner, counting the fees and removing the tip, if any.
  /// @return earnings of the winner
  function calculateEarnings() public view returns (uint) {
    uint pot = bet * 2;
    uint fee = calculateCasinoFee();
    return pot - fee;
  }

  /// @notice checks for a winner, if any. This is the tic tac toe logic of the game.
  /// @return address of the winner, if any. Otherwise address(0).
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

  /// @notice checks if there is a draw.
  /// @return wether there is a draw or not.
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

  /// @notice allows the casino to claim the outstanding balance of the contract once the game is closed (the winner must have received their earinings already)
  /// @dev this is experimental, read the TODOs within. To be improved, but out of scope of this POC.
  function claimFees() external onlyOwner onlyClosedGame {
    // TODO: ideas to improve this smart contract... I had no time for this POC project :D
    // TODO: make it fair - only claim cash that went unclaimed ... TODO: add a threshold? force claim by owner after a timeout?
    // What happens if it times out???
    // The winner should be whoever moved last? or draw?
    // Probably this will be the caller anyway, audited by the casino
    payable(_owner).transfer(address(this).balance);
  }
}
