
// Simulates async blockchain operations with realistic delays

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateTxHash = () => {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

export const generateSignature = () => {
  return "0x" + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

export const mockApprove = async () => {
  await wait(1500);
  return true;
};

export const mockBurn = async () => {
  await wait(3000);
  return generateTxHash();
};

export const mockAttestation = async () => {
  // Simulating Circle's attestation service which usually takes time
  await wait(4000);
  return generateSignature();
};

// Added fetchAttestation to match the signature expected by walletService and App
export const fetchAttestation = async (message: string, isTestnet: boolean) => {
  await wait(3000);
  return generateSignature();
};

// Added mock implementation of fetchTokenMetadata for custom token additions
export const fetchTokenMetadata = async (address: string) => {
  await wait(1000);
  return {
    symbol: 'TKN',
    name: 'Mock Token',
    decimals: 18,
    address: { mainnet: address }
  };
};

// Added mock implementation of hashMessage
export const hashMessage = (message: string) => {
  return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

export const mockMint = async () => {
  await wait(2500);
  return generateTxHash();
};
