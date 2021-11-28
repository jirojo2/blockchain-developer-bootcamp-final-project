import React, { Component } from 'react'
import Board from './board'
import Message from './message'
import web3 from 'web3';
import TicTacToeContract from "../../contracts/TicTacToe.json";


const isWon = (board) => {
    // list of postion that is winning
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    // checking each of the postition seeing if the combination is there
    // if it does return the True
    // else return false
    for (let i=0; i< lines.length; i++) {
        let [a, b, c] = lines[i];
        //console.log(board[a] === board[b] && board[a] === board[c])
        if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

const fmtAddress = (address) => {
    if (!address) return "";
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

class TicTacToeGame extends Component {
    state = { board: Array(9).fill(""), isPlayer: "X", contract: null, playerX: null, playerO: null, moves: [], winner: null, bet: "0", tip: "0" };

    validPlayer(player) {
        if (!player) {
            return false;
        }
        return player !== '0x0000000000000000000000000000000000000000';
    }

    msg() {
        const turn = this.state.moves.length;
        const turnForX = turn % 2 === 0;

        if (!this.validPlayer(this.state.playerX) || !this.validPlayer(this.state.playerO)) {
            return "Wait for another player to join the game";
        }

        if (this.state.winner === "X") {
            return "X won!";
        }
        if (this.state.winner === "O") {
            return "O won!";
        }
        if ((turnForX && this.props.player.address === this.state.playerX) || (!turnForX && this.props.player.address === this.state.playerO)) {
            return "It's your move!";
        }
        return "Wait for the other player to move";
    }

    move(who, turn, pos, when) {
        this.setState((state, props) => {
            const moves = [...state.moves];
            const board = [...state.board];
            moves.push({ who, turn, pos, when });
            board[pos] = turn % 2 === 0? "X": "O";
            return { moves, board };
        })
    }
    
    componentDidMount = async () => {
        const contract = new this.props.web3.eth.Contract(TicTacToeContract.abi, this.props.address);
        const playerX = (await contract.methods.playerX().call()).toLowerCase();
        const playerO = (await contract.methods.playerO().call()).toLowerCase();
        const bet = await contract.methods.bet().call();
        const tip = await contract.methods.tip().call();
        const turn = Number(await contract.methods.turn().call());
        if (turn > 0) {
            Array.from(Array(turn).keys()).map(async (i) => {
                const move = await contract.methods.moves(i).call();
                this.move(move.who, move.turn, move.pos, move.when);
            });
        }

        // get current board and move history

        // register for events
        contract.events.Move((err, evt) => {
            this.move(
                evt.returnValues._who,
                evt.returnValues._turn,
                evt.returnValues._pos,
                evt.returnValues._when
            );
        });

        contract.events.XWin((err, evt) => {
            console.log("X Win!!!");
            console.log(evt);
            this.setState({ winner: 'X', winnerEvt: evt });
        });
        
        contract.events.OWin((err, evt) => {
            console.log("X Win!!!");
            console.log(evt);
            this.setState({ winner: 'O', winnerEvt: evt });
        });
        
        contract.events.Draw((err, evt) => {
            console.log("Draw!!!");
            console.log(evt);
        });
        
        contract.events.End((err, evt) => {
            console.log("End!!!");
            console.log(evt);
        });

        contract.events.Transfer((err, evt) => {
            console.log("Transfer!!!");
            console.log(evt);
        });

        contract.events.PlayerXJoined(async (err, evt) => {
            console.log("PlayerXJoined")
            console.log(evt)
            const playerX = (await contract.methods.playerX().call()).toLowerCase();
            this.setState({ playerX });
        })

        contract.events.PlayerOJoined(async (err, evt) => {
            console.log("PlayerOJoined")
            console.log(evt)
            const playerO = (await contract.methods.playerO().call()).toLowerCase();
            this.setState({ playerO });
        })

        this.setState({ contract, playerX, playerO, bet, tip }, () => {
            if (isWon(this.state.board)) {
                const winner = turn % 2 === 0? 'X' : 'O';
                this.setState({ winner });
            }
        });
    }
    
    fmtWei(wei, unit="ether") {
        if (!wei) {
            return this.props.web3.utils.fromWei("0", unit);
        }
        return this.props.web3.utils.fromWei(wei.toString(), unit);
    }
  
    refresh() {
    }
 
    handleInput(pos) {
        if (this.state.isPlayer === "" || this.state.board[pos] !== "") {
            //is the game is over don't play
            // if the box has been clocked already then return
            return;
        }

        if (!this.validPlayer(this.state.playerX) || !this.validPlayer(this.state.playerO)) {
            // No player has joined yet
            return;
        }

        const turn = this.state.moves.length;
        const turnForX = turn % 2 === 0;
        if ((turnForX && this.props.player.address === this.state.playerX) || (!turnForX && this.props.player.address === this.state.playerO)) {
            this.state.contract.methods.move(pos).send({ from: this.props.player.address });
        } else {
            console.log(`Illegal movement pos=${pos} at turn=${turn}, turnForX=${turnForX}`)
        }
    }

    opponent() {
        const isPlayerX = this.props.player.address === this.state.playerX;
        return isPlayerX? this.state.playerO : this.state.playerX;
    }

    render() {
        return (
            <div>
                <h1 className="display-1">Tic Tac Toe game</h1>
                <h1 className="display-6">Playing for {web3.utils.fromWei(this.state.bet)} ETH ({web3.utils.fromWei(this.state.tip)} ETH tip to the casino + 3% fees)</h1>
                <Message value={this.msg()} />
                <Board onClick={this.handleInput.bind(this)} value={this.state.board} /> 
                <p>Player's address: <i>{fmtAddress(this.props.player.address)}</i></p>
                <p>Opponent's address: <i>{fmtAddress(this.opponent())}</i></p>
                <p>Contract's address: <i>{fmtAddress(this.props.address)}</i></p>
            </div>
        )
    }
}

export default TicTacToeGame