const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// CypheriumとXDCのプロバイダ設定
const cypheriumProvider = new ethers.providers.JsonRpcProvider('http://218.185.241.160:8000');

if (!process.env.PRIVATE_KEY) {
  console.error('PRIVATE_KEY is not set in .env file');
  process.exit(1);
}

const cypheriumWallet = new ethers.Wallet(process.env.PRIVATE_KEY, cypheriumProvider);

// コントラクトのビルドファイルを読み込む
function getContractBuild(contractName) {
  const buildPath = path.resolve(__dirname, 'build', `${contractName}.json`);
  if (!fs.existsSync(buildPath)) {
    throw new Error(`Build file not found for contract: ${contractName}`);
  }
  const contractJson = fs.readFileSync(buildPath, 'utf8');
  return JSON.parse(contractJson);
}

// コントラクトのデプロイ
async function deployContract(wallet, contractName) {
  const contractBuild = getContractBuild(contractName);
  const factory = new ethers.ContractFactory(contractBuild.abi, contractBuild.evm.bytecode.object, wallet);

  try {
    const contract = await factory.deploy({
      gasLimit: 5000000,  // ガスリミットの調整 (必要に応じて変更)
    });
    await contract.deployTransaction.wait();  // トランザクションの確定待ち

    console.log(`${contractName} deployed at address: ${contract.address}`);
    return contract.address;
  } catch (error) {
    console.error(`Failed to deploy ${contractName}:`, error.message);  // エラーメッセージの改善
  }
}

// メイン関数
async function main() {
  try {
    // CypheriumBridgeのデプロイ
    const cypheriumBridgeTESTAddress = await deployContract(cypheriumWallet, 'CypheriumBridgeTEST');

    // アドレスを保存
    const addresses = {
      CypheriumBridgeTEST: cypheriumBridgeTESTAddress,
    };

    fs.writeFileSync(
      path.resolve(__dirname, 'build', 'addresses.json'),
      JSON.stringify(addresses, null, 2),
      'utf8'
    );

    console.log('Deployment successful, addresses saved.');
  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

main();
