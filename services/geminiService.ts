
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBridgeTransaction = async (
  amount: number,
  sourceNet: string,
  destNet: string,
  txHash: string
): Promise<string> => {
  try {
    // Using gemini-3-flash-preview for basic text analysis tasks
    const modelId = "gemini-3-flash-preview";
    const prompt = `
      You are a blockchain security auditor AI for the CCTP (Cross-Chain Transfer Protocol).
      A user is bridging ${amount} USDC from ${sourceNet} to ${destNet}.
      Transaction Hash: ${txHash}.
      
      Please provide a brief, technical, yet reassuring analysis of this transaction. 
      Mention the "Circle Attestation" process. 
      Confirm that burning on testnet to mint on mainnet is a simulated developer flow in this context, 
      but treat the security checks as real.
      Keep it under 60 words.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    // response.text is a property, not a method
    return response.text || "Transaction analysis unavailable.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI Security Analysis unavailable at this time. Proceeding with standard verification.";
  }
};
