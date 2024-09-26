let provider;
let signer;
let cypheriumBridgeContract;
let wrappedCPHContract;
let wrappedCPHABI;
let lockCompleted = false;  // ロックが完了したかどうか
let burnCompleted = false;  // バーンが完了したかどうか
let lockedAmount = null;    // ロックされたCPHの量
let burnedAmount = null;    // バーンされたCPHの量

const cypheriumBridgeAddress = '0xB88B548732c2f20D62d66bc164D19a268C94Ad58';
const wrappedCPHAddress = '0x828149d63658a5eDB8e178b2f00Ba70C79D7e40f';
const feePercentage = 0.001;

// ウォレット接続関数
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    try {
      console.log('MetaMaskが検出されました。接続を試みます...');

      // ウォレットへの接続をリクエスト
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      const userAddress = await signer.getAddress();
      document.getElementById('walletStatus').innerText = `Status: Connected to ${userAddress}`;
      console.log(`ウォレットが接続されました。アドレス: ${userAddress}`);

      // ABIの取得
      const cypheriumBridgeABI = await fetch('/abi/CypheriumBridgeTEST.json').then(res => res.json());
      wrappedCPHABI = await fetch('/abi/WrappedCPH.json').then(res => res.json());

      // コントラクトのインスタンス化
      cypheriumBridgeContract = new ethers.Contract(cypheriumBridgeAddress, cypheriumBridgeABI.abi, signer);
      wrappedCPHContract = new ethers.Contract(wrappedCPHAddress, wrappedCPHABI.abi, signer);

      document.getElementById('lockStatus').innerText = "Status: Connected";

      // ミントボタンとアンロックボタンは初期状態で無効化
      document.getElementById('mintButton').disabled = true;
      document.getElementById('unlockButton').disabled = true;
    } catch (error) {
      document.getElementById('walletStatus').innerText = "Status: Connection failed";
      console.error("ウォレット接続エラー:", error);
      alert(`ウォレット接続エラー: ${error.message}`);
    }
  } else {
    alert("MetaMaskが検出されませんでした！MetaMaskをインストールしてください。");
    document.getElementById('walletStatus').innerText = "Status: MetaMask not installed";
  }
}

// CPHロック関数
async function lockCPH() {
  const amount = document.getElementById('lockAmount').value;
  const lockStatus = document.getElementById('lockStatus');

  try {
    lockStatus.innerText = 'Status: Locking CPH...';

    // Cypheriumネットワークでのロックトランザクション
    const tx = await cypheriumBridgeContract.lockFunds({
      value: ethers.utils.parseEther(amount),
      gasLimit: 5000000
    });

    const receipt = await tx.wait();
    if (receipt.status === 1) {
      lockStatus.innerText = 'Status: CPH locked successfully!';
      lockCompleted = true;
      lockedAmount = amount; // ロックしたCPHの量を保存

      // ミントボタンを有効化
      document.getElementById('mintButton').disabled = false;
    } else {
      lockStatus.innerText = 'Status: CPH lock failed.';
    }
  } catch (error) {
    console.error("Error locking CPH:", error);
    lockStatus.innerText = `Status: Error - ${error.message}`;
  }
}

// wCPHミント関数
async function mintwCPH() {
  const mintStatus = document.getElementById('mintStatus');

  // ロックが完了していない場合はミントを許可しない
  if (!lockCompleted || !lockedAmount) {
    mintStatus.innerText = 'No CPH locked or already minted. Cannot mint wCPH.';
    mintStatus.style.color = 'red';
    return;
  }

  try {
    mintStatus.innerText = 'Switching to XDC network...';
    mintStatus.style.color = 'green';

    // XDCネットワークに切り替え
    await switchToXDCNetwork();

    // ネットワーク切り替え後、プロバイダーとコントラクトを再インスタンス化
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // コントラクトを再度インスタンス化する
    wrappedCPHContract = new ethers.Contract(wrappedCPHAddress, wrappedCPHABI.abi, signer);

    mintStatus.innerText = 'Status: Minting wCPH...';

    // ロックされたCPHの量に基づいてwCPHをミント
    const tx = await wrappedCPHContract.mint(ethers.utils.parseUnits(lockedAmount, 18));
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      mintStatus.innerText = 'Status: wCPH minted successfully!';
      // ミント完了後はミントボタンを無効化し、ロックをリセット
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

// wCPHバーン関数
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
      burnedAmount = amount; // バーンした量を保存

      // アンロックボタンを有効化
      document.getElementById('unlockButton').disabled = false;
    } else {
      burnStatus.innerText = 'Status: wCPH burn failed.';
    }
  } catch (error) {
    console.error("Error burning wCPH:", error);
    burnStatus.innerText = `Status: Error - ${error.message}`;
  }
}

// CPHアンロック関数
async function unlockCPH() {
  const unlockStatus = document.getElementById('unlockStatus');

  // バーンが完了していない場合はアンロックを許可しない
  if (!burnCompleted || !burnedAmount) {
    unlockStatus.innerText = 'No wCPH burned or already unlocked. Cannot unlock CPH.';
    unlockStatus.style.color = 'red';
    return;
  }

  try {
    unlockStatus.innerText = 'Switching to Cypherium network...';

    // Cypheriumネットワークに切り替え
    await switchToCypheriumNetwork();

    // ネットワーク切り替え後にプロバイダーとコントラクトを再インスタンス化
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // Cypheriumネットワーク上でのコントラクトを再インスタンス化
    cypheriumBridgeContract = new ethers.Contract(cypheriumBridgeAddress, cypheriumBridgeContract.interface, signer);

    unlockStatus.innerText = 'Status: Unlocking CPH...';

    // バーンした量を使ってアンロック
    const tx = await cypheriumBridgeContract.unlockFunds(await signer.getAddress(), ethers.utils.parseEther(burnedAmount), {
      gasLimit: 5000000,
    });
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      unlockStatus.innerText = 'Status: CPH unlocked successfully!';
      // アンロック完了後はアンロックボタンを無効化し、バーンをリセット
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

// XDCネットワークに切り替え
async function switchToXDCNetwork() {
  const xdcChainId = '0x32'; // XDCネットワークのチェーンID
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: xdcChainId }],
    });
    console.log("Successfully switched to XDC network");
    await new Promise(resolve => setTimeout(resolve, 1000)); // 少し待機してから次の処理を実行
  } catch (switchError) {
    if (switchError.code === 4902) {
      alert('Please add the XDC Network to your MetaMask and try again.');
    } else {
      console.error("Failed to switch to XDC network:", switchError);
      throw new Error("Network switch failed");
    }
  }
}

// Cypheriumネットワークに切り替え
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
