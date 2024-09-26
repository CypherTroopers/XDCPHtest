require('dotenv').config();  // .envファイルの読み込み
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// Cypheriumネットワークのプロバイダ設定
const provider = new ethers.providers.JsonRpcProvider('http://218.185.241.160:8000');

// ウォレット設定
if (!process.env.PRIVATE_KEY) {
    console.error('PRIVATE_KEY is not set in .env file');
    process.exit(1);
}
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABIファイルを読み込む
const abiPath = path.resolve(__dirname, 'build', 'CypheriumBridgeTEST.json');
let cypheriumBridgeABI;
try {
    const abiFile = fs.readFileSync(abiPath, 'utf8');
    cypheriumBridgeABI = JSON.parse(abiFile).abi;
} catch (error) {
    console.error("Error reading ABI file:", error);
    process.exit(1);
}

// デプロイ済みのコントラクトアドレス
const cypheriumBridgeAddress = '0xB88B548732c2f20D62d66bc164D19a268C94Ad58';  // あなたのデプロイ済みのアドレス

// コントラクトのインスタンス作成
const cypheriumBridgeContract = new ethers.Contract(cypheriumBridgeAddress, cypheriumBridgeABI, signer);

// ロック関数
async function lockCPH() {
    const amount = '1.0';  // ロックしたいCPHの金額

    try {
        console.log('Locking CPH...');

        // ロックトランザクションを送信
        const tx = await cypheriumBridgeContract.lockFunds({
            value: ethers.utils.parseEther(amount),  // CPH金額を指定
            gasLimit: 500000  // ガスリミットを調整
        });

        console.log(`Transaction sent: ${tx.hash}`);

        // トランザクションの承認を待機
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log('CPH locked successfully!');
            console.log(`Transaction Hash: ${receipt.transactionHash}`);
        } else {
            console.log('CPH lock failed.');
        }
    } catch (error) {
        console.error('Error locking CPH:', error);
    }
}

// ロック関数の呼び出し
lockCPH();
