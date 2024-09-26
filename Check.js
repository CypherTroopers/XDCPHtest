const { ethers } = require('ethers');
require('dotenv').config();


const cypheriumRpcUrl = 'http://218.185.241.160:8000'; // CypheriumのRPC
const xdcRpcUrl = 'https://rpc.xinfin.network'; // XDCRPC


const cypheriumContractAddress = '0x825Ec4B744f8861Cb472189814419E6c19E93e0B';
const xdcContractAddress = '0x828149d63658a5eDB8e178b2f00Ba70C79D7e40f';


const cypheriumProvider = new ethers.providers.JsonRpcProvider(cypheriumRpcUrl);


const xdcProvider = new ethers.providers.JsonRpcProvider(xdcRpcUrl);

async function checkContractDeployment(provider, contractAddress, networkName) {
    try {
       
        const code = await provider.getCode(contractAddress);

        if (code === '0x') {
            console.log(` ${networkName}  ${contractAddress} nodeploy。`);
        } else {
            console.log(` ${networkName}  ${contractAddress} deploy done`);
        }
    } catch (error) {
        console.error(`: ${error.message}`);
    }
}

async function main() {
   
    await checkContractDeployment(cypheriumProvider, cypheriumContractAddress, 'Cypherium');

  
    await checkContractDeployment(xdcProvider, xdcContractAddress, 'XDC');
}

main().catch(console.error);
