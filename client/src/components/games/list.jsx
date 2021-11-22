import React, { Component } from "react";
import { GameRow } from "./game";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

class GameList extends Component {
    state = {}

    componentDidMount = async () => {
    }

    async createGame(isX) {
        // call the casino contract to deploy a new game contract with our account as registrator
        const tx = this.props.casino.createGameTicTacToe(
            this.props.player, isX
        );
        
        tx.on('transactionHash', (hash) => {

        }).on('receipt', (receipt) => {
            this.setState({ receipt, creatingGame: null })

        }).on('confirmation', (confirmation, receipt, latestBlockHash) => {
            if (confirmation > 1)
                return;
            this.setState({ creatingGame: null })
        }).on('error', (error, receipt) => {
            this.setState({ creatingGame: null, error, receipt });
        })

        // the new game will be detected on an event
        this.setState({ creatingGame: { tx, isX } })
    }

    async createGameAsX() {
        await this.createGame(true);
    }
    
    async createGameAsO() {
        await this.createGame(false);
    }

    render() {
        let items = this.props.games.map((game, i) => {
            return <GameRow web3={this.props.web3} address={game} player={this.props.player} key={i} onOpenGame={this.props.onOpenGame}></GameRow>
        });
        return (
            <div>
                <h1>Active games</h1>
                {this.props.games.length > 0 &&
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Game type</th>
                                <th>Game address</th>
                                <th>Registered by</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.games.map((game, i) => <GameRow web3={this.props.web3} address={game} player={this.props.player} key={i} onOpenGame={this.props.onOpenGame} />)}
                        </tbody>
                    </Table>
                }
                {this.props.games.length > 0 ||
                    <p>There are no active games</p>
                }

                <div>
                    <Button onClick={this.createGameAsX.bind(this)}>Create Game (X)</Button>{' '}
                    <Button onClick={this.createGameAsO.bind(this)}>Create Game (O)</Button>{' '}
                    {!!this.state.creatingGame &&
                        <Button disabled>
                            <Spinner animation="grow" size="sm" />{' '}
                            Creating game...
                        </Button>
                    }
                </div>
            </div>
        );
    }
}

export default GameList