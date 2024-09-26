const { ethers } = require('ethers');


const RPC_URL = 'http://218.185.241.160:8000';


const address = '0x1E363768199697A07Af5B89028554D29c2BDfF84';


async function getNativeBalance() {
  
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    try {
      
        const balance = await provider.getBalance(address);
        console.log(`Native CPH balance of ${address}:`, ethers.utils.formatEther(balance), 'CPH');
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

getNativeBalance();
