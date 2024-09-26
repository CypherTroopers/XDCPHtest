const { ethers } = require('ethers');

// Cypherium RPC URL
const RPC_URL = 'http://218.185.241.160:8000';

// プロバイダーを設定（Cypherium RPC）
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

// スマートコントラクトアドレス
const contractAddress = '0x1E363768199697A07Af5B89028554D29c2BDfF84';

// コントラクトがデプロイされているかを確認する関数
async function checkContractDeployment() {
    try {
        // 指定したアドレスからスマートコントラクトのコードを取得
        const code = await provider.getCode(contractAddress);

        // コードが存在するかチェック（'0x'はコードが存在しない場合）
        if (code !== '0x') {
            console.log(`Contract is deployed at address: ${contractAddress}`);
        } else {
            console.log(`No contract found at address: ${contractAddress}`);
        }
    } catch (error) {
        console.error('Error checking contract deployment:', error);
    }
}

// 実行
checkContractDeployment();
