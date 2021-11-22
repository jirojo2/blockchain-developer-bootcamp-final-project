# Avoiding common attacks

The following measures have been considered during the implementation of this project:

* Using specific compiler pragma (in our case, `pragma solidity ^0.8.0`)
* Proper use of require, assert and revert
* Use modifiers only for validation
* Pull over push
* Checks-Effects-Interactions - preventing reentrancy
* Not using `tx.origin` as authentication, always `msg.sender`
* Integer Under/Overflow - with Solidity `^0.8.0` SafeMath is included natively.
