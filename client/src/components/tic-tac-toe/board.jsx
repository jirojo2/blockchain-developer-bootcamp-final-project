import React from 'react'
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/esm/Row';
import Box from './box'


// creating a sqaure box in with grid layout
const style = {
    width: "250px",
    height: "250px",
    margin: "0 auto",
    display: "grid",
    gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
};

// props has 'value' which is a array of 9 charectors that needs to de displayed in box.js
// and a 'onClick' function that needs to be called when button is clicked
// restoring array of box.jsx
const Board = (props) => (
    <Container style={{ maxWidth: "900px"}}>
        {[...Array(3)].map((_, i) => {
            return <Row key={i}>
                {[...Array(3)].map((_, j) => {
                    const pos = i*3 + j;
                    return <Box key={pos} name={pos} onClick={()=>props.onClick(pos)} value={props.value[pos]}/>
                })}
            </Row>
        })}
    </Container>
)

export default Board