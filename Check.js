const { ethers } = require('ethers');
require('dotenv').config();

// RPC URLsを設定
const cypheriumRpcUrl = 'http://218.185.241.160:8000'; // CypheriumのRPC
const xdcRpcUrl = 'https://rpc.xinfin.network'; // XDCのRPC

// デプロイされたコントラクトアドレス
const cypheriumContractAddress = '0x825Ec4B744f8861Cb472189814419E6c19E93e0B';
const xdcContractAddress = '0x828149d63658a5eDB8e178b2f00Ba70C79D7e40f';

// Cypheriumネットワークのプロバイダー
const cypheriumProvider = new ethers.providers.JsonRpcProvider(cypheriumRpcUrl);

// XDCネットワークのプロバイダー
const xdcProvider = new ethers.providers.JsonRpcProvider(xdcRpcUrl);

async function checkContractDeployment(provider, contractAddress, networkName) {
    try {
        // コントラクトのバイトコードを取得
        const code = await provider.getCode(contractAddress);

        if (code === '0x') {
            console.log(`スマートコントラクトは ${networkName} ネットワークのアドレス ${contractAddress} にデプロイされていません。`);
        } else {
            console.log(`スマートコントラクトは ${networkName} ネットワークのアドレス ${contractAddress} に正常にデプロイされています。`);
        }
    } catch (error) {
        console.error(`エラーが発生しました: ${error.message}`);
    }
}

async function main() {
    // Cypheriumネットワークで確認
    await checkContractDeployment(cypheriumProvider, cypheriumContractAddress, 'Cypherium');

    // XDCネットワークで確認
    await checkContractDeployment(xdcProvider, xdcContractAddress, 'XDC');
}

main().catch(console.error);
