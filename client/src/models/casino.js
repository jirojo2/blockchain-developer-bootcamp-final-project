import CasinoContract from "../contracts/Casino.json";

class Casino {
    constructor(web3, address) {
        this.web3 = web3
        this.contract = new web3.eth.Contract(CasinoContract.abi, address);
    }

    async getOpenGames() {
        const games = await this.contract.methods.openGamesList().call();
        return games;
    }

    async getActiveGames() {
        const games = await this.contract.methods.activeGamesList().call();
        return games;
    }

    async createGameTicTacToe(player, isX) {
        const tx = await this.contract.methods.newTicTacToeGame(player, isX).send({ from: player, value: "10000000000000000000" });
        return tx;
    }

}

export default Casino;