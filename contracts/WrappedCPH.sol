// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract WrappedCPH is ERC20, ERC20Detailed {
    uint256 public feePercentage = 1; // 0.1%（1 / 1000）

    event FundsMinted(address indexed to, uint256 amount);
    event FundsBurned(address indexed from, uint256 amount);

    constructor() ERC20Detailed("Wrapped CPH", "wCPH", 18) public {}

    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        uint256 fee = (amount * feePercentage) / 1000;
        uint256 amountAfterFee = amount - fee;

        
        _mint(address(0x), fee);

        
        _mint(msg.sender, amountAfterFee);

        emit FundsMinted(msg.sender, amountAfterFee);
    }

    
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        
        _burn(msg.sender, amount);

      
        emit FundsBurned(msg.sender, amount);
    }
}
