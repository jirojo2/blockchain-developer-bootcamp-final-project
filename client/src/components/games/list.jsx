import React, { Component } from "react";
import { GameRow } from "./game";
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

class GameList extends Component {
    state = {}

    componentDidMount = async () => {
    }

    render() {
        return (
            <div>
                <h1 className="display-1">Active games</h1>
                {this.props.games.length > 0 &&
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Game type</th>
                                    <th>Bet</th>
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
                    <div>
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Game type</th>
                                    <th>Bet</th>
                                    <th>Game address</th>
                                    <th>Registered by</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array(10).fill().map((i, idx) => <tr className="placeholder-glow" key={idx}>
                                    <td><span className="placeholder col-2"></span></td>
                                    <td><span className="placeholder col-7"></span></td>
                                    <td><span className="placeholder col-9"></span></td>
                                    <td><span className="placeholder col-9"></span></td>
                                    <td><Button className="placeholder col-7"></Button></td>
                                </tr>)}
                            </tbody>
                        </Table>
                        <p>There are no active games</p>
                    </div>
                }
            </div>
        );
    }
}

export default GameList