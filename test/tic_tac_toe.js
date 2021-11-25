const TicTacToe = artifacts.require("TicTacToe");
const { catchRevert } = require("./exceptionsHelpers.js");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TicTacToe", function (accounts) {
  const [contractOwner, alice, bob] = accounts;

  beforeEach(async () => {
    game = await TicTacToe.new(1, contractOwner);
  })

  it("should assert true", async function () {
    await TicTacToe.deployed();
    return assert.isTrue(true);
  });

  it("should create an empty board", async function () {
    for (let i = 0; i <9; i++) {
      assert.equal(await game.board(i), 0, "the board should be empty");
    }
    assert.equal(await game.turn(), 0, "the first turn should be zero");
  });

  it("should require a minimum bet to register", async function () {
    await catchRevert(game.registerX(alice, {from: alice, value: 0}));
    await catchRevert(game.registerX(alice, {from: alice, value: 10}));
    await catchRevert(game.registerO(bob, {from: bob, value: 0}));
    await catchRevert(game.registerO(bob, {from: bob, value: 10}));
  });

  it("should allow to register players", async function () {
    await game.registerX(alice, {from: alice, value: 1e18});
    assert.equal(await game.playerX(), alice);
    
    await game.registerO(bob, {from: bob, value: 1e18});
    assert.equal(await game.playerO(), bob);
  })

  it("should prevent players from registering more than once", async function () {
    await game.registerX(alice, {from: alice, value: 1e18});
    assert.equal(await game.playerX(), alice);
    await catchRevert(game.registerX(alice, {from: alice, value: 1e18}));
    await catchRevert(game.registerX(bob, {from: bob, value: 1e18}));
    
    await game.registerO(bob, {from: bob, value: 1e18});
    assert.equal(await game.playerO(), bob);
    await catchRevert(game.registerO(alice, {from: alice, value: 1e18}));
    await catchRevert(game.registerO(bob, {from: bob, value: 1e18}));
  });

  it("should get player X to win a standard match", async function () {
    await game.registerX(alice, {from: alice, value: 1e18});
    assert.equal(await game.playerX(), alice);
    
    await game.registerO(bob, {from: bob, value: 1e18});
    assert.equal(await game.playerO(), bob);

    assert.equal(await game.turn(), 0);
    await game.move(0, { from: alice });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 1);
    await game.move(4, { from: bob });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 2);
    await game.move(1, { from: alice });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 3);
    await game.move(5, { from: bob });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 4);
    await game.move(2, { from: alice });
    assert.equal(await game.winner(), alice);
    
    // dont allow the next move
    await catchRevert(game.move(9, { from: bob }));
  });

  it("should get player O to win a standard match", async function () {
    await game.registerX(alice, {from: alice, value: 1e18});
    assert.equal(await game.playerX(), alice);
    
    await game.registerO(bob, {from: bob, value: 1e18});
    assert.equal(await game.playerO(), bob);

    assert.equal(await game.turn(), 0);
    await game.move(0, { from: alice });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 1);
    await game.move(3, { from: bob });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 2);
    await game.move(1, { from: alice });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 3);
    await game.move(4, { from: bob });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);

    assert.equal(await game.turn(), 4);
    await game.move(7, { from: alice });
    assert.equal(await game.winner(), 0);
    assert.equal(await game.draw(), false);
    
    assert.equal(await game.turn(), 5);
    await game.move(5, { from: bob });
    assert.equal(await game.winner(), bob);

    // dont allow the next move
    await catchRevert(game.move(9, { from: alice }));
  });
});
