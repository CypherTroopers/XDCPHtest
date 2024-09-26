const ethers = require('ethers');
const fs = require('fs');


const provider = new ethers.providers.JsonRpcProvider('http://218.185.241.160:8000');
const privateKey = '';
const signer = new ethers.Wallet(privateKey, provider);


const abiPath = '/root/XDCPH/build/CypheriumBridgeTEST.json';


let CypheriumBridgeTESTABI;
try {
  const abiFile = fs.readFileSync(abiPath, 'utf8');
  const parsedAbiFile = JSON.parse(abiFile);
  CypheriumBridgeTESTABI = parsedAbiFile.abi;
} catch (error) {
  console.error("Error reading or parsing ABI file:", error);
  process.exit(1);
}


const CypheriumBridgeTESTAddress = '0xB88B548732c2f20D62d66bc164D19a268C94Ad58';


const CypheriumBridgeTESTContract = new ethers.Contract(CypheriumBridgeTESTAddress, CypheriumBridgeTESTABI, signer);


async function unlockCPH() {
  const recipient = '0x5';  // 受け取りアドレス
  const amount = ethers.utils.parseEther('0.5');  // テスト用のアンロック金額

  try {
    console.log('Unlocking CPH...');


    const contractBalance = await CypheriumBridgeTESTContract.getBalance();
    console.log(`Contract balance: ${ethers.utils.formatEther(contractBalance)} CPH`);

  
    if (contractBalance.gte(amount)) {
      const tx = await CypheriumBridgeTESTContract.unlockFunds(recipient, amount, {
        gasLimit: 200000  // 適切なガスリミットを設定
      });

      console.log(`Transaction sent: ${tx.hash}`);

 
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


unlockCPH();
