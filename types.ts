
export enum NetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET',
  FORK = 'FORK',
  VNET = 'VNET'
}

export enum BridgeProtocol {
  CCTP = 'CCTP',
  LAYERZERO = 'LAYERZERO'
}

export enum TokenType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  NATIVE = 'NATIVE'
}

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  type: TokenType;
  address: {
    [key: string]: string; // Support dynamic network IDs
  };
  collectionImage?: string; // For NFTs
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  chainId: number;
  chainIdHex: string;
  rpcUrls: string[]; 
  explorerUrl?: string;
  currency: string;
  cctpTokenMessenger?: string;
  cctpMessageTransmitter?: string;
  cctpDomain?: number;
  lzEndpoint?: string; // LayerZero Endpoint V2
  lzChainId?: number;  // LayerZero EID
  isCustom?: boolean;
}

export enum BridgeStage {
  IDLE = 'IDLE',
  CHECKING_NETWORK = 'CHECKING_NETWORK',
  APPROVING = 'APPROVING',
  BURNING = 'BURNING',
  SENDING_LZ = 'SENDING_LZ',
  WAITING_ATTESTATION = 'WAITING_ATTESTATION',
  WAITING_LZ_DELIVERY = 'WAITING_LZ_DELIVERY',
  MINTING = 'MINTING',
  SETTLING = 'SETTLING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
