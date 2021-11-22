import React, { Component } from "react";
import TicTacToeContract from "../../contracts/TicTacToe.json";
import Button from 'react-bootstrap/Button';

export class GameRow extends Component {
    state = { id: null, type: null, contract: null, registrator: null, isX: null, isActive: null }

    componentDidMount = async () => {
        const web3 = this.props.web3;
        const address = this.props.address;

        const contract = new web3.eth.Contract(TicTacToeContract.abi, address);

        this.setState({
            id: this.props.id,
            contract: contract,
            type: await contract.methods.name().call(),
            registrator: (await contract.methods.registrator().call()).toLowerCase(),
            isActive: await contract.methods.isActive().call(),
            playerX: (await contract.methods.playerX().call()).toLowerCase(),
            playerO: (await contract.methods.playerO().call()).toLowerCase(),
        });
    }

    async joinAsX() {
        const tx = await this.state.contract.methods.registerX(this.props.player).send({ from: this.props.player, value: "10000000000000000000" });
        await tx.wait(1);
        // TODO: notify the registrator somehow, so he can also join the game?
        // TODO: transition to the game view with the game address
    }

    async joinAsO() {
        await this.state.contract.methods.registerO(this.props.player).send({ from: this.props.player, value: "10000000000000000000" });
        // TODO: notify the registrator somehow, so he can also join the game?
        // TODO: transition to the game view with the game address
    }

    openGame() {
        this.props.onOpenGame(this.props.address);
    }

    render() {

        let registerButton = null;
        if (this.state.playerX === this.props.player || this.state.playerO === this.props.player) {
            registerButton = <Button onClick={this.openGame.bind(this)}>Open game</Button>
        } else if (this.state.playerX === "0x0000000000000000000000000000000000000000") {
            registerButton = <Button onClick={this.joinAsX.bind(this)}>Join as X</Button>
        } else if (this.state.playerO === "0x0000000000000000000000000000000000000000") {
            registerButton = <Button onClick={this.joinAsO.bind(this)}>Join as O</Button>
        }

        return (
            <tr>
                <td>{this.state.id}</td>
                <td>{this.state.type}</td>
                <td>{this.props.address}</td>
                <td>{this.state.registrator}</td>
                <td>{registerButton}</td>
            </tr>
        );
    }
}