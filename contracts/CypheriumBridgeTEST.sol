// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract CypheriumBridgeTEST {
    event FundsLocked(address indexed sender, address indexed recipient, uint256 amount);
    event FundsUnlocked(address indexed recipient, uint256 amount);

    
    function lockFunds() external payable {
        require(msg.value > 0, "Amount must be greater than zero");

      
        emit FundsLocked(msg.sender, msg.sender, msg.value);
    }

   
    function unlockFunds(address recipient, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient contract balance");

        
        address(uint160(recipient)).transfer(amount);

        
        emit FundsUnlocked(recipient, amount);
    }

   
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
