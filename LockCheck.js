const ethers = require('ethers');

// Cypheriumネットワークのプロバイダ設定
const provider = new ethers.providers.JsonRpcProvider('http://218.185.241.160:8000');

// コントラクトのアドレス
const cypheriumBridgeAddress = '0xB88B548732c2f20D62d66bc164D19a268C94Ad58';

// コントラクト残高確認関数
async function checkBalance() {
    const balance = await provider.getBalance(cypheriumBridgeAddress);
    console.log(`CypheriumBridge contract balance: ${ethers.utils.formatEther(balance)} CPH`);
}

checkBalance();
