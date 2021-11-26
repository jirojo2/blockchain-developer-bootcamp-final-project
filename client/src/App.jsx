import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import GameList from './components/games/list';
import TicTacToeGame from './components/tic-tac-toe/game';
import Casino from './models/casino';
import Sidebar from './components/sidebar/Sidebar';
import Welcome from './components/Welcome';
import CreateGame from './components/CreateGame';

import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    player: null,
    games: [],
    view: 'welcome',
    casinoAddress: '0x6996E2BdE0e92ea89570E4E8bf15a3226De90d56',
    casino: null,
    casinoBalance: null,
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
      const casinoBalance = await web3.eth.getBalance(this.state.casinoAddress);

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

      const player = { address: accounts[0], balance: null };
      player.balance = await web3.eth.getBalance(player.address);

      // update some key things every few seconds
      this.interval = setInterval(this.onRefresh.bind(this), 15000);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, games, casino, casinoBalance, player });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  async onRefresh() {
    // Check the casino balance
    const web3 = this.state.web3;
    const casinoBalance = await web3.eth.getBalance(this.state.casinoAddress);
    // Check our balance
    const player = this.state.player;
    player.balance = await web3.eth.getBalance(player.address);
    this.setState({ casinoBalance, player });
  }

  onOpenGame(address) {
    this.setState({ view: "game", activeGame: address });
  }

  onViewChange(view) {
    this.setState({ view })
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <Container fluid>
        <Row className="full-height">
          <Sidebar view={this.state.view} onViewChange={this.onViewChange.bind(this)} player={this.state.player} casinoAddress={this.state.casinoAddress} casinoBalance={this.state.casinoBalance} />
          <Col className="full-height">
            { this.state.view === 'welcome' &&
              <Welcome web3={this.state.web3} casinoBalance={this.state.casinoBalance} />
            }
            { this.state.view === "list-games" && 
              <GameList games={this.state.games} web3={this.state.web3} casino={this.state.casino} player={this.state.player} onOpenGame={this.onOpenGame.bind(this)} />
            }
            { this.state.view === "create-game" && 
              <CreateGame web3={this.state.web3} casino={this.state.casino} player={this.state.player} onOpenGame={this.onOpenGame.bind(this)} />
            }
            { this.state.view === "game" &&
              <TicTacToeGame
                web3={this.state.web3}
                address={this.state.activeGame}
                player={this.state.player}
                />
            }
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
