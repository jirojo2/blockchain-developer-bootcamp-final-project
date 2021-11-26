import React from 'react'

const style = {
	textAlign:'center'
};

const Message = (props) => <h1 className="display-6" name={"msg"} style={style}>{props.value}</h1>	

export default Message