
import { Network, Token, NetworkType, TokenType, EIP6963ProviderDetail } from "../types";

// Official CCTP and LayerZero Constants
export const CCTP_CONTRACTS: Record<string, { tokenMessenger: string, messageTransmitter: string }> = {
  sepolia: {
    tokenMessenger: '0x9f3B8679c73C2F338593C1F8Ec0809151d204bd0',
    messageTransmitter: '0x7865fAfC2db2093669d92c0F33AeEF291086BEFD'
  },
  mainnet: {
    tokenMessenger: '0xBd3fa81B58Ba92a8b13A8FE9cC680bF6d09181DB',
    messageTransmitter: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81'
  }
};

export const LZ_EIDS: Record<string, number> = {
  sepolia: 40161,
  mainnet: 30101,
  avalanche: 30106,
  base: 30184
};

export const LZ_ENDPOINTS: Record<string, string> = {
  sepolia: '0x6ED98E84EE67484916CD306E6641957B762886f6',
  mainnet: '0x1a44076050125825900e736c501f859c50fE728c'
};

export const SUPPORTED_TOKENS: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    type: TokenType.NATIVE,
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    address: { sepolia: 'native', mainnet: 'native' }
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    type: TokenType.ERC20,
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    address: {
      sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    }
  },
  {
    symbol: 'AZR',
    name: 'Azure Wraiths',
    decimals: 0,
    type: TokenType.ERC721,
    logoUrl: '',
    collectionImage: 'https://api.dicebear.com/7.x/identicon/svg?seed=Azure',
    address: {
      sepolia: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      mainnet: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    }
  }
];

export const discoverProviders = (): Promise<EIP6963ProviderDetail[]> => {
  const providers: EIP6963ProviderDetail[] = [];
  return new Promise((resolve) => {
    const handler = (event: any) => {
      if (!providers.find(p => p.info.uuid === event.detail.info.uuid)) {
        providers.push(event.detail);
      }
    };
    window.addEventListener("eip6963:announceProvider", handler);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    setTimeout(() => {
      if (window.ethereum) {
        const standardProviders = window.ethereum.providers || [window.ethereum];
        standardProviders.forEach((p: any, index: number) => {
          const name = p.isMetaMask ? "MetaMask" : p.isCoinbaseWallet ? "Coinbase Wallet" : p.isRabby ? "Rabby" : "Injected Wallet";
          const uuid = `injected-${index}`;
          if (!providers.find(pr => pr.info.name === name)) {
            providers.push({
              info: { uuid, name, icon: '', rdns: '' },
              provider: p
            });
          }
        });
      }
      window.removeEventListener("eip6963:announceProvider", handler);
      resolve(providers);
    }, 500);
  });
};

const rpcCallWithFallback = async (rpcUrls: string[], method: string, params: any[]): Promise<any> => {
  if (!rpcUrls || rpcUrls.length === 0) throw new Error("No RPC endpoints provided.");
  for (const url of rpcUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: "2.0", method, params, id: Date.now() }),
      });
      if (!response.ok) continue;
      const json = await response.json();
      if (json.error) continue;
      return json.result;
    } catch { continue; }
  }
  throw new Error(`Fallback RPC pool exhausted.`);
};

export const checkRpcReachability = async (url: string): Promise<boolean> => {
  try {
    const res = await rpcCallWithFallback([url], "eth_blockNumber", []);
    return !!res;
  } catch { return false; }
};

let activeProvider: any = null;

export const connectWallet = async (providerDetail?: EIP6963ProviderDetail): Promise<{ address: string, provider: any }> => {
  const p = providerDetail?.provider || window.ethereum;
  if (!p) throw new Error("No wallet identity detected. Please install a compatible extension.");

  try {
    const accounts = await p.request({ method: 'eth_requestAccounts' });
    if (!accounts?.[0]) throw new Error("Connection denied by user.");
    activeProvider = p;
    return { address: accounts[0], provider: p };
  } catch (err: any) {
    throw new Error(err.message || "Identity authentication failed.");
  }
};

export const getChainId = async (provider?: any): Promise<number> => {
  const p = provider || activeProvider || window.ethereum;
  if (!p) return 0;
  try {
    const chainIdHex = await p.request({ method: 'eth_chainId' });
    return parseInt(chainIdHex, 16);
  } catch { return 0; }
};

