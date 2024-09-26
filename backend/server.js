const express = require('express');
const { ethers } = require('ethers');
require('dotenv').config();

// CypheriumとXDCのプロバイダーを設定
const cypheriumProvider = new ethers.providers.JsonRpcProvider(process.env.CYPHERIUM_RPC_URL);
const xdcProvider = new ethers.providers.JsonRpcProvider(process.env.XDC_RPC_URL);

// スマートコントラクトのアドレスとABI
const cypheriumBridgeAddress = process.env.CYPHERIUM_BRIDGE_CONTRACT;
const wrappedCPHAddress = process.env.XDC_WRAPPED_CPH_CONTRACT;

// ABIファイルの読み込み（ABIが保存されているフォルダからのパスを指定）
const cypheriumBridgeABI = require('./build/CypheriumBridge.json').abi;
const wrappedCPHABI = require('./build/WrappedCPH.json').abi;

// スマートコントラクトインスタンスを作成
const cypheriumBridgeContract = new ethers.Contract(cypheriumBridgeAddress, cypheriumBridgeABI, cypheriumProvider);
const wrappedCPHContract = new ethers.Contract(wrappedCPHAddress, wrappedCPHABI, xdcProvider);

const app = express();
const port = process.env.PORT || 3000;

// イベントリスニング: CypheriumでのFundsLockedイベント
cypheriumBridgeContract.on("FundsLocked", async (sender, recipient, amount) => {
  console.log(`CPH Locked by ${sender}, amount: ${amount.toString()} wei`);

  // XDCネットワークでwCPHをミント
  try {
    const signer = new ethers.Wallet(process.env.XDC_PRIVATE_KEY, xdcProvider);
    const wrappedCPHWithSigner = wrappedCPHContract.connect(signer);

    const tx = await wrappedCPHWithSigner.mint(amount);
    await tx.wait();

    console.log(`wCPH minted for ${recipient} on XDC network, amount: ${amount.toString()} wei`);
  } catch (error) {
    console.error("Error minting wCPH:", error);
  }
});

// イベントリスニング: XDCでのFundsBurnedイベント
wrappedCPHContract.on("FundsBurned", async (from, amount) => {
  console.log(`wCPH Burned by ${from}, amount: ${amount.toString()} wei`);

  // CypheriumネットワークでCPHをアンロック
  try {
    const signer = new ethers.Wallet(process.env.CYPHERIUM_PRIVATE_KEY, cypheriumProvider);
    const cypheriumBridgeWithSigner = cypheriumBridgeContract.connect(signer);

    const tx = await cypheriumBridgeWithSigner.unlockFunds(from, amount);
    await tx.wait();

    console.log(`CPH unlocked for ${from} on Cypherium network, amount: ${amount.toString()} wei`);
  } catch (error) {
    console.error("Error unlocking CPH:", error);
  }
});

app.get('/', (req, res) => {
  res.send('Cypherium-XDC Bridge Backend is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
