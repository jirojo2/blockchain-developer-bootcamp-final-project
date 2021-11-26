import React, { Component } from "react";
import TicTacToeContract from "../../contracts/TicTacToe.json";
import Button from 'react-bootstrap/Button';
import web3 from 'web3';

export class GameRow extends Component {
    state = { id: null, type: null, contract: null, registrator: null, isX: null, isActive: null, ready: false }

    componentDidMount = async () => {
        const web3 = this.props.web3;
        const address = this.props.address;

        const contract = new web3.eth.Contract(TicTacToeContract.abi, address);

        this.setState({
            id: this.props.id,
            contract: contract,
            type: await contract.methods.name().call(),
            bet: await contract.methods.bet().call(),
            tip: await contract.methods.tip().call(),
            registrator: (await contract.methods.registrator().call()).toLowerCase(),
            isActive: await contract.methods.isActive().call(),
            playerX: (await contract.methods.playerX().call()).toLowerCase(),
            playerO: (await contract.methods.playerO().call()).toLowerCase(),
            ready: true
        });
    }

    async joinAsX() {
        await this.state.contract.methods.registerX(this.props.player.address).send({ from: this.props.player.address, value: this.state.bet });
        this.openGame();
    }

    async joinAsO() {
        await this.state.contract.methods.registerO(this.props.player.address).send({ from: this.props.player.address, value: this.state.bet });
        this.openGame();
    }

    openGame() {
        this.props.onOpenGame(this.props.address);
    }

    render() {

        let registerButton = null;
        if (this.state.playerX === this.props.player.address || this.state.playerO === this.props.player.address) {
            registerButton = <Button onClick={this.openGame.bind(this)}>Open game</Button>
        } else if (this.state.playerX === "0x0000000000000000000000000000000000000000") {
            registerButton = <Button onClick={this.joinAsX.bind(this)}>Join as X</Button>
        } else if (this.state.playerO === "0x0000000000000000000000000000000000000000") {
            registerButton = <Button onClick={this.joinAsO.bind(this)}>Join as O</Button>
        }

        if (this.state.ready) {
            return (
                <tr>
                    <td>{this.state.id}</td>
                    <td>{this.state.type}</td>
                    <td>{web3.utils.fromWei(this.state.bet)} ETH</td>
                    <td>{this.props.address}</td>
                    <td>{this.state.registrator}</td>
                    <td>{registerButton}</td>
                </tr>
            );
        } else {
            return (
                <tr className="placeholder-glow">
                    <td><span className="placeholder col-9"></span></td>
                    <td><span className="placeholder col-9"></span></td>
                    <td><span className="placeholder col-9"></span></td>
                    <td><span className="placeholder col-9"></span></td>
                    <td><span className="placeholder col-9"></span></td>
                    <td><Button className="placeholder"></Button></td>
                </tr>
            );
        }
    }
}