export const switchNetwork = async (network: Network, provider?: any): Promise<void> => {
  const p = provider || activeProvider || window.ethereum;
  if (!p) throw new Error("No identity hub active.");
  try {
    await p.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainIdHex }],
    });
  } catch (error: any) {
    if (error.code === 4902 || network.isCustom) {
      await p.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainIdHex,
          chainName: network.name,
          nativeCurrency: { name: network.currency, symbol: network.currency, decimals: 18 },
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: network.explorerUrl ? [network.explorerUrl] : [],
        }],
      });
    } else throw error;
  }
};

export const getTokenBalance = async (address: string, tokenAddress: string, decimals: number, type: TokenType, network?: Network): Promise<string> => {
  const urls = network?.rpcUrls || [];
  if (urls.length === 0) return "0.00";
  try {
    if (type === TokenType.NATIVE) {
      const balHex = await rpcCallWithFallback(urls, "eth_getBalance", [address, 'latest']);
      return (Number(BigInt(balHex)) / 1e18).toFixed(4);
    }
    const data = "0x70a08231" + address.replace("0x", "").toLowerCase().padStart(64, "0");
    const res = await rpcCallWithFallback(urls, "eth_call", [{ to: tokenAddress, data }, 'latest']);
    if (type === TokenType.ERC721) return parseInt(res, 16).toString();
    return (Number(BigInt(res)) / Math.pow(10, decimals)).toFixed(2);
  } catch { return "0.00"; }
};

export const approveAsset = async (from: string, spender: string, tokenAddress: string, amountOrId: string, type: TokenType, decimals: number): Promise<string> => {
  if (type === TokenType.NATIVE) return "skipped";
  const p = activeProvider || window.ethereum;
  const amountBI = type === TokenType.ERC721 ? BigInt(amountOrId) : BigInt(Math.floor(parseFloat(amountOrId) * Math.pow(10, decimals)));
  const data = "0x095ea7b3" + spender.replace("0x", "").toLowerCase().padStart(64, "0") + amountBI.toString(16).padStart(64, "0");
  return await p.request({ method: 'eth_sendTransaction', params: [{ from, to: tokenAddress, data }] });
};

export const burnToken = async (from: string, messenger: string, tokenAddress: string, amount: string, decimals: number, destDomain: number): Promise<string> => {
  const p = activeProvider || window.ethereum;
  const amountBI = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
  const data = "0x35607315" + amountBI.toString(16).padStart(64, "0") + BigInt(destDomain).toString(16).padStart(64, "0") + from.replace("0x", "").toLowerCase().padStart(64, "0") + tokenAddress.replace("0x", "").toLowerCase().padStart(64, "0");
  return await p.request({ method: 'eth_sendTransaction', params: [{ from, to: messenger, data }] });
};

export const sendLayerZero = async (from: string, endpoint: string, tokenAddress: string, amount: string, decimals: number, destEid: number, fee: string, isNative: boolean): Promise<string> => {
  const p = activeProvider || window.ethereum;
  const totalValue = isNative ? BigInt(Math.floor((parseFloat(amount) + parseFloat(fee)) * 1e18)) : BigInt(Math.floor(parseFloat(fee) * 1e18));
  return await p.request({ method: 'eth_sendTransaction', params: [{ from, to: endpoint, data: "0x772f9157", value: "0x" + totalValue.toString(16) }] });
};

export const bridgeNFT = async (from: string, endpoint: string, tokenAddress: string, tokenId: string, destEid: number): Promise<string> => {
  const p = activeProvider || window.ethereum;
  const data = "0x772f9157" + BigInt(destEid).toString(16).padStart(64, "0") + from.replace("0x", "").toLowerCase().padStart(64, "0") + BigInt(tokenId).toString(16).padStart(64, "0");
  return await p.request({ method: 'eth_sendTransaction', params: [{ from, to: endpoint, data, value: "0x16345785d8a0000" }] });
};

export const mintUSDC = async (address: string, tokenAddress: string) => {
  const p = activeProvider || window.ethereum;
  const data = "0x40c10f19" + address.replace("0x", "").toLowerCase().padStart(64, "0") + BigInt(1000 * 1e6).toString(16).padStart(64, "0");
  return await p.request({ method: 'eth_sendTransaction', params: [{ from: address, to: tokenAddress, data }] });
};

export const mintNFT = async (address: string, tokenAddress: string) => {
  const p = activeProvider || window.ethereum;
  const data = "0x40c10f19" + address.replace("0x", "").toLowerCase().padStart(64, "0") + "0".padStart(64, "0"); 
  return await p.request({ method: 'eth_sendTransaction', params: [{ from: address, to: tokenAddress, data }] });
};

export { fetchTokenMetadata, hashMessage, fetchAttestation, wait } from "./mockChainService";
