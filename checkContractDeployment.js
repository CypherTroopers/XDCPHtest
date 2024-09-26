const { ethers } = require('ethers');


const RPC_URL = 'http://218.185.241.160:8000';


const provider = new ethers.providers.JsonRpcProvider(RPC_URL);


const contractAddress = '0x1E363768199697A07Af5B89028554D29c2BDfF84';


async function checkContractDeployment() {
    try {
      
        const code = await provider.getCode(contractAddress);

        
        if (code !== '0x') {
            console.log(`Contract is deployed at address: ${contractAddress}`);
        } else {
            console.log(`No contract found at address: ${contractAddress}`);
        }
    } catch (error) {
        console.error('Error checking contract deployment:', error);
    }
}


checkContractDeployment();
