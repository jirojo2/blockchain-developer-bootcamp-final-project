import React, { Component } from 'react'
import Board from './board'
import Message from './message'
import Refresh from './refresh'


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
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

class Game extends Component {
    startMsg = "Click to start";
    state = { board: Array(9).fill(""), isPlayer: "X", message: this.startMsg, balance: null };
    
    componentDidMount = async () => {
        console.log(this.props.web3.eth.getBalance(this.props.player));
        this.setState({ balance: await this.props.web3.eth.getBalance(this.props.player) });
    }
    
    fmtWei(wei, unit="ether") {
        if (!wei) {
            return this.props.web3.utils.fromWei("0", unit);
        }
        return this.props.web3.utils.fromWei(wei.toString(), unit);
    }
  
    refresh() {
        this.setState({ board: Array(9).fill("") });
        this.setState({ message: this.startMsg });
        this.setState({ isPlayer: "X" });
    }
 
    handleInput(pos) {
        if (this.state.isPlayer === "" || this.state.board[pos] !== "") {
            //is the game is over don't play
            // if the box has been clocked already then return
            return;
        }
       
        const boardCopy = [...this.state.board];
        boardCopy[pos] = this.state.isPlayer;
        this.setState({ board: boardCopy }); // updating board for current player  
        

        if (isWon(boardCopy)){
            // once game is over
            this.setState({ message: `WON: ${this.state.isPlayer}` })
            // since the game is over putting "" 
            this.setState({ isPlayer: "" });
            return;
        }

        if (boardCopy.indexOf("")=== -1){
            // if no more moves game is draw
            this.setState({ message: "DRAW" })
            this.setState({ isPlayer: "" });
        } else {
            let nextPlayer = (this.state.isPlayer === "X") ? "O" : "X"
            this.setState({ isPlayer: nextPlayer }); // updating player
            this.setState({ message: `TURN: ${nextPlayer}` })
        }
    }

    render() {
        return (
            <div>
                <Message value={this.state.message} />
                <Board onClick={this.handleInput.bind(this)} value={this.state.board} /> 
                <Refresh onClick={this.refresh.bind(this)} value={'Refresh'} />
                <p>Player's address: <i>{fmtAddress(this.props.player)}</i></p>
                <p>Player's balance: {this.fmtWei(this.state.balance, "ether")} ETH</p>
                <p>Opponent's address: <i>{fmtAddress(this.props.player)}</i></p>
                <p>Contract's address: <i>{fmtAddress(this.props.contract.options.address)}</i></p>
            </div>
        )
    }
}

export default Game