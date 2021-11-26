import React from 'react'
import Col from 'react-bootstrap/esm/Col'

// just making the border thicker and increasing size of the fonts
const style = {
	margin: "10px",
	backgroundColor: "#e0e0e0",
	width: "250px",
	paddingTop: "100px",
	paddingBottom: "100px",
	textAlign: "center",
	cursor: "pointer"
}


/*
Box.jsx is the discrete unit structure of the Board.
It is made a button.
When its pressed it will call the function passed from porps.
It will display value that is passed from Board
*/
export const Box = (props) => <Col name={props.name} style={{...style, color: props.value? null: '#e0e0e0'}} onClick={props.onClick} className="display-1"> {props.value ? props.value: 'E'} </Col>

export default Box