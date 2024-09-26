const ethers = require('ethers');
const fs = require('fs');

// Cypheriumネットワークの設定
const provider = new ethers.providers.JsonRpcProvider('http://218.185.241.160:8000');
const privateKey = '0x7d3ab03773538ce58558163b8be508e5d9b4ed846af0deeee904f4dc8929db4a';
const signer = new ethers.Wallet(privateKey, provider);

// ABIファイルのパス
const abiPath = '/root/XDCPH/build/CypheriumBridgeTEST.json';

// ABIファイルの読み込み
let CypheriumBridgeTESTABI;
try {
  const abiFile = fs.readFileSync(abiPath, 'utf8');
  const parsedAbiFile = JSON.parse(abiFile);
  CypheriumBridgeTESTABI = parsedAbiFile.abi;
} catch (error) {
  console.error("Error reading or parsing ABI file:", error);
  process.exit(1);
}

// コントラクトアドレス
const CypheriumBridgeTESTAddress = '0xB88B548732c2f20D62d66bc164D19a268C94Ad58';

// コントラクトインスタンスの作成
const CypheriumBridgeTESTContract = new ethers.Contract(CypheriumBridgeTESTAddress, CypheriumBridgeTESTABI, signer);

// テストアンロック関数
async function unlockCPH() {
  const recipient = '0x2fC9C6Df72858EC1466442e7b9F740cbD677B665';  // 受け取りアドレス
  const amount = ethers.utils.parseEther('0.5');  // テスト用のアンロック金額

  try {
    console.log('Unlocking CPH...');

    // コントラクトの残高チェック（テスト用に追加）
    const contractBalance = await CypheriumBridgeTESTContract.getBalance();
    console.log(`Contract balance: ${ethers.utils.formatEther(contractBalance)} CPH`);

    // 残高が十分であればアンロック実行
    if (contractBalance.gte(amount)) {
      const tx = await CypheriumBridgeTESTContract.unlockFunds(recipient, amount, {
        gasLimit: 200000  // 適切なガスリミットを設定
      });

      console.log(`Transaction sent: ${tx.hash}`);

      // トランザクションが承認されるまで待機
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        console.log('CPH unlocked successfully!');
        console.log(`Transaction Hash: ${receipt.transactionHash}`);
      } else {
        console.log('CPH unlock failed.');
      }
    } else {
      console.log('Insufficient contract balance for unlock.');
    }
  } catch (error) {
    console.error('Error unlocking CPH:', error);
  }
}

// アンロックテストを実行
unlockCPH();
