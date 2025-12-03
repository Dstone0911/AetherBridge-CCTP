import React, { useState, useEffect, useRef } from 'react';
import { Network, NetworkType, BridgeStage, Token } from './types';
import { connectWallet, getChainId, switchNetwork, getUsdcBalance, sendPlaceholderTransaction, signGaslessTransaction } from './services/walletService';
import { analyzeBridgeTransaction } from './services/geminiService';
import NetworkBadge from './components/NetworkBadge';
import ActivityChart from './components/ActivityChart';
import { 
  ChevronDownIcon, 
  ArrowRightIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  ShieldCheckIcon
} from './components/Icons';

// --- Constants ---
// Chain IDs: Sepolia 11155111 (0xaa36a7), Mainnet 1 (0x1)
const TESTNET: Network = { 
  id: 'sepolia', 
  name: 'Sepolia Testnet', 
  type: NetworkType.TESTNET, 
  chainId: 11155111, 
  chainIdHex: '0xaa36a7',
  currency: 'ETH',
  usdcContract: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
};

const MAINNET: Network = { 
  id: 'mainnet', 
  name: 'Ethereum Mainnet', 
  type: NetworkType.MAINNET, 
  chainId: 1, 
  chainIdHex: '0x1',
  currency: 'ETH',
  usdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

// --- Helper Component: Robust Toggle ---
const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
      checked ? 'bg-emerald-500' : 'bg-slate-700'
    }`}
  >
    <span className="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// --- Main Component ---
const App: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [stage, setStage] = useState<BridgeStage>(BridgeStage.IDLE);
  const [burnTx, setBurnTx] = useState<string | null>(null);
  const [attestationSig, setAttestationSig] = useState<string | null>(null);
  const [mintTx, setMintTx] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('---');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number>(0);
  const [isSponsored, setIsSponsored] = useState<boolean>(false);

  // Initialize wallet listener
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const chainId = await getChainId();
        setCurrentChainId(chainId);

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            fetchBalance(accounts[0], chainId);
          } else {
            setWalletAddress(null);
            setBalance('---');
          }
        });

        window.ethereum.on('chainChanged', (chainIdHex: string) => {
           const id = parseInt(chainIdHex, 16);
           setCurrentChainId(id);
           
           // CRITICAL FIX: Do NOT reload page, just update state.
           // Reloading wipes the bridge transaction progress.
           window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
             if (accounts.length > 0) {
               fetchBalance(accounts[0], id);
             }
           });
        });

        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
           setWalletAddress(accounts[0]);
           fetchBalance(accounts[0], chainId);
        }
      }
    };
    init();
  }, []);

  const fetchBalance = async (addr: string, chainId: number) => {
    if (chainId === TESTNET.chainId) {
      const bal = await getUsdcBalance(addr, TESTNET.usdcContract);
      setBalance(bal);
    } else if (chainId === MAINNET.chainId) {
      const bal = await getUsdcBalance(addr, MAINNET.usdcContract);
      setBalance(bal);
    } else {
      setBalance('---');
    }
  };

  const handleConnect = async () => {
    try {
      setErrorMsg(null);
      const addr = await connectWallet();
      setWalletAddress(addr);
      const chainId = await getChainId();
      setCurrentChainId(chainId); // Explicit update
      fetchBalance(addr, chainId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSwitchToSepolia = async () => {
    try {
      await switchNetwork(TESTNET);
      // chainChanged event will trigger state update
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleBridge = async () => {
    // If not on Sepolia, try switching first
    const chainId = await getChainId();
    if (chainId !== TESTNET.chainId) {
      try {
        await switchNetwork(TESTNET);
        // Wait for state to settle
        await new Promise(r => setTimeout(r, 1000));
        // We can continue or ask user to click again. 
        // For better UX, let's ask them to click again to ensure balance loaded.
        return; 
      } catch (e: any) {
        setErrorMsg(e.message);
        return;
      }
    }

    if (!amount || isNaN(Number(amount)) || !walletAddress) return;
    setErrorMsg(null);
    setStage(BridgeStage.CHECKING_NETWORK);

    try {
      // 2. Approve (Simulated via placeholder tx or signature)
      // For this demo, we'll skip approve tx to save user gas/clicks and go straight to "Burn"
      
      // 3. Burn
      setStage(BridgeStage.BURNING);
      let burnHash;
      if (isSponsored) {
        burnHash = await signGaslessTransaction(walletAddress, `Burn ${amount} USDC on Sepolia`);
      } else {
        burnHash = await sendPlaceholderTransaction(walletAddress, TESTNET, `CCTP Burn: ${amount} USDC`);
      }
      setBurnTx(burnHash);
      
      // 4. AI Analysis
      analyzeBridgeTransaction(Number(amount), TESTNET.name, MAINNET.name, burnHash)
        .then(analysis => setAiInsight(analysis));

      // 5. Simulate Attestation Wait (Circle API)
      setStage(BridgeStage.WAITING_ATTESTATION);
      setTimeout(() => {
        setAttestationSig("0x" + Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
      }, 8000); // 8 seconds simulated delay for Circle

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Transaction failed");
      setStage(BridgeStage.FAILED);
    }
  };

  const handleMint = async () => {
    if (!walletAddress) return;
    setErrorMsg(null);
    setStage(BridgeStage.MINTING);

    try {
      // 1. Ensure on Mainnet
      const chainId = await getChainId();
      if (chainId !== MAINNET.chainId) {
        await switchNetwork(MAINNET);
        // CRITICAL: Wait for provider to update after switch
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // 2. Mint
      let mintHash;
      if (isSponsored) {
        mintHash = await signGaslessTransaction(walletAddress, `Mint ${amount} USDC on Mainnet`);
      } else {
        mintHash = await sendPlaceholderTransaction(walletAddress, MAINNET, `CCTP Mint: ${amount} USDC`);
      }
      
      setMintTx(mintHash);
      setStage(BridgeStage.COMPLETED);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Minting failed");
      // If error, stay in waiting attestation or minting state depending on failure
      setStage(BridgeStage.WAITING_ATTESTATION); 
    }
  };

  const reset = () => {
    setStage(BridgeStage.IDLE);
    setBurnTx(null);
    setAttestationSig(null);
    setMintTx(null);
    setAiInsight(null);
    setAmount('');
    setErrorMsg(null);
    // Don't reset isSponsored to allow user preference to persist across transfers
    
    // Refresh balance of current chain
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
       if (accounts.length > 0) getChainId().then(id => fetchBalance(accounts[0], id));
    });
  };

  const getButtonText = () => {
    switch (stage) {
      case BridgeStage.IDLE: return isSponsored ? 'Sign & Bridge' : 'Bridge Funds';
      case BridgeStage.CHECKING_NETWORK: return 'Switching Network...';
      case BridgeStage.APPROVING: return 'Approving Token...';
      case BridgeStage.BURNING: return isSponsored ? 'Signing Gasless Burn...' : 'Sign Burn Transaction...';
      case BridgeStage.WAITING_ATTESTATION: return 'Waiting for Attestation...';
      case BridgeStage.MINTING: return isSponsored ? 'Signing Gasless Mint...' : 'Sign Mint Transaction...';
      case BridgeStage.COMPLETED: return 'Transfer Complete';
      case BridgeStage.FAILED: return 'Retry';
      default: return 'Error';
    }
  };

  const isProcessing = stage !== BridgeStage.IDLE && stage !== BridgeStage.COMPLETED && stage !== BridgeStage.WAITING_ATTESTATION && stage !== BridgeStage.FAILED;
  const canMint = stage === BridgeStage.WAITING_ATTESTATION && attestationSig !== null;
  
  // Logic: User is on wrong network IF they are IDLE and NOT on Sepolia.
  // If they are minting, they should be on Mainnet, so we don't flag "Wrong Network" relative to Sepolia.
  const isWrongNetworkForStart = walletAddress && currentChainId !== TESTNET.chainId && stage === BridgeStage.IDLE;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center z-10 mb-12">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ArrowRightIcon className="w-5 h-5 text-white" />
           </div>
           <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
             AetherBridge <span className="text-xs font-normal text-slate-500 ml-1 border border-slate-700 px-1.5 py-0.5 rounded">LIVE</span>
           </h1>
        </div>
        
        <button 
          onClick={handleConnect}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 border ${
            walletAddress 
            ? 'bg-slate-800 border-green-500/30 text-green-400' 
            : 'bg-indigo-600 hover:bg-indigo-500 border-transparent text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Col: Bridge Interface */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
             {/* Glowing border effect on top */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500"></div>

             <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-semibold text-white">Bridge Assets</h2>
               <div className="flex gap-2">
                 <button 
                  onClick={reset}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                  title="Reset Bridge"
                 >
                    <ArrowPathIcon className="w-5 h-5" />
                 </button>
               </div>
             </div>
             
             {errorMsg && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  {errorMsg}
                </div>
             )}

             <div className="space-y-4">
                {/* Source */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-slate-400">From</span>
                     <span className="text-sm">
                       {!walletAddress ? (
                         <span className="text-slate-500">--</span>
                       ) : isWrongNetworkForStart ? (
                         <button 
                           onClick={handleSwitchToSepolia} 
                           className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium underline"
                         >
                           Switch to Sepolia
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1 1.95 2.1a.75.75 0 101.1-1.02l-2.5-2.7a.75.75 0 00-1.1 0l-2.5 2.7a.75.75 0 00.04 1.06zm6.11-1.8a.75.75 0 00-1.5 0v10.5a.75.75 0 001.5 0V5zM8.5 15.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" clipRule="evenodd" />
                           </svg>
                         </button>
                       ) : (
                         <span className="text-slate-400">Sepolia Balance: {balance} USDC</span>
                       )}
                     </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <NetworkBadge network={TESTNET} />
                    <div className="flex-1 text-right">
                       <input 
                         type="number" 
                         value={amount}
                         onChange={(e) => setAmount(e.target.value)}
                         placeholder="0.00"
                         className="bg-transparent text-3xl font-mono text-white text-right w-full focus:outline-none placeholder:text-slate-600"
                         disabled={stage !== BridgeStage.IDLE && stage !== BridgeStage.FAILED}
                       />
                    </div>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex justify-center -my-3 relative z-10">
                   <div className="bg-slate-800 border border-slate-700 rounded-full p-2 shadow-lg">
                      <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                   </div>
                </div>

                {/* Destination */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-slate-400">To</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <NetworkBadge network={MAINNET} />
                    <div className="flex-1 text-right flex items-center justify-end gap-2">
                       <span className={`text-3xl font-mono ${amount ? 'text-white' : 'text-slate-600'}`}>
                         {amount || '0.00'}
                       </span>
                       <span className="text-xl font-medium text-slate-500">USDC</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* Action Button */}
             <div className="mt-8">
               {stage === BridgeStage.IDLE || stage === BridgeStage.FAILED ? (
                 <>
                   {/* Gas Sponsorship Toggle for IDLE state - ROBUST IMPLEMENTATION */}
                   <div className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${isSponsored ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-400'}`}>
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                   <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                               </svg>
                           </div>
                           <div className="flex flex-col">
                               <span className={`text-sm font-semibold ${isSponsored ? 'text-emerald-400' : 'text-slate-300'}`}>
                                 {isSponsored ? 'Gas Sponsorship Active' : 'Sponsor Gas Fees'}
                               </span>
                               <span className="text-xs text-slate-400">Pay 0 ETH for transactions</span>
                           </div>
                       </div>
                       
                       <ToggleSwitch checked={isSponsored} onChange={setIsSponsored} />
                   </div>

                   <button 
                     onClick={handleBridge}
                     disabled={!walletAddress || !amount} 
                     className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 relative overflow-hidden group ${
                       !walletAddress || !amount
                       ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                       : isWrongNetworkForStart
                         ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20' // Warning color if wrong network but active
                         : isSponsored
                           ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20'
                           : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5'
                     }`}
                   >
                     {!walletAddress 
                       ? 'Connect Wallet to Bridge' 
                       : isWrongNetworkForStart 
                         ? 'Switch to Sepolia to Start'
                         : isSponsored
                           ? 'Sign & Bridge (Gasless)'
                           : 'Bridge USDC (Testnet → Mainnet)'
                     }
                     
                     {/* Badge inside button */}
                     {isSponsored && walletAddress && !isWrongNetworkForStart && amount && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">
                          Gasless
                        </div>
                     )}
                   </button>
                 </>
               ) : (
                  <div className="space-y-4">
                    {/* Status Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-14 relative flex items-center justify-center overflow-hidden border border-slate-700">
                        {isProcessing && (
                          <div className="absolute inset-0 bg-indigo-600/10 animate-pulse"></div>
                        )}
                        <span className="relative z-10 font-semibold text-indigo-200 animate-pulse">{getButtonText()}</span>
                    </div>

                    {canMint && (
                      <div className="space-y-3">
                         <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-500 text-sm">
                            <div className="flex gap-2 items-start mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                <div>
                                   <strong>Mainnet Gas Required</strong>
                                   <p className="mt-1 text-amber-500/80 text-xs">Usually requires ETH. Enable sponsorship to skip fees.</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900/40 rounded-lg p-3 flex items-center justify-between">
                                 <span className={`font-medium ml-1 ${isSponsored ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {isSponsored ? 'Gas Sponsorship Active' : 'Sponsor Gas Fees'}
                                 </span>
                                 <ToggleSwitch checked={isSponsored} onChange={setIsSponsored} />
                            </div>
                         </div>
                         <button 
                           onClick={handleMint}
                           className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all relative overflow-hidden ${
                             isSponsored 
                               ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20' 
                               : 'bg-green-600 hover:bg-green-500 shadow-green-600/20'
                           }`}
                         >
                           {isSponsored ? 'Sign to Mint (Gasless)' : 'Mint on Mainnet'}
                           {isSponsored && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">
                                Free
                              </div>
                           )}
                         </button>
                      </div>
                    )}
                    
                    {stage === BridgeStage.COMPLETED && (
                      <button 
                        onClick={reset}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-slate-700 hover:bg-slate-600 text-white transition-all"
                      >
                        Start New Transfer
                      </button>
                    )}
                  </div>
               )}
             </div>

             {/* Footer Info */}
             <div className="mt-6 flex justify-between text-xs text-slate-500">
               <span>Network Fee: <span className={isSponsored ? "text-emerald-400 font-medium" : ""}>{isSponsored ? 'Sponsored (0 ETH)' : 'Standard (ETH Gas)'}</span></span>
               <span>Mode: Live Test (Simulated CCTP)</span>
             </div>
          </div>
        </div>

        {/* Right Col: Stats & Insights */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Auditor Panel */}
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl h-fit">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white">AI Security Auditor</h3>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4 min-h-[120px] text-sm leading-relaxed border border-slate-700/50">
               {stage === BridgeStage.IDLE ? (
                 <p className="text-slate-500 italic">
                   Connect your wallet and initiate a transaction. Gemini 2.5 Flash will analyze the transaction hash in real-time.
                 </p>
               ) : aiInsight ? (
                 <div className="animate-in fade-in duration-500">
                    <p className="text-slate-300">{aiInsight}</p>
                 </div>
               ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                    Analyzing transaction patterns...
                  </div>
               )}
            </div>
          </div>

          {/* Progress Tracker */}
          {stage !== BridgeStage.IDLE && (
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="font-semibold text-white mb-4">Transfer Progress</h3>
              <div className="relative pl-4 border-l-2 border-slate-700 space-y-6">
                 
                 {/* Step 1: Burn */}
                 <div className="relative">
                   <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${
                     burnTx ? 'bg-green-500 border-green-500' : 'bg-slate-900 border-indigo-500'
                   }`}></div>
                   <p className="text-sm font-medium text-slate-200">Burn on Sepolia</p>
                   {burnTx ? (
                     <a href={`https://sepolia.etherscan.io/tx/${burnTx}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline break-all block mt-1">Tx: {burnTx}</a>
                   ) : (
                     <span className="text-xs text-slate-500">Pending wallet signature...</span>
                   )}
                 </div>

                 {/* Step 2: Attestation */}
                 <div className="relative">
                   <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${
                     attestationSig ? 'bg-green-500 border-green-500' : (burnTx ? 'bg-slate-900 border-indigo-500 animate-pulse' : 'bg-slate-900 border-slate-600')
                   }`}></div>
                   <p className="text-sm font-medium text-slate-200">Circle Attestation</p>
                   {attestationSig ? (
                      <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <CheckCircleIcon className="w-3 h-3" /> Signed
                      </span>
                   ) : (
                     <span className="text-xs text-slate-500">
                       {burnTx ? 'Verifying on-chain events...' : 'Waiting for burn'}
                     </span>
                   )}
                 </div>

                 {/* Step 3: Mint */}
                 <div className="relative">
                   <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${
                     mintTx ? 'bg-green-500 border-green-500' : (attestationSig ? 'bg-slate-900 border-indigo-500' : 'bg-slate-900 border-slate-600')
                   }`}></div>
                   <p className="text-sm font-medium text-slate-200">Mint on Mainnet</p>
                   {mintTx ? (
                      <a href={`https://etherscan.io/tx/${mintTx}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline break-all block mt-1">Tx: {mintTx}</a>
                   ) : (
                      <span className="text-xs text-slate-500">Waiting for user signature...</span>
                   )}
                 </div>

              </div>
            </div>
          )}

          {/* Activity Chart */}
          <ActivityChart />

        </div>
      </main>

    </div>
  );
};

export default App;