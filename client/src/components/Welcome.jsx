import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import web3 from 'web3';

const Welcome = (props) => {
    return (
        <Container fluid className="full-height">
            <Row className="align-items-center full-height">
                <Col>
                    <h1 className="display-1">Welcome to the ethCasino POC</h1>
                    <h1 className="display-3">To start playing, please join one game from the list, or create a new game yourself.</h1>
                    <h1 className="display-3">The total funds collected by the casino are {web3.utils.fromWei(props.casinoBalance)} ETH</h1>
                </Col>
            </Row>
        </Container>
    );
}

export default Welcome;