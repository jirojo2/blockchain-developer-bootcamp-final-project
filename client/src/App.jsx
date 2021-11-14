import React, { Component } from "react";
import CasinoContract from "./contracts/Casino.json";
import TicTacToeContract from "./contracts/TicTacToe.json";
import getWeb3 from "./getWeb3";
import GameList from './components/games/list'
import TicTacToeGame from './components/tic-tac-toe/game'
import Casino from './models/casino';

import "./App.css";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    player: null,
    games: [],
    view: null,
    casinoAddress: '0x1847136F06C488A3593FB041683950FCEba6c96A',
    casino: null,
    activeGame: null,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = (await web3.eth.getAccounts()).map(x => x.toLowerCase());

      // Register for updates
      window.ethereum.on('accountsChanged', (accounts) => {
        // Time to reload your interface with accounts[0]!
        this.setState({ accounts: accounts.map(x => x.toLowerCase()), player: accounts[0].toLowerCase() });
      })

      // Casino
      const casino = new Casino(web3, this.state.casinoAddress);
      const games = await casino.getActiveGames();

      // listen for events

      // new game
      casino.contract.events.NewTicTacToeGame(
        {
          filter: { registrator: this.props.player }
        },
        async (err, evt) => {
          console.log(`Created new game with id=${evt.returnValues.id}, registrator=${evt.returnValues.registrator}, isX=${evt.returnValues.isX}`);
          this.setState({ games: await casino.getActiveGames() });
        }
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, games, casino, player: accounts[0] });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  onOpenGame(address) {
    this.setState({ view: "game", activeGame: address });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        { !this.state.view && 
          <GameList games={this.state.games} web3={this.state.web3} casino={this.state.casino} player={this.state.player} onOpenGame={this.onOpenGame.bind(this)} />
        }
        { this.state.view === "game" &&
          <TicTacToeGame
            web3={this.state.web3}
            address={this.state.activeGame}
            player={this.state.player}
            />
        }
        <div>
          Active account: {this.state.player}
        </div>
      </div>
    );
  }
}

export default App;
