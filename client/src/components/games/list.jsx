import React, { Component } from "react";
import { GameRow } from "./game";

class GameList extends Component {

    componentDidMount = async () => {
    }

    async createGame(isX) {
        // call the casino contract to deploy a new game contract with our account as registrator
        const id = await this.props.casino.createGameTicTacToe(this.props.player, isX);
        // TODO: do soemthing with this?
        console.log(`Created new game with id=${id}, player=${this.props.player}, isX=${isX}`);
    }

    async createGameAsX() {
        await this.createGame(true);
    }
    
    async createGameAsO() {
        await this.createGame(false);
    }

    render() {
        let items = this.props.games.map((game, i) => {
            return <GameRow web3={this.props.web3} address={game} player={this.props.player} key={i}></GameRow>
        });
        return (
            <div>
                <ol>{items}</ol>
                <hr />
                <p>
                    [ <a onClick={this.createGameAsX.bind(this)}>Create Game (X)</a> ]
                    [ <a onClick={this.createGameAsO.bind(this)}>Create Game (O)</a> ]
                </p>
            </div>
        );
    }
}

export default GameList