const{  Web3 } = require('web3');

// RPCノードのURLを指定 (CypheriumノードまたはEVM互換ノードのRPCエンドポイント)
const web3 = new Web3(new Web3.providers.HttpProvider('http://218.185.241.160:8000'));

// トランザクションハッシュを指定
const transactionHash = '0x86ce04175400973c12fffd4b28e107f97e882521fd36d4498983c8d94670dd66';

async function getTransactionReceipt() {
  try {
    // トランザクションのレシートを取得
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    
    // トランザクションのレシートを出力
    if (receipt) {
      console.log('Transaction Receipt:', receipt);
    } else {
      console.log('Transaction not found or still pending.');
    }
  } catch (error) {
    console.error('Error fetching transaction receipt:', error);
  }
}

getTransactionReceipt();
