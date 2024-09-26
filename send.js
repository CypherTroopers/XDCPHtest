const { ethers } = require('ethers');

// Cypherium RPC URL
const RPC_URL = 'http://218.185.241.160:8000';

// 送信者のウォレット秘密鍵
const privateKey = '0x7d3ab03773538ce58558163b8be508e5d9b4ed846af0deeee904f4dc8929db4a';  // あなたの秘密鍵をここに入力してください

// 送信先アドレス
const recipientAddress = '0x1E363768199697A07Af5B89028554D29c2BDfF84';

// 送信する金額 (Ether単位で指定)
const amountInEther = '1.0'; // 1 CPHを送信する例

// プロバイダーを設定（Cypherium RPC）
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// ウォレットをプロバイダーに接続
const wallet = new ethers.Wallet(privateKey, provider);

// トランザクションを作成して送信
async function sendCPH() {
    try {
        // ウォレットのアドレスを取得
        const senderAddress = await wallet.getAddress();

        // トランザクションの内容を作成
        const tx = {
            to: recipientAddress,           // 送信先アドレス
            value: ethers.utils.parseEther(amountInEther),  // 送信するCPHの量をEther単位に変換
            gasPrice: ethers.utils.parseUnits('10', 'gwei'),  // ガス価格（必要に応じて調整）
            gasLimit: 300000                  // シンプルな送信に必要なガス制限
        };

        console.log("Transaction details:");
        console.log(`- Sender: ${senderAddress}`);
        console.log(`- Recipient: ${recipientAddress}`);
        console.log(`- Amount: ${amountInEther} CPH`);
        console.log(`- Gas price: ${tx.gasPrice.toString()} wei`);
        console.log(`- Gas limit: ${tx.gasLimit}`);

        // トランザクションを送信
        const transactionResponse = await wallet.sendTransaction(tx);
        console.log('Transaction sent, waiting for confirmation...');
        console.log('Transaction hash:', transactionResponse.hash);

        // トランザクションがマイニングされるのを待つ
        const receipt = await transactionResponse.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);

        console.log("Transaction receipt:");
        console.log(`- Transaction hash: ${receipt.transactionHash}`);
        console.log(`- Block number: ${receipt.blockNumber}`);
        console.log(`- Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`- Cumulative gas used: ${receipt.cumulativeGasUsed.toString()}`);
        console.log(`- Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
}

// CPH送金を実行
sendCPH();
