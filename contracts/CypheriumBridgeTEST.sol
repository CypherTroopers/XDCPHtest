// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract CypheriumBridgeTEST {
    event FundsLocked(address indexed sender, address indexed recipient, uint256 amount);
    event FundsUnlocked(address indexed recipient, uint256 amount);

    // CPHをロックし、コントラクトに保持
    function lockFunds() external payable {
        require(msg.value > 0, "Amount must be greater than zero");

        // イベント発火
        emit FundsLocked(msg.sender, msg.sender, msg.value);
    }

    // ユーザーがバーンされたwCPHに基づいてCPHをアンロックできる関数
    function unlockFunds(address recipient, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient contract balance");

        // 指定された金額をユーザーに送金 (call.valueをtransferに変更)
        address(uint160(recipient)).transfer(amount);

        // イベント発火
        emit FundsUnlocked(recipient, amount);
    }

    // コントラクトの残高を確認する関数
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
