import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import web3 from 'web3';

const CreateGame = (props) => {
    const [bet, setBet] = useState(10.0);
    const [error, setError] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [creatingGame, setCreatingGame] = useState(null);

    const createGame = (isX, e) => {
        const betWei = web3.utils.toWei(bet)
        console.log(`Create game as x=${isX}, player=${props.player}, bet=${bet} betWei=${betWei}`)

        // call the casino contract to deploy a new game contract with our account as registrator
        const tx = props.casino.createGameTicTacToe(props.player.address, isX, betWei);

        props.casino.contract.events.NewTicTacToeGame(async (err, evt) => {
            const id = evt.returnValues.id;
            const address = await props.casino.contract.methods.games(id).call();
            console.log('New TicTacToeGame')
            console.log(evt)
            props.onOpenGame(address);
        })
        
        /* this UX is not good, lets just report the error for noe
        tx.on('transactionHash', (hash) => {

        }).on('receipt', (receipt) => {
            setReceipt(receipt);
            setCreatingGame(null);
        }).on('confirmation', (confirmation, receipt, latestBlockHash) => {
            setReceipt(receipt);
            setCreatingGame(null);
        }).on('error', (error, receipt) => {
            setError(error);
            setReceipt(receipt);
            setCreatingGame(null);
        });
        */

        tx.on('error', (error, receipt) => {
            setError(error);
        });

        // the new game will be detected on an event
        setCreatingGame({ tx, isX });
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h1 className="display-1">Create new Tic Tac Toe game</h1>
                    <p className="display-6">
                        Creating a new game deploys a new smart contract with the game rules, and automatically places a bet.
                        The game will be listed in the casino list.
                        When the game is accepted by someone else, the bet will be matched and the game will start.
                    </p>
                    <p className="display-6">The casino takes 3% fee of the pot.</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h1 className="display-3">Select how much you want to bet</h1>
                    <input type="numeric" value={bet} onChange={(evt) => setBet(evt.target.value) } /> ETH
                </Col>
            </Row>
            { !creatingGame &&
                <>
                    <Row>
                        <Col>
                            <h1 className="display-3" style={{margingTop: '300px'}}>Select what you want to play</h1>
                        </Col>
                    </Row>
                    <Row className="align-items-center">
                        <Col className="text-center" onClick={(e) => createGame(true, e)} style={{lineHeight: '300px', backgroundColor: '#ff7b7b', cursor: 'pointer', padding: '100px 0'}}>
                            <h1 className="display-1">X</h1>
                        </Col>
                        <Col className="text-center" onClick={(e) => createGame(false, e)} style={{lineHeight: '300px', backgroundColor: '#72baff', cursor: 'pointer', padding: '100px 0'}}>
                            <h1 className="display-1">O</h1>
                        </Col>
                    </Row>
                </>
            }
            { !!creatingGame &&
                <Row>
                    <Col>
                        <h1 className="display-3">Creating game...</h1>
                        <Spinner animation="grow" size="lg" />{' '}
                    </Col>
                </Row>
            }
            { !!error &&
                <Row>
                    <Col>
                        <h1 className="display-3">Error during the last transaction</h1>
                        <Alert variant="danger">{error.message}</Alert>
                    </Col>
                </Row>
            }
        </Container>
    );
}

export default CreateGame;