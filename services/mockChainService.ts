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

export const mockMint = async () => {
  await wait(2500);
  return generateTxHash();
};
