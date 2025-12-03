import { Network } from "../types";

export const connectWallet = async (): Promise<string> => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.");
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) throw new Error("Connection rejected by user");
    throw error;
  }
};

export const getChainId = async (): Promise<number> => {
  if (!window.ethereum) return 0;
  try {
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainIdHex, 16);
  } catch (error) {
    console.error("Failed to get chain ID:", error);
    return 0;
  }
};

export const switchNetwork = async (network: Network): Promise<void> => {
  if (!window.ethereum) throw new Error("No wallet found");
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }],
    });
  } catch (error: any) {
    // Code 4902: Chain not found in wallet
    if (error.code === 4902) {
      // If Sepolia (Testnet), try to add it
      if (network.id === 'sepolia') {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainIdHex,
                chainName: network.name,
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'SEP',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.org'], // Use public RPC
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return; // Successfully added and switched
        } catch (addError: any) {
           throw new Error("Failed to add Sepolia network to wallet: " + addError.message);
        }
      }
      throw new Error(`Please manually add and switch to ${network.name} in your wallet.`);
    }
    // Code 4001: User rejected
    if (error.code === 4001) {
      throw new Error("Network switch rejected by user");
    }
    throw error;
  }
};

export const getUsdcBalance = async (address: string, contractAddress: string): Promise<string> => {
  if (!window.ethereum) return "0.00";
  
  // selector for balanceOf(address) is 0x70a08231
  // pad address to 64 chars (32 bytes)
  const paddedAddress = address.replace("0x", "").padStart(64, "0");
  const data = "0x70a08231" + paddedAddress;

  try {
    const balanceHex = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: contractAddress,
        data: data
      }, 'latest']
    });
    
    // Parse hex (USDC has 6 decimals)
    const balanceBigInt = BigInt(balanceHex);
    const balance = Number(balanceBigInt) / 1_000_000;
    return balance.toFixed(2);
  } catch (e) {
    // This is expected if we check balance on wrong chain. 
    // We suppress error to avoid console noise.
    return "0.00";
  }
};

export const sendPlaceholderTransaction = async (from: string, network: Network, label: string): Promise<string> => {
  if (!window.ethereum) throw new Error("No wallet");

  try {
    // FIX: "External transactions to internal accounts cannot include data"
    // 1. Send to 'dEaD' address (Standard Burn) instead of 0x0. This is widely accepted as a valid destination.
    // 2. Include 'from' to ensure signature matches the active account.
    // 3. STRICTLY NO 'data' field. Not even '0x'. This is crucial for some RPCs.
    
    const transactionParameters = {
      from: from,
      to: '0x000000000000000000000000000000000000dEaD', 
      value: '0x0' // 0 ETH
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters]
    });

    return txHash;
  } catch (error: any) {
    console.error("Tx Failed:", error);
    
    if (error.code === 4001) throw new Error("Transaction rejected by user");
    
    if (error.message && error.message.includes("External transactions")) {
       throw new Error("RPC Error: Your wallet or node rejected the transaction format. Please try disconnecting and reconnecting.");
    }
    
    throw new Error(error.message || "Transaction failed");
  }
};

// Simulates a sponsored transaction (Meta-Tx) where a Paymaster handles gas.
// We don't ask the user to sign a real ETH tx here, we just pretend it happened.
export const sendSponsoredTransaction = async (from: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a mocked successful hash
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};