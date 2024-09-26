// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract WrappedCPH is ERC20, ERC20Detailed {
    uint256 public feePercentage = 1; // 0.1%（1 / 1000）

    event FundsMinted(address indexed to, uint256 amount);
    event FundsBurned(address indexed from, uint256 amount);

    constructor() ERC20Detailed("Wrapped CPH", "wCPH", 18) public {}

    // wCPHをミントする関数（ユーザーが自分で実行）
    function mint(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        // 手数料を計算 (0.1%)
        uint256 fee = (amount * feePercentage) / 1000;
        uint256 amountAfterFee = amount - fee;

        // 手数料分を運営者のアドレスに送る
        _mint(address(0xeAD2ce0F1D6D129E55A9485416cE46d67336A82E), fee);

        // 残りのwCPHをユーザーにミント
        _mint(msg.sender, amountAfterFee);

        emit FundsMinted(msg.sender, amountAfterFee);
    }

    // wCPHをバーンする関数（ユーザーが任意の量をバーン可能）
    function burn(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");

        // wCPHをバーン
        _burn(msg.sender, amount);

        // イベント発火
        emit FundsBurned(msg.sender, amount);
    }
}
