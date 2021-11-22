import React, { Component } from 'react'
import Board from './board'
import Message from './message'
import Refresh from './refresh'

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
    state = { board: Array(9).fill(""), isPlayer: "X", contract: null, playerX: null, playerO: null, moves: [] };

    msg() {
        const turn = this.state.moves.length;
        const turnForX = turn % 2 == 0;

        if (this.state.winnerX) {
            return "X won!"
        }
        if (this.state.winnerO) {
            return "O won!"
        }
        if ((turnForX && this.props.player == this.state.playerX) || (!turnForX && this.props.player == this.state.playerO)) {
            return "It's your move!";
        }
        return "Wait for the other player to move";
    }

    move(who, turn, pos, when) {
        this.setState((state, props) => {
            const moves = [...state.moves];
            const board = [...state.board];
            moves.push({ who, turn, pos, when });
            board[pos] = turn % 2 == 0? "X": "O";
            return { moves, board };
        })
    }
    
    componentDidMount = async () => {
        const contract = new this.props.web3.eth.Contract(TicTacToeContract.abi, this.props.address);
        const playerX = (await contract.methods.playerX().call()).toLowerCase();
        const playerO = (await contract.methods.playerO().call()).toLowerCase();
        const turn = Number(await contract.methods.turn().call());
        if (turn > 0) {
            Array.from(Array(turn).keys()).map(async (i) => {
                const move = await contract.methods.moves(i).call();
                this.move(move.who, move.turn, move.pos, move.when);
            });
        }

        if (isWon()) {
            const winner = turn % 2 == 0? 'X' : 'O';
            this.setState({ winner })
        }

        // TODO: get current board and move history

        // register for events
        // TODO: Start, end, new players registered, etc.
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

        this.setState({ contract, playerX, playerO });
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

        const turn = this.state.moves.length;
        const turnForX = turn % 2 == 0;
        if ((turnForX && this.props.player == this.state.playerX) || (!turnForX && this.props.player == this.state.playerO)) {
            this.state.contract.methods.move(pos).send({ from: this.props.player });
        } else {
            console.log(`Illegal movement pos=${pos} at turn=${turn}, turnForX=${turnForX}`)
        }
    }

    opponent() {
        const isPlayerX = this.props.player == this.state.playerX;
        return isPlayerX? this.state.playerO : this.state.playerX;
    }

    render() {
        return (
            <div>
                <Message value={this.msg()} />
                <Board onClick={this.handleInput.bind(this)} value={this.state.board} /> 
                <p>Player's address: <i>{fmtAddress(this.props.player)}</i></p>
                <p>Opponent's address: <i>{fmtAddress(this.opponent())}</i></p>
                <p>Contract's address: <i>{fmtAddress(this.props.address)}</i></p>
            </div>
        )
    }
}

export default TicTacToeGame