import React from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import web3 from 'web3';

const Sidebar = (props) => {
    return (
        <Col className="flex-shrink-0 p-3 text-white bg-dark" xs={3}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">ethCasino</span>
            </a>
            <hr />

            <Nav
                activeKey={props.view}
                onSelect={(selectedKey) => props.onViewChange(selectedKey)}
                variant="pills"
                className="flex-column"
            >
                <Nav.Item>
                    <Nav.Link eventKey="welcome">Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="list-games">Active games</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="create-game">Create Game</Nav.Link>
                </Nav.Item>
            </Nav>

            <hr/>
            <p>Active account: {props.player.address}</p>
            <p>Balance: {web3.utils.fromWei(props.player.balance)} ETH</p>
            <hr/>
            <p>Casino address: {props.casinoAddress}</p>
            <p>Balance: {web3.utils.fromWei(props.casinoBalance)} ETH</p>
        </Col>
    );
}

export default Sidebar;