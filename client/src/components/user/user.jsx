import React from 'react'

const User = (props) => {
    <div>
        <span>{props.account.address}</span>
        <span>{props.account.balance} ETH</span>
    </div>
}

export default User