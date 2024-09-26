// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract CypheriumBridge {
    uint256 public feePercentage = 1; // 0.1%（1 / 1000）

    event FundsLocked(address indexed sender, address indexed recipient, uint256 amount);
    event FundsUnlocked(address indexed recipient, uint256 amount);
    event FeeTaken(address indexed sender, uint256 feeAmount);

    // CPHをロックする際に手数料を徴収し、残りをコントラクトに保持
    function lockFunds() external payable {
        require(msg.value > 0, "Amount must be greater than zero");

        // 手数料を計算 (0.1%)
        uint256 fee = (msg.value * feePercentage) / 1000;
        uint256 amountAfterFee = msg.value - fee;

        // 手数料をブリッジ運営者に送金（必要ならオーナーアドレスに手動で設定）
        (bool feeSuccess, ) = address(0xeAD2ce0F1D6D129E55A9485416cE46d67336A82E).call.value(fee)("");
        require(feeSuccess, "Fee transfer failed");

        // イベント発火
        emit FundsLocked(msg.sender, msg.sender, amountAfterFee);
        emit FeeTaken(msg.sender, fee);
    }

    // ユーザーがバーンされたwCPHに基づいてCPHをアンロックできる関数
    function unlockFunds(address recipient, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient contract balance");

        // 指定された金額をユーザーに送金
        (bool success, ) = recipient.call.value(amount)("");
        require(success, "Unlock transfer failed");

        // イベント発火
        emit FundsUnlocked(recipient, amount);
    }

    // コントラクトの残高を確認する関数
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
