let provider;
let signer;
let cypheriumBridgeContract;
let wrappedCPHContract;
let wrappedCPHABI;
let lockCompleted = false;  
let burnCompleted = false;  
let lockedAmount = null;    
let burnedAmount = null;    

const cypheriumBridgeAddress = '0xB88B548732c2f20D62d66bc164D19a268C94Ad58';
const wrappedCPHAddress = '0x828149d63658a5eDB8e178b2f00Ba70C79D7e40f';
const feePercentage = 0.001;

// ウォレット接続関数
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    try {
      console.log('...');

     
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      const userAddress = await signer.getAddress();
      document.getElementById('walletStatus').innerText = `Status: Connected to ${userAddress}`;
      console.log(`: ${userAddress}`);

      // ABI
      const cypheriumBridgeABI = await fetch('/abi/CypheriumBridgeTEST.json').then(res => res.json());
      wrappedCPHABI = await fetch('/abi/WrappedCPH.json').then(res => res.json());

      // 
      cypheriumBridgeContract = new ethers.Contract(cypheriumBridgeAddress, cypheriumBridgeABI.abi, signer);
      wrappedCPHContract = new ethers.Contract(wrappedCPHAddress, wrappedCPHABI.abi, signer);

      document.getElementById('lockStatus').innerText = "Status: Connected";

      // 
      document.getElementById('mintButton').disabled = true;
      document.getElementById('unlockButton').disabled = true;
    } catch (error) {
      document.getElementById('walletStatus').innerText = "Status: Connection failed";
      console.error(":", error);
      alert(`ー: ${error.message}`);
    }
  } else {
    alert("no MetaMask！install MetaMask。");
    document.getElementById('walletStatus').innerText = "Status: MetaMask not installed";
  }
}

// 
async function lockCPH() {
  const amount = document.getElementById('lockAmount').value;
  const lockStatus = document.getElementById('lockStatus');

  try {
    lockStatus.innerText = 'Status: Locking CPH...';

    // 
    const tx = await cypheriumBridgeContract.lockFunds({
      value: ethers.utils.parseEther(amount),
      gasLimit: 150000
    });

    const receipt = await tx.wait();
    if (receipt.status === 1) {
      lockStatus.innerText = 'Status: CPH locked successfully!';
      lockCompleted = true;
      lockedAmount = amount; /

      
      document.getElementById('mintButton').disabled = false;
    } else {
      lockStatus.innerText = 'Status: CPH lock failed.';
    }
  } catch (error) {
    console.error("Error locking CPH:", error);
    lockStatus.innerText = `Status: Error - ${error.message}`;
  }
}


async function mintwCPH() {
  const mintStatus = document.getElementById('mintStatus');

  
  if (!lockCompleted || !lockedAmount) {
    mintStatus.innerText = 'No CPH locked or already minted. Cannot mint wCPH.';
    mintStatus.style.color = 'red';
    return;
  }

  try {
    mintStatus.innerText = 'Switching to XDC network...';
    mintStatus.style.color = 'green';

    
    await switchToXDCNetwork();

    
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    
    wrappedCPHContract = new ethers.Contract(wrappedCPHAddress, wrappedCPHABI.abi, signer);

    mintStatus.innerText = 'Status: Minting wCPH...';

    
    const tx = await wrappedCPHContract.mint(ethers.utils.parseUnits(lockedAmount, 18));
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      mintStatus.innerText = 'Status: wCPH minted successfully!';
      
      document.getElementById('mintButton').disabled = true;
      lockCompleted = false;
    } else {
      mintStatus.innerText = 'Status: Mint wCPH failed.';
      mintStatus.style.color = 'red';
    }
  } catch (error) {
    console.error("Error minting wCPH:", error);
    mintStatus.innerText = `Status: Error - ${error.message}`;
    mintStatus.style.color = 'red';
  }
}


async function burnwCPH() {
  const amount = document.getElementById('burnAmount').value;
  const burnStatus = document.getElementById('burnStatus');

  try {
    burnStatus.innerText = 'Status: Burning wCPH...';

    const tx = await wrappedCPHContract.burn(ethers.utils.parseUnits(amount, 18));
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      burnStatus.innerText = 'Status: wCPH burned successfully!';
      burnCompleted = true;
      burnedAmount = amount; 

     
      document.getElementById('unlockButton').disabled = false;
    } else {
      burnStatus.innerText = 'Status: wCPH burn failed.';
    }
  } catch (error) {
    console.error("Error burning wCPH:", error);
    burnStatus.innerText = `Status: Error - ${error.message}`;
  }
}


async function unlockCPH() {
  const unlockStatus = document.getElementById('unlockStatus');


  if (!burnCompleted || !burnedAmount) {
    unlockStatus.innerText = 'No wCPH burned or already unlocked. Cannot unlock CPH.';
    unlockStatus.style.color = 'red';
    return;
  }

  try {
    unlockStatus.innerText = 'Switching to Cypherium network...';

    
    await switchToCypheriumNetwork();

    //
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

  
    cypheriumBridgeContract = new ethers.Contract(cypheriumBridgeAddress, cypheriumBridgeContract.interface, signer);

    unlockStatus.innerText = 'Status: Unlocking CPH...';

   
    const tx = await cypheriumBridgeContract.unlockFunds(await signer.getAddress(), ethers.utils.parseEther(burnedAmount), {
      gasLimit: 150000,
    });
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      unlockStatus.innerText = 'Status: CPH unlocked successfully!';
     
      document.getElementById('unlockButton').disabled = true;
      burnCompleted = false;
    } else {
      unlockStatus.innerText = 'Status: CPH unlock failed.';
    }
  } catch (error) {
    console.error("Error unlocking CPH:", error);
    unlockStatus.innerText = `Status: Error - ${error.message}`;
  }
}


async function switchToXDCNetwork() {
  const xdcChainId = '0x32'; 
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: xdcChainId }],
    });
    console.log("Successfully switched to XDC network");
    await new Promise(resolve => setTimeout(resolve, 1000)); 
  } catch (switchError) {
    if (switchError.code === 4902) {
      alert('Please add the XDC Network to your MetaMask and try again.');
    } else {
      console.error("Failed to switch to XDC network:", switchError);
      throw new Error("Network switch failed");
    }
  }
}


async function switchToCypheriumNetwork() {
  const cypheriumChainId = '0x3f26';
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: cypheriumChainId }],
    });
    console.log("Successfully switched to Cypherium network");
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (switchError) {
    if (switchError.code === 4902) {
      alert('Please add the Cypherium Network to your MetaMask and try again.');
    } else {
      console.error("Failed to switch to Cypherium network:", switchError);
    }
  }
}

window.onload = connectWallet;
