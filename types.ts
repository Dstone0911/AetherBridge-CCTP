export enum NetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET'
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  chainId: number; // Decimal chainId
  chainIdHex: string; // Hex chainId for wallet switching
  rpcUrl?: string;
  currency: string;
  usdcContract: string;
}

export enum BridgeStage {
  IDLE = 'IDLE',
  CHECKING_NETWORK = 'CHECKING_NETWORK',
  APPROVING = 'APPROVING',
  BURNING = 'BURNING',
  WAITING_ATTESTATION = 'WAITING_ATTESTATION',
  MINTING = 'MINTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TransactionRecord {
  id: string;
  timestamp: number;
  amount: number;
  sourceNetwork: string;
  destNetwork: string;
  txHashBurn?: string;
  txHashMint?: string;
  attestationSignature?: string;
  aiAnalysis?: string;
}

export interface Token {
  symbol: string;
  name: string;
  balance: number;
  iconUrl: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
