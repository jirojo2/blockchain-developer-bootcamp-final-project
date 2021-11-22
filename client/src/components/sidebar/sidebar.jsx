import React from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';

const Sidebar = (props) => {
    return (
        <Col className="flex-shrink-0 p-3 text-white bg-dark" xs={2}>
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">ethCasino</span>
            </a>
            <hr />

            <Nav
                activeKey="/home"
                onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
                variant="pills"
                className="flex-column"
            >
                <Nav.Item>
                    <Nav.Link href="/home">Active games</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-1">Link</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="link-2">Link</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="disabled" disabled>
                    Disabled
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </Col>
    );
}

export default Sidebar;