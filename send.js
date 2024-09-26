const { ethers } = require('ethers');

// Cypherium RPC URL
const RPC_URL = 'http://218.185.241.160:8000';


const privateKey = '0x';  

const recipientAddress = '0x1E363768199697A07Af5B89028554D29c2BDfF84';

(Ether単位で指定)
const amountInEther = '1.0'; // 

（Cypherium RPC）
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

//
const wallet = new ethers.Wallet(privateKey, provider);

/
async function sendCPH() {
    try {
      
        const senderAddress = await wallet.getAddress();

       
        const tx = {
            to: recipientAddress,           
            value: ethers.utils.parseEther(amountInEther)
            gasPrice: ethers.utils.parseUnits('10', 'gwei'),  // 
            gasLimit: 300000                 
        };

        console.log("Transaction details:");
        console.log(`- Sender: ${senderAddress}`);
        console.log(`- Recipient: ${recipientAddress}`);
        console.log(`- Amount: ${amountInEther} CPH`);
        console.log(`- Gas price: ${tx.gasPrice.toString()} wei`);
        console.log(`- Gas limit: ${tx.gasLimit}`);

      
        const transactionResponse = await wallet.sendTransaction(tx);
        console.log('Transaction sent, waiting for confirmation...');
        console.log('Transaction hash:', transactionResponse.hash);

        //
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


sendCPH();
