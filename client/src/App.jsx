import React, { Component } from "react";
import CasinoContract from "./contracts/Casino.json";
import TicTacToeContract from "./contracts/TicTacToe.json";
import getWeb3 from "./getWeb3";
import GameList from './components/games/list'
import Game from './components/tic-tac-toe/game'
import Casino from './models/casino';

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, eth: null, games: [], view: null, casinoAddress: '0xC25FFDBef989c261335c71b689fefaD1BcfaDf64', casino: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = TicTacToeContract.networks[networkId];
      const instance = new web3.eth.Contract(
        TicTacToeContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Casino
      const casino = new Casino(web3, this.state.casinoAddress);
      const games = await casino.getOpenGames()

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, games, casino }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    //await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    //const response = await contract.methods.get().call();

    // Update state with the result.
    //this.setState({ storageValue: response });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        { !this.state.view && 
          <GameList games={this.state.games} web3={this.state.web3} casino={this.state.casino} player={this.state.accounts[0]} />
        }
        { this.state.view === "game" &&
          <Game
            web3={this.state.web3}
            contract={this.state.contract}
            player={this.state.accounts[0]}
            />
        }
      </div>
    );
  }
}

export default App;
