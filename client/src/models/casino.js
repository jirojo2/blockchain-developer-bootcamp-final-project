import CasinoContract from "../contracts/Casino.json";

class Casino {
    constructor(web3, address) {
        this.web3 = web3
        this.contract = new web3.eth.Contract(CasinoContract.abi, address);
    }

    async getOpenGames() {
        const games = await this.contract.methods.openGamesList().call();
        // TODO: get info from games
        return games;
    }

    async createGameTicTacToe(player, isX) {
        const id = await this.contract.methods.newTicTacToeGame(player, isX).send({ from: player });
        return id;
    }

}

export default Casino;