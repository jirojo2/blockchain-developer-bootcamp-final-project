import React, { Component } from "react";
import TicTacToeContract from "../../contracts/TicTacToe.json";

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
        await this.state.contract.methods.registerX(this.props.player).send({ from: this.props.player, value: "10000000000000000000" });
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
            registerButton = <a onClick={this.openGame.bind(this)}>Open game</a>
        } else if (this.state.playerX === "0x0000000000000000000000000000000000000000") {
            registerButton = <a onClick={this.joinAsX.bind(this)}>Join as X</a>
        } else if (this.state.playerO === "0x0000000000000000000000000000000000000000") {
            registerButton = <a onClick={this.joinAsO.bind(this)}>Join as O</a>
        }

        return (
            <li key={this.state.id}>
                {this.state.type} {this.props.address} registered by {this.state.registrator} | [{registerButton}]
            </li>
        );
    }
}